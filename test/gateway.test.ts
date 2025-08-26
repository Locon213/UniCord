import { describe, it, expect } from 'vitest';
import { WebSocketServer } from 'ws';
import { Gateway } from '../src/gateway/gateway';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('Gateway', () => {
  it('sends heartbeat', async () => {
    const wss = new WebSocketServer({ port: 8765 });
    let heartbeat = false;
    wss.on('connection', (ws) => {
      ws.send(JSON.stringify({ op: 10, d: { heartbeat_interval: 50 } }));
      ws.on('message', (data) => {
        const p = JSON.parse(data.toString());
        if (p.op === 1) heartbeat = true;
      });
    });
    const gw = new Gateway({ token: 'x', intents: 0, url: 'ws://localhost:8765' });
    gw.connect();
    await wait(120);
    expect(heartbeat).toBe(true);
    wss.close();
  });
});
