# Sharding

Use the built-in manager to spawn shards in one process:
```ts
const manager = new ShardManager({ token, intents });
manager.spawn(2);
```
TODO: cross-process sharding and persistent sessions.
