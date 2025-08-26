import { UniCordBot } from 'unicord';
import dotenv from 'dotenv';

dotenv.config();

const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  autoSyncCommands: true,
});

bot.slash('ping', { description: 'Ping command' }, (ctx) => ctx.reply('Pong!'));

bot.start().then(() => {
  if (process.env.GUILD_ID) {
    bot.syncCommands({ scope: 'guild', guildId: process.env.GUILD_ID });
  }
});
