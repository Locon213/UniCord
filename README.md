# @locon213/unicord

🚀 **Universal Discord SDK & Framework** - Enhanced TypeScript library for Discord bots and OAuth2 integration with modern features and complete API coverage.

[![npm version](https://badge.fury.io/js/@locon213%2Funicord.svg)](https://badge.fury.io/js/@locon213/unicord)
[![npm downloads](https://img.shields.io/npm/dm/@locon213/unicord)](https://www.npmjs.com/package/@locon213/unicord)
[![npm downloads per week](https://img.shields.io/npm/dw/@locon213/unicord)](https://www.npmjs.com/package/@locon213/unicord)
[![GitHub stars](https://img.shields.io/github/stars/Locon213/UniCord)](https://github.com/Locon213/UniCord)
[![GitHub forks](https://img.shields.io/github/forks/Locon213/UniCord)](https://github.com/Locon213/UniCord)
[![GitHub issues](https://img.shields.io/github/issues/Locon213/UniCord)](https://github.com/Locon213/UniCord/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/Locon213/UniCord)](https://github.com/Locon213/UniCord/pulls)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://hub.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Discord.js Alternative](https://img.shields.io/badge/Discord.js-Alternative-orange)](https://discord.js.org/)

## 🎉 Version 0.1.3(1) Released!

**Thank you for 135+ weekly downloads!** 🎊 This "raw" library is growing fast thanks to our amazing community!

### ✨ What's New in 0.1.3(1)

- 🐛 **Critical Bug Fix** - Fixed issue where bots wouldn't start due to missing Application ID in initialization
- 📚 **Documentation Update** - Added information about Application ID requirement for bot initialization

### ✨ What's New in 0.1.3

- 🐳 **Complete Docker Support** - Multi-stage builds, Redis, PostgreSQL, Nginx, Prometheus monitoring
- 🤖 **Enhanced Bot API** - Full Discord.js-level functionality with improved command handling
- 🔧 **Fixed Message Reading** - Bots now properly read messages with prefixes like `!ping`
- 📚 **Improved Wiki** - Comprehensive documentation following industry standards
- ⚡ **Performance Improvements** - Better caching, rate limiting, and error handling
- 🎯 **New Bot Features** - Guild management, role management, webhook support, and more!

## ✨ Features

- 🤖 **Complete Bot Framework**: Text & slash commands, interactive components, file uploads
- 🔐 **Advanced OAuth2**: Full PKCE implementation with comprehensive user data extraction
- 🎛️ **Interactive Components**: Buttons, select menus, modals with easy API
- 📁 **File Handling**: Upload and manage files with rich content
- 🎨 **Rich Embeds**: Powerful embed builder with all Discord features
- 🔧 **Middleware System**: Advanced request processing and authentication
- 📚 **Full TypeScript**: 200+ interfaces for complete Discord API coverage
- ⚡ **Modern Stack**: TypeScript 5.7, ESLint 9, Vitest 2
- 🐳 **Docker Ready**: Complete containerization with monitoring and scaling
- 🚀 **Discord.js Alternative**: Comparable functionality with modern TypeScript design

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
  handleAllMessages: true,
  applicationId: process.env.DISCORD_CLIENT_ID, // Optional but recommended to prevent startup issues
});

// Text command with enhanced options
bot.command(
  'ping',
  async (ctx) => {
    await ctx.reply('🏓 Pong!');
  },
  {
    aliases: ['p', 'pingpong'],
    description: 'Check if the bot is alive',
    category: 'Utility',
  },
);

// Slash command with interactive components
bot.slash('hello', { description: 'Say hello with buttons' }, async (ctx) => {
  const embed = bot
    .createEmbed()
    .setTitle('Hello World!')
    .setDescription('Click a button below!')
    .setColor(0x00ff00);

  const button = bot.createButton(
    'Click me!',
    'hello_btn',
    ButtonStyle.Primary,
  );
  const row = bot.createActionRow(button);

  await ctx.reply({ embeds: [embed.toJSON()], components: [row] });
});

// Handle button interactions
bot.button('hello_btn', async (ctx) => {
  await ctx.update({ content: 'Button clicked! ✅', components: [] });
});

// Event handling
bot.onGuildMemberAdd(async (member) => {
  console.log(`Welcome ${member.user?.username} to the server!`);
});

bot.onMessageCreate(async (message) => {
  if (message.content.includes('hello')) {
    await bot.sendMessage(message.channel_id, 'Hello there! 👋');
  }
});

// Start the bot
bot.start();
```

### OAuth2 Integration

```typescript
import { OAuth2, exchangeCodeForTokenNode } from '@locon213/unicord';

// Browser OAuth2
const oauth = new OAuth2({
  clientId: 'your-client-id', // This is your Discord Application ID
  redirectUri: 'http://localhost:3000/callback',
  backendTokenURL: '/api/auth/discord',
});

// Different login scopes
await oauth.loginBasic(); // Basic user info
await oauth.loginFullProfile(); // User, email, guilds, connections

// Server-side token exchange
const result = await exchangeCodeForTokenNode({
  clientId: process.env.DISCORD_CLIENT_ID!, // Your Discord Application ID
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  code: authCode,
  redirectUri: redirectUri,
});
```

## 🐳 Docker Deployment

### Quick Start

```bash
# Build and run with Docker Compose
npm run docker:compose

# Or build manually
npm run docker:build
npm run docker:run
```

### Complete Stack

Our Docker setup includes:

- **Bot Service** - Multi-stage optimized build
- **Redis** - Caching and session storage
- **PostgreSQL** - Persistent data storage
- **Nginx** - Reverse proxy with SSL
- **Prometheus** - Monitoring and metrics

### Environment Variables

Create a `.env` file:

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id  # Your Discord Application ID
DISCORD_CLIENT_SECRET=your_client_secret
REDIS_PASSWORD=unicord123
POSTGRES_USER=unicord
POSTGRES_PASSWORD=unicord123
```

## 📚 Documentation

Complete documentation is available in the [WIKI](./WIKI/):

- [Getting Started](./WIKI/Getting-Started.md) - Setup and basic usage
- [Bot Commands](./WIKI/Bot-Commands.md) - Command handling and components
- [OAuth2 Integration](./WIKI/OAuth2-PKCE.md) - Authentication and user data
- [API Reference](./WIKI/API-Reference.md) - Complete API documentation
- [Sharding](./WIKI/Sharding.md) - Scaling for large bots
- [Docker Deployment](./WIKI/Docker-Deployment.md) - Container deployment guide

**📋 [View Changelog](./CHANGELOG.md) - See what's new in each version**

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
- `npm run docker:build` - Build Docker image
- `npm run docker:compose` - Start with Docker Compose

## 🚀 Performance & Scaling

- **Multi-stage Docker builds** for optimized images
- **Redis caching** for improved response times
- **PostgreSQL** for persistent data with proper indexing
- **Nginx** with rate limiting and SSL termination
- **Prometheus monitoring** for performance insights
- **Health checks** for all services
- **Auto-scaling** ready architecture

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📊 Statistics

- **Weekly Downloads**: 135+ (and growing!)
- **GitHub Stars**: Growing community
- **TypeScript Coverage**: 100%
- **API Coverage**: Discord.js equivalent
- **Performance**: Optimized for production

## 📝 License

MIT © [Locon213](https://github.com/Locon213)

---

**Made with ❤️ by the UniCord Community**
