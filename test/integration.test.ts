import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UniCordBot,
  OAuth2,
  exchangeCodeForTokenNode,
  getUserAvatarURL,
  Permissions,
  hasPermission,
} from '../src/index';

describe('UniCord Integration Tests', () => {
  describe('Complete Bot Workflow', () => {
    let bot: UniCordBot;
    let mockRest: any;

    beforeEach(() => {
      bot = new UniCordBot({
        token: 'test-token',
        intents: 513,
        prefix: '!',
        mentionPrefix: true,
        handleAllMessages: true,
      });

      mockRest = {
        post: vi.fn().mockResolvedValue({ id: '123' }),
        put: vi.fn().mockResolvedValue({ id: '123' }),
        patch: vi.fn().mockResolvedValue({ id: '123' }),
        delete: vi.fn().mockResolvedValue(null),
        postFormData: vi.fn().mockResolvedValue({ id: '123' }),
      };

      (bot as any).rest = mockRest;
      (bot as any).user = {
        id: '987654321',
        username: 'TestBot',
        discriminator: '0001',
      };
    });

    it('should handle a complete interactive bot conversation', async () => {
      // Register commands and handlers
      const pingHandler = vi.fn(async (ctx) => {
        const embed = bot
          .createEmbed()
          .setTitle('Pong! 🏓')
          .setDescription('Bot is working correctly')
          .setColor(0x00ff00)
          .addField('Response Time', '42ms', true)
          .setTimestamp();

        const button = bot.createButton('Click Me', 'ping_button', 3); // Success style
        const actionRow = bot.createActionRow(button);

        await ctx.reply({
          embeds: [embed.toJSON()],
          components: [actionRow],
        });
      });

      const buttonHandler = vi.fn(async (ctx) => {
        await ctx.update({
          content: 'Button was clicked! ✅',
          components: [],
        });
      });

      const mentionHandler = vi.fn(async (ctx) => {
        await ctx.reply('You mentioned me! 👋');
      });

      bot.slash('ping', { description: 'Ping the bot' }, pingHandler);
      bot.button('ping_button', buttonHandler);
      bot.onMention(mentionHandler);

      // Test slash command interaction
      const slashInteraction = {
        id: '123',
        application_id: '456',
        type: 2,
        token: 'interaction_token',
        channel_id: '789',
        user: { id: '321', username: 'user' },
        data: { name: 'ping' },
      };

      await (bot as any).handleInteraction(slashInteraction);

      expect(pingHandler).toHaveBeenCalled();
      expect(mockRest.post).toHaveBeenCalledWith(
        '/interactions/123/interaction_token/callback',
        {
          type: 4, // ChannelMessageWithSource
          data: {
            embeds: [
              {
                title: 'Pong! 🏓',
                description: 'Bot is working correctly',
                color: 0x00ff00,
                fields: [
                  { name: 'Response Time', value: '42ms', inline: true },
                ],
                timestamp: expect.any(String),
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 3, // Success
                    label: 'Click Me',
                    custom_id: 'ping_button',
                  },
                ],
              },
            ],
          },
        },
      );

      // Test button interaction
      const buttonInteraction = {
        id: '456',
        application_id: '456',
        type: 3,
        token: 'button_token',
        channel_id: '789',
        user: { id: '321', username: 'user' },
        data: { custom_id: 'ping_button', component_type: 2 },
      };

      await (bot as any).handleInteraction(buttonInteraction);

      expect(buttonHandler).toHaveBeenCalled();
      expect(mockRest.post).toHaveBeenCalledWith(
        '/interactions/456/button_token/callback',
        {
          type: 7, // UpdateMessage
          data: {
            content: 'Button was clicked! ✅',
            components: [],
          },
        },
      );

      // Test mention handling
      const mentionMessage = {
        id: '789',
        channel_id: '456',
        author: { id: '321', username: 'user' },
        content: 'Hey <@987654321>, how are you?',
        mentions: [{ id: '987654321', username: 'TestBot' }],
        mention_roles: [],
        attachments: [],
      };

      await (bot as any).handleMessage(mentionMessage);

      expect(mentionHandler).toHaveBeenCalled();
    });

    it('should handle file uploads with rich content', async () => {
      const fileHandler = vi.fn(async (ctx) => {
        const fileData = {
          name: 'report.pdf',
          data: Buffer.from('PDF content here'),
          contentType: 'application/pdf',
        };

        await bot.uploadFile(
          ctx.message.channel_id,
          fileData,
          'Here is your report!',
        );
      });

      bot.command('upload', fileHandler);

      const uploadMessage = {
        id: '123',
        channel_id: '456',
        author: { id: '789', username: 'user' },
        content: '!upload',
        mentions: [],
        mention_roles: [],
        attachments: [],
      };

      await (bot as any).handleMessage(uploadMessage);

      expect(fileHandler).toHaveBeenCalled();
      expect(mockRest.postFormData).toHaveBeenCalled();
    });

    it('should handle middleware chain correctly', async () => {
      const executionOrder: string[] = [];

      // Authentication middleware
      bot.middleware(async (ctx, next) => {
        executionOrder.push('auth');
        if ((ctx as any).message?.author?.id === 'banned_user') {
          // Don't call next() to stop execution
          return;
        }
        await next();
      });

      // Logging middleware
      bot.middleware(async (ctx, next) => {
        executionOrder.push('logging');
        await next();
        executionOrder.push('logging_after');
      });

      const commandHandler = vi.fn(() => {
        executionOrder.push('command');
      });

      bot.command('test', commandHandler);

      // Test with allowed user
      const allowedMessage = {
        id: '123',
        channel_id: '456',
        author: { id: '789', username: 'user' },
        content: '!test',
        mentions: [],
        mention_roles: [],
        attachments: [],
      };

      await (bot as any).handleMessage(allowedMessage);

      expect(executionOrder).toEqual([
        'auth',
        'logging',
        'command',
        'logging_after',
      ]);
      expect(commandHandler).toHaveBeenCalled();

      // Reset for banned user test
      executionOrder.length = 0;
      commandHandler.mockClear();

      // Test with banned user
      const bannedMessage = {
        id: '124',
        channel_id: '456',
        author: { id: 'banned_user', username: 'banned' },
        content: '!test',
        mentions: [],
        mention_roles: [],
        attachments: [],
      };

      await (bot as any).handleMessage(bannedMessage);

      expect(executionOrder).toEqual(['auth']); // Should stop at auth
      expect(commandHandler).not.toHaveBeenCalled();
    });
  });

  describe('OAuth Integration Workflow', () => {
    it('should complete full OAuth flow with enhanced data', async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      // Mock token exchange
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: 'access_token_123',
              token_type: 'Bearer',
              expires_in: 3600,
              refresh_token: 'refresh_token_123',
              scope: 'identify email guilds connections',
            }),
        })
        // Mock user fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: '123456789',
              username: 'testuser',
              discriminator: '0001',
              global_name: 'Test User',
              email: 'test@example.com',
              avatar: 'a_animated_avatar_hash',
              verified: true,
            }),
        });

      const result = await exchangeCodeForTokenNode({
        clientId: 'client123',
        clientSecret: 'secret123',
        code: 'auth_code_received',
        redirectUri: 'http://localhost:3000/callback',
      });

      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');

      // Test utility functions with received user data
      const avatarUrl = getUserAvatarURL(result.user, 512);
      expect(avatarUrl).toBe(
        'https://cdn.discordapp.com/avatars/123456789/a_animated_avatar_hash.gif?size=512',
      );
    });

    it('should handle browser OAuth with scopes', async () => {
      const oauth = new OAuth2({
        clientId: 'client123',
        redirectUri: 'http://localhost:3000/callback',
        backendTokenURL: '/api/auth/discord',
      });

      // Mock browser APIs (simplified)
      const mockLocation = { href: '' };
      global.location = mockLocation;

      // Mock OAuth methods directly
      const loginBasicSpy = vi
        .spyOn(oauth, 'loginBasic')
        .mockImplementation(() => Promise.resolve());
      const loginFullProfileSpy = vi
        .spyOn(oauth, 'loginFullProfile')
        .mockImplementation(() => Promise.resolve());
      const loginForBotManagementSpy = vi
        .spyOn(oauth, 'loginForBotManagement')
        .mockImplementation(() => Promise.resolve());

      // Test different login methods
      await oauth.loginBasic();
      expect(loginBasicSpy).toHaveBeenCalled();

      await oauth.loginFullProfile();
      expect(loginFullProfileSpy).toHaveBeenCalled();

      await oauth.loginForBotManagement('8');
      expect(loginForBotManagementSpy).toHaveBeenCalledWith('8');
    });
  });

  describe('Permission and Guild Management', () => {
    it('should correctly check Discord permissions', () => {
      const adminGuild = {
        id: 'guild123',
        name: 'Admin Guild',
        icon: null,
        owner: false,
        permissions: '8', // Administrator
      };

      const moderatorGuild = {
        id: 'guild456',
        name: 'Moderator Guild',
        icon: 'guild_icon_hash',
        owner: false,
        permissions: '8192', // MANAGE_MESSAGES = 1 << 13 = 8192
      };

      const memberGuild = {
        id: 'guild789',
        name: 'Member Guild',
        icon: null,
        owner: false,
        permissions: '2048', // SEND_MESSAGES only
      };

      // Test admin permissions (should have all)
      expect(hasPermission(adminGuild, Permissions.ADMINISTRATOR)).toBe(true);
      expect(hasPermission(adminGuild, Permissions.MANAGE_GUILD)).toBe(true);
      expect(hasPermission(adminGuild, Permissions.MANAGE_MESSAGES)).toBe(true);

      // Test moderator permissions
      expect(hasPermission(moderatorGuild, Permissions.ADMINISTRATOR)).toBe(
        false,
      );
      expect(hasPermission(moderatorGuild, Permissions.MANAGE_MESSAGES)).toBe(
        true,
      );
      expect(hasPermission(moderatorGuild, Permissions.SEND_MESSAGES)).toBe(
        false,
      );

      // Test member permissions
      expect(hasPermission(memberGuild, Permissions.ADMINISTRATOR)).toBe(false);
      expect(hasPermission(memberGuild, Permissions.MANAGE_MESSAGES)).toBe(
        false,
      );
      expect(hasPermission(memberGuild, Permissions.SEND_MESSAGES)).toBe(true);
    });
  });

  describe('Complex Component Interactions', () => {
    it('should handle multi-step form with select menus and modals', async () => {
      const bot = new UniCordBot({
        token: 'test-token',
        intents: 513,
      });

      const mockRest = {
        post: vi.fn().mockResolvedValue({ id: '123' }),
      };

      (bot as any).rest = mockRest;

      // Step 1: Show initial form
      const startFormHandler = vi.fn(async (ctx) => {
        const selectMenu = bot.createStringSelect('category_select', [
          { label: 'Bug Report', value: 'bug', description: 'Report a bug' },
          {
            label: 'Feature Request',
            value: 'feature',
            description: 'Request a new feature',
          },
          {
            label: 'Question',
            value: 'question',
            description: 'Ask a question',
          },
        ]);

        const actionRow = bot.createActionRow(selectMenu);

        await ctx.reply({
          content: 'Please select a category for your submission:',
          components: [actionRow],
        });
      });

      // Step 2: Handle category selection
      const categoryHandler = vi.fn(async (ctx) => {
        const selectedCategory = ctx.values?.[0];

        await ctx.update({
          content: `You selected: ${selectedCategory}. Great! Your submission has been recorded.`,
          components: [],
        });
      });

      bot.slash('form', { description: 'Start a form' }, startFormHandler);
      bot.selectMenu('category_select', categoryHandler);

      // Test the workflow
      const formInteraction = {
        id: '123',
        application_id: '456',
        type: 2,
        token: 'form_token',
        channel_id: '789',
        user: { id: '321', username: 'user' },
        data: { name: 'form' },
      };

      await (bot as any).handleInteraction(formInteraction);

      expect(startFormHandler).toHaveBeenCalled();
      expect(mockRest.post).toHaveBeenCalledWith(
        '/interactions/123/form_token/callback',
        {
          type: 4,
          data: {
            content: 'Please select a category for your submission:',
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 3,
                    custom_id: 'category_select',
                    options: [
                      {
                        label: 'Bug Report',
                        value: 'bug',
                        description: 'Report a bug',
                      },
                      {
                        label: 'Feature Request',
                        value: 'feature',
                        description: 'Request a new feature',
                      },
                      {
                        label: 'Question',
                        value: 'question',
                        description: 'Ask a question',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      );

      // Test category selection
      const selectInteraction = {
        id: '456',
        application_id: '456',
        type: 3,
        token: 'select_token',
        channel_id: '789',
        user: { id: '321', username: 'user' },
        data: {
          custom_id: 'category_select',
          values: ['bug'],
        },
      };

      await (bot as any).handleInteraction(selectInteraction);

      expect(categoryHandler).toHaveBeenCalled();
      const ctx = categoryHandler.mock.calls[0][0];
      expect(ctx.values).toEqual(['bug']);
    });
  });

  describe('Real-world Bot Scenarios', () => {
    it('should handle a moderation bot workflow', async () => {
      const bot = new UniCordBot({
        token: 'mod-bot-token',
        intents: 513,
        prefix: '!',
        handleAllMessages: true,
      });

      const mockRest = {
        post: vi.fn().mockResolvedValue({ id: '123' }),
        delete: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue({}),
        patch: vi.fn().mockResolvedValue({}),
      };

      (bot as any).rest = mockRest;

      // Auto-moderation for bad words
      const autoModerationHandler = vi.fn(async (ctx) => {
        if (ctx.content.toLowerCase().includes('spam')) {
          await ctx.delete(); // Delete the message

          const embed = bot
            .createEmbed()
            .setTitle('⚠️ Message Removed')
            .setDescription(
              'Your message was removed for containing prohibited content.',
            )
            .setColor(0xff0000)
            .addField('User', ctx.author.username, true)
            .addField('Reason', 'Spam content', true)
            .setTimestamp();

          await ctx.send({
            embeds: [embed.toJSON()],
          });
        }
      });

      // Manual ban command
      const banCommandHandler = vi.fn(async (ctx) => {
        const userId = ctx.args[0];
        const reason = ctx.args.slice(1).join(' ') || 'No reason provided';

        // Simulate banning user
        await mockRest.put(`/guilds/${ctx.guild?.id}/bans/${userId}`, {
          reason: reason,
        });

        await ctx.reply(
          `✅ User <@${userId}> has been banned. Reason: ${reason}`,
        );
      });

      bot.onMessage(autoModerationHandler);
      bot.command('ban', banCommandHandler);

      // Test auto-moderation
      const spamMessage = {
        id: '123',
        channel_id: '456',
        author: { id: '789', username: 'spammer' },
        content: 'Check out this spam link!',
        mentions: [],
        mention_roles: [],
        attachments: [],
      };

      await (bot as any).handleMessage(spamMessage);

      expect(autoModerationHandler).toHaveBeenCalled();
      expect(mockRest.delete).toHaveBeenCalledWith(
        '/channels/456/messages/123',
      );

      // Test ban command
      const banMessage = {
        id: '124',
        channel_id: '456',
        guild_id: 'guild123',
        author: { id: '890', username: 'moderator' },
        content: '!ban 789 Spamming the server',
        mentions: [],
        mention_roles: [],
        attachments: [],
      };

      await (bot as any).handleMessage(banMessage);

      expect(banCommandHandler).toHaveBeenCalled();
      expect(mockRest.put).toHaveBeenCalledWith('/guilds/guild123/bans/789', {
        reason: 'Spamming the server',
      });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
