import { ShardManager } from '@locon213/unicord';
import dotenv from 'dotenv';

dotenv.config();

const manager = new ShardManager({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  applicationId: process.env.DISCORD_CLIENT_ID, // Added applicationId
});
manager.spawn(2);