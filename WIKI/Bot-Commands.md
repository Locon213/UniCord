# Bot Commands

Register text and slash commands:
```ts
bot.command('ping', ctx => ctx.reply('Pong'));
bot.slash('ping', { description: 'Ping' }, ctx => ctx.reply('Pong'));
```
Sync with Discord:
```ts
await bot.syncCommands({ scope: 'global' });
```
