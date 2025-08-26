import { EventEmitter } from 'events';
import { Gateway } from '../gateway/gateway';
import { ShardManager } from '../gateway/manager';
import { RestClient } from '../rest/client';
import { logger } from '../utils/logger';

export interface BotOptions {
  token: string;
  intents: number;
  prefix?: string;
  shardCount?: number;
  autoSyncCommands?: boolean;
}

interface CommandHandler {
  (ctx: any): void | Promise<void>;
}

export class UniCordBot extends EventEmitter {
  private gateway?: Gateway;
  private rest: RestClient;
  private commands = new Map<string, CommandHandler>();
  private slashCommands = new Map<string, { options: any; handler: CommandHandler }>();
  private middlewares: Array<(ctx: any, next: () => Promise<void>) => Promise<void>> = [];

  constructor(private opts: BotOptions) {
    super();
    this.rest = new RestClient({ token: opts.token });
  }

  command(name: string, handler: CommandHandler) {
    this.commands.set(name, handler);
  }

  slash(name: string, options: any, handler: CommandHandler) {
    this.slashCommands.set(name, { options, handler });
  }

  middleware(fn: (ctx: any, next: () => Promise<void>) => Promise<void>) {
    this.middlewares.push(fn);
  }

  onEvent(event: string, handler: CommandHandler) {
    this.on(event, handler);
  }

  async start() {
    if (this.opts.shardCount && this.opts.shardCount > 1) {
      const manager = new ShardManager({
        token: this.opts.token,
        intents: this.opts.intents,
      });
      manager.spawn(this.opts.shardCount);
      manager.shards.forEach((s) => this.bindGateway(s));
    } else {
      this.gateway = new Gateway({ token: this.opts.token, intents: this.opts.intents });
      this.bindGateway(this.gateway);
      this.gateway.connect();
    }
    if (this.opts.autoSyncCommands) {
      await this.syncCommands({ scope: 'global' });
    }
  }

  private bindGateway(g: Gateway) {
    g.on('MESSAGE_CREATE', (msg) => this.handleMessage(msg));
    g.on('INTERACTION_CREATE', (interaction) => this.handleInteraction(interaction));
    g.on('READY', (d) => this.emit('ready', d));
  }

  private async runMiddlewares(ctx: any, handler: CommandHandler) {
    let idx = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= idx) return;
      idx = i;
      const fn = this.middlewares[i];
      if (fn) await fn(ctx, () => dispatch(i + 1));
      else await handler(ctx);
    };
    await dispatch(0);
  }

  private handleMessage(msg: any) {
    if (!this.opts.prefix || !msg.content?.startsWith(this.opts.prefix)) return;
    const name = msg.content.slice(this.opts.prefix.length).split(/\s+/)[0];
    const handler = this.commands.get(name);
    if (!handler) return;
    const ctx = {
      message: msg,
      reply: (content: string) => this.rest.post(`/channels/${msg.channel_id}/messages`, { content }),
    };
    this.runMiddlewares(ctx, handler);
  }

  private handleInteraction(inter: any) {
    const name = inter.data.name;
    const cmd = this.slashCommands.get(name);
    if (!cmd) return;
    const ctx = {
      interaction: inter,
      reply: (content: string) =>
        this.rest.post(`/interactions/${inter.id}/${inter.token}/callback`, {
          type: 4,
          data: { content },
        }),
      defer: () =>
        this.rest.post(`/interactions/${inter.id}/${inter.token}/callback`, {
          type: 5,
        }),
      edit: (content: string) =>
        this.rest.patch(`/webhooks/${inter.application_id}/${inter.token}/messages/@original`, {
          content,
        }),
    };
    this.runMiddlewares(ctx, cmd.handler);
  }

  async syncCommands(opts: { scope: 'global' | 'guild'; guildId?: string }) {
    const commands = Array.from(this.slashCommands.entries()).map(([name, { options }]) => ({
      name,
      ...options,
    }));
    if (opts.scope === 'global') {
      await this.rest.bulkOverwriteCommands('global', commands);
    } else {
      await this.rest.bulkOverwriteCommands(opts.guildId!, commands);
    }
    logger.info('Commands synced');
  }
}
