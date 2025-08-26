import { Gateway, GatewayOptions } from './gateway';

export class Shard extends Gateway {
  constructor(id: number, count: number, opts: GatewayOptions) {
    super({ ...opts, shardId: id, shardCount: count });
  }
}
