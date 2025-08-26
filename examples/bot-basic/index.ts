import { UniCordBot } from 'unicord';
import dotenv from 'dotenv';

dotenv.config();

const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  prefix: '!',
});

bot.command('ping', (ctx) => ctx.reply('Pong!'));
bot.slash('ping', { description: 'Ping command' }, (ctx) => ctx.reply('Pong!'));

bot.start();
