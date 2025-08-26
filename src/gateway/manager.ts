import { Shard } from './shard';
import { GatewayOptions } from './gateway';

// TODO: advanced sharding across processes and persistent resume storage
export class ShardManager {
  shards: Shard[] = [];
  constructor(private opts: GatewayOptions) {}

  spawn(count: number) {
    for (let i = 0; i < count; i++) {
      const shard = new Shard(i, count, this.opts);
      shard.connect();
      this.shards.push(shard);
    }
  }
}
