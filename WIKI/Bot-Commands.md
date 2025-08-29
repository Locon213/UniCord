# Bot Commands Guide

This guide covers all aspects of bot command handling in UniCord, from basic text commands to advanced interactive components.

## 🚀 Quick Start

### Basic Bot Setup

```typescript
import { UniCordBot } from '@locon213/unicord';

const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513, // GUILDS + GUILD_MESSAGES
  prefix: '!',
  mentionPrefix: true,
  handleAllMessages: true,
});

bot.start();
```

## 📝 Text Commands

### Basic Command Registration

```typescript
// Simple command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

// Command with options
bot.command(
  'kick',
  async (ctx) => {
    const user = ctx.mentions[0];
    if (!user) {
      await ctx.reply('Please mention a user to kick!');
      return;
    }
    await ctx.reply(`Kicked ${user.username}!`);
  },
  {
    aliases: ['boot', 'remove'],
    description: 'Kick a user from the server',
    category: 'Moderation',
    permissions: ['KICK_MEMBERS'],
  },
);
```

### Command Options

```typescript
interface CommandOptions {
  aliases?: string[]; // Alternative command names
  cooldown?: number; // Cooldown in milliseconds
  description?: string; // Command description
  usage?: string; // Usage examples
  category?: string; // Command category
  permissions?: string[]; // Required permissions
  guildOnly?: boolean; // Server-only command
  dmOnly?: boolean; // DM-only command
}
```

### Advanced Command Examples

```typescript
// Command with arguments and mentions
bot.command(
  'ban',
  async (ctx) => {
    const user = ctx.mentions[0];
    const reason = ctx.args.join(' ') || 'No reason provided';

    if (!user) {
      await ctx.reply('Please mention a user to ban!');
      return;
    }

    // Check permissions
    if (!ctx.member?.permissions?.includes('BAN_MEMBERS')) {
      await ctx.reply('You need BAN_MEMBERS permission!');
      return;
    }

    await ctx.reply(`Banned ${user.username} for: ${reason}`);
  },
  {
    aliases: ['banuser', 'banhammer'],
    description: 'Ban a user from the server',
    category: 'Moderation',
    permissions: ['BAN_MEMBERS'],
    usage: '!ban @user [reason]',
  },
);

// Command with cooldown
bot.command(
  'daily',
  async (ctx) => {
    const reward = Math.floor(Math.random() * 100) + 50;
    await ctx.reply(`🎁 Daily reward: ${reward} coins!`);
  },
  {
    cooldown: 86400000, // 24 hours
    description: 'Claim daily reward',
    category: 'Economy',
  },
);

// Guild-only command
bot.command(
  'serverinfo',
  async (ctx) => {
    if (!ctx.guild) {
      await ctx.reply('This command can only be used in servers!');
      return;
    }

    const embed = bot
      .createEmbed()
      .setTitle(`${ctx.guild.name} Server Information`)
      .addField(
        'Members',
        ctx.guild.member_count?.toString() || 'Unknown',
        true,
      )
      .addField('Owner', `<@${ctx.guild.owner_id}>`, true)
      .setColor(0x00ff00);

    await ctx.reply({ embeds: [embed.toJSON()] });
  },
  {
    guildOnly: true,
    description: 'Show server information',
    category: 'Information',
  },
);
```

## 🎛️ Slash Commands

### Basic Slash Command

```typescript
bot.slash(
  'ping',
  {
    description: 'Check bot latency',
    type: 1,
  },
  async (ctx) => {
    const start = Date.now();
    await ctx.reply('🏓 Pong!');
    const end = Date.now();

    await ctx.editReply(`🏓 Pong! Latency: ${end - start}ms`);
  },
);
```

### Slash Command with Options

```typescript
bot.slash(
  'userinfo',
  {
    description: 'Get information about a user',
    type: 1,
    options: [
      {
        name: 'user',
        description: 'The user to get info about',
        type: 6, // USER type
        required: false,
      },
    ],
  },
  async (ctx) => {
    const targetUser = ctx.options.get('user') || ctx.user;
    const member = ctx.member;

    const embed = bot
      .createEmbed()
      .setTitle(`${targetUser.username}'s Information`)
      .setThumbnail(
        `https://cdn.discordapp.com/avatars/${targetUser.id}/${targetUser.avatar}.png`,
      )
      .addField('User ID', targetUser.id, true)
      .addField('Username', targetUser.username, true)
      .addField('Discriminator', targetUser.discriminator || 'N/A', true);

    if (member) {
      embed.addField(
        'Joined Server',
        new Date(member.joined_at!).toLocaleDateString(),
        true,
      );
      embed.addField('Nickname', member.nick || 'None', true);
      embed.addField(
        'Roles',
        member.roles?.length ? member.roles.length.toString() : '0',
        true,
      );
    }

    embed.setColor(0x00ff00).setTimestamp();

    await ctx.reply({ embeds: [embed.toJSON()] });
  },
);
```

### Slash Command Types

```typescript
// Application Command Types
const COMMAND_TYPES = {
  CHAT_INPUT: 1, // Slash command
  USER: 2, // User context menu
  MESSAGE: 3, // Message context menu
};

