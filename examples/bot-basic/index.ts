import { UniCordBot } from '@locon213/unicord';
import dotenv from 'dotenv';

dotenv.config();

const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  prefix: '!',
  applicationId: process.env.DISCORD_CLIENT_ID, // Added applicationId
});

bot.command('ping', (ctx) => ctx.reply('Pong!'));
bot.slash('ping', { description: 'Ping command' }, (ctx) => ctx.reply('Pong!'));

bot.start();