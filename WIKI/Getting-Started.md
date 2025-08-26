# Getting Started with @locon213/unicord

@locon213/unicord is a powerful TypeScript framework for building Discord bots with modern features and a clean API.

## Installation

```bash
npm install @locon213/unicord
```

## Quick Start

```typescript
import { UniCordBot, ButtonStyle } from '@locon213/unicord';

const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513, // GUILDS + GUILD_MESSAGES
  prefix: '!',
  mentionPrefix: true,
  handleAllMessages: true
});

// Simple ping command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

// Slash command with buttons
bot.slash('hello', { description: 'Say hello' }, async (ctx) => {
  const embed = bot.createEmbed()
    .setTitle('Hello World!')
    .setColor(0x00ff00);
    
  const button = bot.createButton('Click me!', 'hello_btn', ButtonStyle.Primary);
  const row = bot.createActionRow(button);
  
  await ctx.reply({ embeds: [embed.toJSON()], components: [row] });
});

// Handle button clicks
bot.button('hello_btn', async (ctx) => {
  await ctx.update({ content: 'Button clicked! ✅' });
});

// Start the bot
bot.start();
```

## Key Features

- 🤖 **Text & Slash Commands**: Easy command registration with automatic sync
- 🎛️ **Interactive Components**: Buttons, select menus, and action rows
- 📁 **File Handling**: Upload and manage files with rich content
- 🎨 **Rich Embeds**: Powerful embed builder with all Discord features
- 🔐 **OAuth2 Integration**: Complete authentication system for web apps
- 🛡️ **Middleware System**: Advanced request processing and authentication
- 📊 **Full TypeScript**: Complete type safety with 200+ Discord API interfaces
- ⚡ **Modern Architecture**: Built with latest TypeScript, ESLint 9, Vitest 2

## Development

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd unicord
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the library:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

5. Check examples in `examples/` directory

## Next Steps

- [Bot Commands](Bot-Commands.md) - Learn about command handling
- [OAuth2 PKCE](OAuth2-PKCE.md) - Web application integration
- [Sharding](Sharding.md) - Scale your bot for large servers