// Option Types
const OPTION_TYPES = {
  SUB_COMMAND: 1, // Subcommand
  SUB_COMMAND_GROUP: 2, // Subcommand group
  STRING: 3, // String option
  INTEGER: 4, // Integer option
  BOOLEAN: 5, // Boolean option
  USER: 6, // User option
  CHANNEL: 7, // Channel option
  ROLE: 8, // Role option
  MENTIONABLE: 9, // Mentionable option
  NUMBER: 10, // Number option
  ATTACHMENT: 11, // File attachment
};
```

## 🎮 Interactive Components

### Buttons

```typescript
// Create buttons
const confirmBtn = bot.createButton(
  '✅ Confirm',
  'confirm_action',
  ButtonStyle.Primary,
);
const cancelBtn = bot.createButton(
  '❌ Cancel',
  'cancel_action',
  ButtonStyle.Danger,
);
const linkBtn = bot.createLinkButton(
  '🔗 Documentation',
  'https://docs.unicord.dev',
);

// Button styles
const BUTTON_STYLES = {
  Primary: 1, // Blue
  Secondary: 2, // Gray
  Success: 3, // Green
  Danger: 4, // Red
  Link: 5, // URL button
};

// Handle button clicks
bot.button('confirm_action', async (ctx) => {
  await ctx.update({
    content: '✅ Action confirmed!',
    components: [],
  });
});

bot.button('cancel_action', async (ctx) => {
  await ctx.update({
    content: '❌ Action cancelled.',
    components: [],
  });
});
```

### Select Menus

```typescript
// Create select menu
const categorySelect = bot.createStringSelect('category', [
  { label: '🐛 Bug Report', value: 'bug', description: 'Report a bug' },
  {
    label: '💡 Feature Request',
    value: 'feature',
    description: 'Request a feature',
  },
  { label: '❓ Question', value: 'question', description: 'Ask a question' },
]);

// Handle select menu
bot.selectMenu('category', async (ctx) => {
  const selected = ctx.values?.[0];
  const responses = {
    bug: '🐛 Thank you for reporting a bug!',
    feature: '💡 Thank you for the feature request!',
    question: '❓ Thank you for your question!',
  };

  await ctx.update({
    content:
      responses[selected as keyof typeof responses] || 'Invalid selection',
    components: [],
  });
});
```

### Action Rows

```typescript
// Create action rows
const buttonRow = bot.createActionRow(confirmBtn, cancelBtn);
const selectRow = bot.createActionRow(categorySelect);

// Send with components
await ctx.reply({
  content: 'Choose an option:',
  components: [buttonRow, selectRow],
});
```

## 🔧 Command Context

### Message Context

```typescript
interface MessageContext {
  message: DiscordMessage; // Original message
  author: DiscordUser; // Message author
  member?: DiscordMember; // Guild member info
  channel: DiscordChannel; // Channel info
  guild?: any; // Guild info
  content: string; // Message content
  mentions: DiscordUser[]; // Mentioned users
  mentionedRoles: string[]; // Mentioned roles
  attachments: any[]; // File attachments
  args: string[]; // Command arguments
  bot: UniCordBot; // Bot instance

  // Methods
  reply(content: string | MessagePayload): Promise<any>;
  send(content: string | MessagePayload): Promise<any>;
  react(emoji: string): Promise<any>;
  edit(messageId: string, content: string | MessagePayload): Promise<any>;
  delete(messageId?: string): Promise<any>;
}
```

### Interaction Context

```typescript
interface InteractionContext {
  interaction: DiscordInteraction; // Interaction object
  user: DiscordUser; // User who triggered
  member?: DiscordMember; // Guild member info
  channel: DiscordChannel; // Channel info
  guild?: any; // Guild info
  options: Map<string, any>; // Command options
  bot: UniCordBot; // Bot instance

