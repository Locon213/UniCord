# Sharding

Sharding allows your bot to scale across multiple processes and handle large numbers of Discord servers.

## Built-in Shard Manager

Use the built-in manager to spawn shards in one process:

```typescript
import { ShardManager } from 'unicord';

const manager = new ShardManager({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  totalShards: 'auto', // Auto-calculate based on guild count
  shardsPerCluster: 1
});

// Spawn shards
await manager.spawn(2); // Spawn 2 shards

// Handle shard events
manager.on('shardReady', (shard) => {
  console.log(`Shard ${shard.id} is ready`);
});

manager.on('shardDisconnect', (shard) => {
  console.log(`Shard ${shard.id} disconnected`);
});
```

## Auto-Sharding

```typescript
const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  sharding: {
    mode: 'auto', // Automatically determine shard count
    shardsPerCluster: 1
  }
});

// Bot will automatically shard when needed
await bot.start();
```

## Manual Shard Configuration

```typescript
const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  sharding: {
    mode: 'manual',
    shardCount: 4,
    shardIds: [0, 1], // This process handles shards 0 and 1
    shardsPerCluster: 2
  }
});
```

## Cross-Process Sharding

*Coming in future versions*: Cross-process sharding with IPC communication and persistent sessions.

## Shard Statistics

```typescript
// Get shard information
const shardInfo = manager.getShardInfo();
console.log(`Total shards: ${shardInfo.total}`);
console.log(`Ready shards: ${shardInfo.ready}`);

// Get individual shard stats
manager.shards.forEach(shard => {
  console.log(`Shard ${shard.id}: ${shard.guilds.size} guilds, ${shard.ping}ms ping`);
});
```

## Best Practices

1. **Start with auto-sharding**: Let Discord determine the optimal shard count
2. **Monitor shard health**: Watch for disconnections and high latency
3. **Plan for growth**: Consider your bot's growth trajectory when designing sharding
4. **Load balancing**: Distribute shards evenly across available resources

## When to Shard

- **2,500+ guilds**: Discord requires sharding at this point
- **High message volume**: Even with fewer guilds, high activity may benefit from sharding
- **Resource limits**: Distribute load across multiple processes/servers

## Roadmap

- [ ] Cross-process sharding with IPC
- [ ] Persistent session management
- [ ] Advanced load balancing
- [ ] Shard-aware caching
- [ ] Cluster management tools
