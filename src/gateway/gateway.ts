import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { logger } from '../utils/logger';

export interface GatewayOptions {
  token: string;
  intents: number;
  shardId?: number;
  shardCount?: number;
  url?: string;
  applicationId?: string;
}

interface Payload {
  op: number;
  d?: unknown;
  s?: number;
  t?: string;
}

export class Gateway extends EventEmitter {
  private ws?: WebSocket;
  private seq: number | null = null;
  private sessionId: string | null = null;
  private heartbeatInterval = 0;
  private heartbeatTimer?: NodeJS.Timeout;
  private resumeUrl?: string;
  private reconnectAttempts = 0;

  constructor(private options: GatewayOptions) {
    super();
  }

  connect() {
    const url =
      this.options.url || 'wss://gateway.discord.gg/?v=10&encoding=json';
    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      logger.info('Gateway connected');
    });

    this.ws.on('message', (data: WebSocket.RawData) =>
      this.handleMessage(data.toString()),
    );
    this.ws.on('close', () => this.reconnect());
    this.ws.on('error', () => this.reconnect());
  }

  private send(payload: Payload) {
    this.ws?.send(JSON.stringify(payload));
  }

  private identify() {
    this.send({
      op: 2,
      d: {
        token: this.options.token,
        intents: this.options.intents,
        properties: { os: 'linux', browser: 'unicord', device: 'unicord' },
        shard: [this.options.shardId || 0, this.options.shardCount || 1],
      },
    });
  }

  private resume() {
    if (!this.sessionId) return this.identify();
    this.send({
      op: 6,
      d: {
        token: this.options.token,
        session_id: this.sessionId,
        seq: this.seq,
      },
    });
  }

  private heartbeat() {
    this.send({ op: 1, d: this.seq });
  }

  private startHeartbeat(interval: number) {
    clearInterval(this.heartbeatTimer);
    this.heartbeatInterval = interval;
    this.heartbeatTimer = setInterval(() => this.heartbeat(), interval);
  }

  private handleMessage(str: string) {
    const packet: Payload = JSON.parse(str);
    if (packet.s !== undefined) this.seq = packet.s;

    switch (packet.op) {
      case 0: {
        if (packet.t === 'READY') {
          const data = packet.d as { session_id: string; resume_gateway_url: string };
          this.sessionId = data.session_id;
          this.resumeUrl = data.resume_gateway_url;
          this.reconnectAttempts = 0;
        }
        if (packet.t) {
          this.emit(packet.t, packet.d);
        }
        break;
      }
      case 1:
        this.heartbeat();
        break;
      case 7:
        this.reconnect();
        break;
      case 9:
        setTimeout(() => this.identify(), 5000);
        break;
      case 10: {
        const heartbeatData = packet.d as { heartbeat_interval: number };
        this.startHeartbeat(heartbeatData.heartbeat_interval);
        if (this.sessionId) this.resume();
        else this.identify();
        break;
      }
      case 11:
        // heartbeat ACK
        break;
      default:
        logger.debug('Unknown opcode', packet);
    }
  }

  private reconnect() {
    clearInterval(this.heartbeatTimer);
    const wait = Math.min(1000 * 2 ** this.reconnectAttempts, 60000);
    logger.info(`Gateway reconnect in ${wait}ms`);
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
      if (this.resumeUrl) {
        this.options.url = `${this.resumeUrl}?v=10&encoding=json`;
      }
    }, wait);
  }
}