  // Methods
  reply(content: string | MessagePayload): Promise<any>;
  editReply(content: string | MessagePayload): Promise<any>;
  deleteReply(): Promise<any>;
  followUp(content: string | MessagePayload): Promise<any>;
  defer(ephemeral?: boolean): Promise<any>;
  showModal(
    title: string,
    customId: string,
    components: DiscordActionRow[],
  ): Promise<any>;
}
```

## 🎯 Advanced Features

### Command Cooldowns

```typescript
// Implement cooldown system
const cooldowns = new Map<string, Map<string, number>>();

bot.command(
  'expensive',
  async (ctx) => {
    const cooldown = 5000; // 5 seconds
    const now = Date.now();
    const timestamps = cooldowns.get('expensive') || new Map();
    const cooldownAmount = cooldown;

    if (timestamps.has(ctx.author.id)) {
      const expirationTime = timestamps.get(ctx.author.id)! + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        await ctx.reply(
          `⏰ Please wait ${timeLeft.toFixed(1)} seconds before using this command again.`,
        );
        return;
      }
    }

    timestamps.set(ctx.author.id, now);
    cooldowns.set('expensive', timestamps);

    // Command logic here
    await ctx.reply('Expensive operation completed!');
  },
  {
    cooldown: 5000,
    description: 'Expensive operation with cooldown',
  },
);
```

### Permission Checking

```typescript
// Check user permissions
bot.command(
  'admin',
  async (ctx) => {
    if (!ctx.member) {
      await ctx.reply('This command can only be used in servers!');
      return;
    }

    const requiredPermissions = ['ADMINISTRATOR', 'MANAGE_GUILD'];
    const hasPermission = requiredPermissions.some((perm) =>
      ctx.member.permissions?.includes(perm),
    );

    if (!hasPermission) {
      await ctx.reply(
        '❌ You need administrator permissions to use this command!',
      );
      return;
    }

    await ctx.reply('✅ Admin command executed!');
  },
  {
    permissions: ['ADMINISTRATOR'],
    description: 'Admin-only command',
  },
);
```

### Error Handling

```typescript
// Global error handler
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

// Command error handling
bot.command('risky', async (ctx) => {
  try {
    // Risky operation
    const result = await someRiskyOperation();
    await ctx.reply(`✅ Operation successful: ${result}`);
  } catch (error) {
    console.error('Command error:', error);
    await ctx.reply('❌ An error occurred while executing this command.');
  }
});

// Middleware for error handling
bot.middleware(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error(`Error in command ${ctx.content}:`, error);

    if ('reply' in ctx) {
      await ctx.reply('❌ An error occurred while executing this command.');
    }
  }
});
```

## 📊 Command Statistics

### Track Command Usage

```typescript
const commandStats = new Map<string, { uses: number; lastUsed: number }>();

bot.middleware(async (ctx, next) => {
  const commandName = ctx.content?.split(' ')[0]?.slice(1) || 'unknown';

  if (!commandStats.has(commandName)) {
    commandStats.set(commandName, { uses: 0, lastUsed: 0 });
  }

  const stats = commandStats.get(commandName)!;
  stats.uses++;
  stats.lastUsed = Date.now();

  await next();
});

// Command to show statistics
bot.command('stats', async (ctx) => {
  const embed = bot
    .createEmbed()
    .setTitle('📊 Command Statistics')
    .setColor(0x00ff00);

  for (const [command, stats] of commandStats.entries()) {
    embed.addField(
      command,
      `Uses: ${stats.uses}\nLast used: ${new Date(stats.lastUsed).toLocaleString()}`,
      true,
    );
  }

  await ctx.reply({ embeds: [embed.toJSON()] });
});
```

## 🔄 Command Syncing

### Auto-sync Commands

```typescript
// Enable auto-sync in bot options
const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  autoSyncCommands: true, // Automatically sync slash commands
});

// Manual sync
await bot.syncCommands({ scope: 'global' });
await bot.syncCommands({ scope: 'guild', guildId: '123456789' });
```

## 📚 Best Practices

1. **Always check permissions** before executing sensitive commands
2. **Use cooldowns** for expensive operations
3. **Handle errors gracefully** with try-catch blocks
4. **Validate input** before processing commands
5. **Use descriptive command names** and help text
6. **Implement logging** for debugging and monitoring
7. **Group related commands** into categories
8. **Provide helpful error messages** to users

## 🎯 Next Steps

- [Interactive Components](./Interactive-Components.md) - Advanced UI components
- [Event Handling](./Event-Handling.md) - Bot events and listeners
- [Middleware](./Middleware.md) - Request processing pipeline
- [Permissions](./Permissions.md) - Advanced permission system

---

**Happy coding with UniCord! 🚀**
