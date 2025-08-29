# Getting Started with UniCord

Welcome to UniCord! This guide will help you get started with building Discord bots and OAuth2 applications using our modern TypeScript library.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Discord Application** with bot token
- **TypeScript** knowledge (basic)

### Installation

```bash
npm install @locon213/unicord
```

### Basic Bot Setup

Create a new file `bot.ts`:

```typescript
import { UniCordBot } from '@locon213/unicord';

const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513, // GUILDS + GUILD_MESSAGES
  prefix: '!',
  mentionPrefix: true,
  handleAllMessages: true,
});

// Simple ping command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

// Start the bot
bot.start();
```

Create a `.env` file:

```env
DISCORD_TOKEN=your_bot_token_here
```

Run your bot:

```bash
npx tsx bot.ts
```

## 🤖 Bot Configuration

### Bot Options

```typescript
interface BotOptions {
  token: string; // Discord bot token
  intents: number; // Gateway intents
  prefix?: string; // Command prefix (e.g., '!')
  shardCount?: number; // Number of shards for scaling
  autoSyncCommands?: boolean; // Auto-sync slash commands
  mentionPrefix?: boolean; // Allow @bot command
  handleAllMessages?: boolean; // Process all messages
}
```

### Gateway Intents

```typescript
// Common intent combinations
const INTENTS = {
  GUILDS: 1 << 0, // 1
  GUILD_MEMBERS: 1 << 1, // 2
  GUILD_BANS: 1 << 2, // 4
  GUILD_EMOJIS_AND_STICKERS: 1 << 3, // 8
  GUILD_INTEGRATIONS: 1 << 4, // 16
  GUILD_WEBHOOKS: 1 << 5, // 32
  GUILD_INVITES: 1 << 6, // 64
  GUILD_VOICE_STATES: 1 << 7, // 128
  GUILD_PRESENCES: 1 << 8, // 256
  GUILD_MESSAGES: 1 << 9, // 512
  GUILD_MESSAGE_REACTIONS: 1 << 10, // 1024
  GUILD_MESSAGE_TYPING: 1 << 11, // 2048
  DIRECT_MESSAGES: 1 << 12, // 4096
  DIRECT_MESSAGE_REACTIONS: 1 << 13, // 8192
  DIRECT_MESSAGE_TYPING: 1 << 14, // 16384
  MESSAGE_CONTENT: 1 << 15, // 32768
  GUILD_SCHEDULED_EVENTS: 1 << 16, // 65536
  AUTO_MODERATION_CONFIGURATION: 1 << 20, // 1048576
  AUTO_MODERATION_EXECUTION: 1 << 21, // 2097152
};

// Example: Bot that can read messages and manage guilds
const botIntents =
  INTENTS.GUILDS | INTENTS.GUILD_MESSAGES | INTENTS.MESSAGE_CONTENT;
```

## 📝 Command System

### Text Commands

```typescript
// Basic command
bot.command('hello', async (ctx) => {
  await ctx.reply(`Hello ${ctx.author.username}!`);
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

    // Kick logic here
    await ctx.reply(`Kicked ${user.username}!`);
  },
  {
    aliases: ['boot', 'remove'],
    description: 'Kick a user from the server',
    category: 'Moderation',
    permissions: ['KICK_MEMBERS'],
  },
);

// Command with arguments
bot.command('ban', async (ctx) => {
  const user = ctx.mentions[0];
  const reason = ctx.args.join(' ') || 'No reason provided';

  if (!user) {
    await ctx.reply('Please mention a user to ban!');
    return;
  }

  await ctx.reply(`Banned ${user.username} for: ${reason}`);
});
```

### Slash Commands

```typescript
// Basic slash command
bot.slash(
  'ping',
  {
    description: 'Check bot latency',
    type: 1,
  },
  async (ctx) => {
    await ctx.reply('🏓 Pong!');
  },
);

// Slash command with options
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
    const embed = bot
      .createEmbed()
      .setTitle(`${targetUser.username}'s Info`)
      .setDescription(`User ID: ${targetUser.id}`)
      .setColor(0x00ff00);

    await ctx.reply({ embeds: [embed.toJSON()] });
  },
);
```

## 🎛️ Interactive Components

### Buttons

```typescript
bot.slash(
  'menu',
  {
    description: 'Show interactive menu',
    type: 1,
  },
  async (ctx) => {
    const button1 = bot.createButton('Click Me!', 'btn_1', ButtonStyle.Primary);
    const button2 = bot.createButton('Danger!', 'btn_2', ButtonStyle.Danger);
    const row = bot.createActionRow(button1, button2);

    await ctx.reply({
      content: 'Choose an option:',
      components: [row],
    });
  },
);

// Handle button clicks
bot.button('btn_1', async (ctx) => {
  await ctx.update({ content: 'Button 1 clicked! ✅', components: [] });
});

bot.button('btn_2', async (ctx) => {
  await ctx.update({ content: 'Button 2 clicked! ⚠️', components: [] });
});
```

### Select Menus

```typescript
bot.slash(
  'select',
  {
    description: 'Show select menu',
    type: 1,
  },
  async (ctx) => {
    const select = bot.createStringSelect('choice', [
      { label: 'Option 1', value: 'opt1', description: 'First option' },
      { label: 'Option 2', value: 'opt2', description: 'Second option' },
      { label: 'Option 3', value: 'opt3', description: 'Third option' },
    ]);

    const row = bot.createActionRow(select);

    await ctx.reply({
      content: 'Select an option:',
      components: [row],
    });
  },
);

// Handle select menu
bot.selectMenu('choice', async (ctx) => {
  const selected = ctx.values?.[0];
  await ctx.update({ content: `You selected: ${selected}!`, components: [] });
});
```

## 🔐 OAuth2 Integration

### Browser OAuth2

```typescript
import { OAuth2 } from '@locon213/unicord';

const oauth = new OAuth2({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
  backendTokenURL: '/api/auth/discord',
});

// Different login scopes
await oauth.loginBasic(); // Basic user info
await oauth.loginFullProfile(); // User, email, guilds, connections
await oauth.loginGuilds(); // User guilds only
```

### Server-side Token Exchange

```typescript
import { exchangeCodeForTokenNode } from '@locon213/unicord';

const result = await exchangeCodeForTokenNode({
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  code: authCode,
  redirectUri: redirectUri,
});

console.log('User:', result.user);
console.log('Access Token:', result.access_token);
```

## 🐳 Docker Deployment

### Quick Docker Setup

```bash
# Build and run
npm run docker:build
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

### Environment Variables

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
REDIS_PASSWORD=unicord123
POSTGRES_USER=unicord
POSTGRES_PASSWORD=unicord123
```

## 📚 Next Steps

- [Bot Commands](./Bot-Commands.md) - Advanced command handling
- [OAuth2 Integration](./OAuth2-PKCE.md) - Complete authentication guide
- [API Reference](./API-Reference.md) - Full API documentation
- [Sharding](./Sharding.md) - Scale your bot
- [Docker Deployment](./Docker-Deployment.md) - Production deployment

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/Locon213/UniCord/issues)
- **Discord Server**: Join our community
- **Documentation**: Check the [Wiki](./) for detailed guides
- **Examples**: See [examples/](../examples/) folder

## 🎯 Best Practices

1. **Environment Variables**: Never hardcode tokens
2. **Error Handling**: Always wrap commands in try-catch
3. **Rate Limiting**: Respect Discord's rate limits
4. **Permissions**: Check user permissions before actions
5. **Logging**: Use proper logging for debugging
6. **Testing**: Test your bot thoroughly before deployment

Happy coding! 🚀
