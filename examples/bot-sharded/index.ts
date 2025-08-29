import { ShardManager } from 'unicord';
import dotenv from 'dotenv';

dotenv.config();

const manager = new ShardManager({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
});
manager.spawn(2);
