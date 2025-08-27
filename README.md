# @locon213/unicord

🚀 **Universal Discord SDK & Framework** - Enhanced TypeScript library for Discord bots and OAuth2 integration with modern features and complete API coverage.

[![npm version](https://badge.fury.io/js/@locon213%2Funicord.svg)](https://badge.fury.io/js/@locon213%2Funicord)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🤖 **Complete Bot Framework**: Text & slash commands, interactive components, file uploads
- 🔐 **Advanced OAuth2**: Full PKCE implementation with comprehensive user data extraction
- 🎛️ **Interactive Components**: Buttons, select menus, modals with easy API
- 📁 **File Handling**: Upload and manage files with rich content
- 🎨 **Rich Embeds**: Powerful embed builder with all Discord features
- 🔧 **Middleware System**: Advanced request processing and authentication
- 📚 **Full TypeScript**: 200+ interfaces for complete Discord API coverage
- ⚡ **Modern Stack**: TypeScript 5.7, ESLint 9, Vitest 2

## 📦 Installation

```bash
npm install @locon213/unicord
```

## 🚀 Quick Start

### Basic Bot Setup
```typescript
import { UniCordBot, ButtonStyle } from '@locon213/unicord';

const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513, // GUILDS + GUILD_MESSAGES
  prefix: '!',
  mentionPrefix: true,
  handleAllMessages: true
});

// Text command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

// Slash command with interactive components
bot.slash('hello', { description: 'Say hello with buttons' }, async (ctx) => {
  const embed = bot.createEmbed()
    .setTitle('Hello World!')
    .setDescription('Click a button below!')
    .setColor(0x00ff00);
    
  const button = bot.createButton('Click me!', 'hello_btn', ButtonStyle.Primary);
  const row = bot.createActionRow(button);
  
  await ctx.reply({ embeds: [embed.toJSON()], components: [row] });
});

// Handle button interactions
bot.button('hello_btn', async (ctx) => {
  await ctx.update({ content: 'Button clicked! ✅', components: [] });
});

// Start the bot
bot.start();
```

### OAuth2 Integration
```typescript
import { OAuth2, exchangeCodeForTokenNode } from '@locon213/unicord';

// Browser OAuth2
const oauth = new OAuth2({
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
  backendTokenURL: '/api/auth/discord'
});

// Different login scopes
await oauth.loginBasic(); // Basic user info
await oauth.loginFullProfile(); // User, email, guilds, connections

// Server-side token exchange
const result = await exchangeCodeForTokenNode({
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  code: authCode,
  redirectUri: redirectUri
});
```

## 📚 Documentation

Complete documentation is available in the [WIKI](./WIKI/):

- [Getting Started](./WIKI/Getting-Started.md) - Setup and basic usage
- [Bot Commands](./WIKI/Bot-Commands.md) - Command handling and components  
- [OAuth2 Integration](./WIKI/OAuth2-PKCE.md) - Authentication and user data
- [API Reference](./WIKI/API-Reference.md) - Complete API documentation
- [Sharding](./WIKI/Sharding.md) - Scaling for large bots

## 🛠️ Development

```bash
git clone https://github.com/Locon213/UniCord.git
cd UniCord
npm install
npm run build
npm test
```

**Commands:**
- `npm run build` - Build the library
- `npm run dev` - Watch mode for development
- `npm run test` - Run tests
- `npm run lint` - Check code quality

## 🐳 Docker

```bash
docker build -t @locon213/unicord .
docker compose up -d
```

## 📝 License

MIT © [Locon213](https://github.com/Locon213)
