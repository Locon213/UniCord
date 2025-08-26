# UniCord

Universal Discord SDK & Framework. v0.2 adds full bot runtime with Gateway, slash/text commands, sharding and auto-publish.

## Quick Start
```bash
npm install
npm run build
npm test
```

### Creating a Bot
```ts
import { UniCordBot } from 'unicord';
const bot = new UniCordBot({ token: '<TOKEN>', intents: 513, prefix: '!' });
bot.command('ping', ctx => ctx.reply('Pong!'));
bot.start();
```

### Sync Slash Commands
```ts
bot.slash('ping', { description: 'Ping' }, ctx => ctx.reply('Pong!'));
await bot.syncCommands({ scope: 'guild', guildId: '<GUILD_ID>' });
```

See `examples/` for more.

## Secrets
Set GitHub repository secrets:
- `NPM_TOKEN` – npm publish token.
- `DISCORD_TOKEN` – bot token for tests/examples.
GitHub provides `GITHUB_TOKEN` automatically.

## Release
Local release:
```bash
npm run release # bumps patch version and pushes tags
```
Publishing via GitHub Actions happens on tag `v*` pushes.

## Docker
```bash
docker build -t unicord .
docker compose up -d
```

## License
MIT
