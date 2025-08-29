import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UniCordBot } from '../src/index';

describe('UniCordBot Enhanced Features', () => {
  let bot: UniCordBot;
  let mockRestPost: any;
  let mockRestPut: any;
  let mockRestPostFormData: any;

  beforeEach(() => {
    bot = new UniCordBot({
      token: 'test-token',
      intents: 513, // GUILDS + GUILD_MESSAGES
      prefix: '!',
      mentionPrefix: true,
      handleAllMessages: true,
    });

    // Mock REST client methods
    mockRestPost = vi.fn().mockResolvedValue({ id: '123' });
    mockRestPut = vi.fn().mockResolvedValue({ id: '123' });
    mockRestPostFormData = vi.fn().mockResolvedValue({ id: '123' });

    (bot as any).rest = {
      post: mockRestPost,
      put: mockRestPut,
      postFormData: mockRestPostFormData,
      patch: vi.fn().mockResolvedValue({ id: '123' }),
      delete: vi.fn().mockResolvedValue(null),
    };

    (bot as any).user = {
      id: '987654321',
      username: 'TestBot',
      discriminator: '0001',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Creation', () => {
    it('should create buttons correctly', () => {
      const button = bot.createButton('Click Me', 'test_button', 1); // Primary style

      expect(button).toEqual({
        type: 2,
        style: 1, // Primary
        label: 'Click Me',
        custom_id: 'test_button',
      });
    });

    it('should create action rows', () => {
      const button1 = bot.createButton('Button 1', 'btn1');
      const button2 = bot.createButton('Button 2', 'btn2');

      const actionRow = bot.createActionRow(button1, button2);

      expect(actionRow).toEqual({
        type: 1,
        components: [button1, button2],
      });
    });
  });

  describe('Command Registration', () => {
    it('should register text commands', () => {
      const handler = vi.fn();
      bot.command('test', handler);

      expect((bot as any).commands.has('test')).toBe(true);
    });

    it('should register component handlers', () => {
      const handler = vi.fn();
      bot.component('test_button', handler);

      expect((bot as any).components.has('test_button')).toBe(true);
    });
  });

  describe('Message Handling', () => {
    it('should handle prefix commands', async () => {
      const handler = vi.fn();
      bot.command('test', handler);

      const mockMessage = {
        id: '123',
        channel_id: '456',
        author: { id: '789', username: 'user' },
        content: '!test arg1 arg2',
        mentions: [],
        mention_roles: [],
        attachments: [],
      };

      await (bot as any).handleMessage(mockMessage);

      expect(handler).toHaveBeenCalled();
      const ctx = handler.mock.calls[0][0];
      expect(ctx.args).toEqual(['arg1', 'arg2']);
    });
  });

  describe('File Upload', () => {
    it('should upload files correctly', async () => {
      const fileData = {
        name: 'test.txt',
        data: Buffer.from('Hello World'),
        contentType: 'text/plain',
      };

      await bot.uploadFile('123', fileData, 'Here is the file');

      expect(mockRestPostFormData).toHaveBeenCalled();
      const [path, formData] = mockRestPostFormData.mock.calls[0];
      expect(path).toBe('/channels/123/messages');
      expect(formData).toBeInstanceOf(FormData);
    });
  });

  describe('Embed Builder', () => {
    it('should create embeds correctly', () => {
      const embed = bot
        .createEmbed()
        .setTitle('Test Title')
        .setDescription('Test Description')
        .setColor(0x00ff00)
        .addField('Field 1', 'Value 1', true)
        .setFooter('Footer text');

      const embedData = embed.toJSON();

      expect(embedData.title).toBe('Test Title');
      expect(embedData.description).toBe('Test Description');
      expect(embedData.color).toBe(0x00ff00);
      expect(embedData.fields).toHaveLength(1);
      expect(embedData.fields![0]).toEqual({
        name: 'Field 1',
        value: 'Value 1',
        inline: true,
      });
      expect(embedData.footer?.text).toBe('Footer text');
    });
  });
});
