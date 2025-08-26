import { RateLimitManager } from '../utils/rateLimit';

export interface RestClientOptions {
  token?: string;
  baseUrl?: string;
}

export class RestClient {
  private token?: string;
  private baseUrl: string;
  private rate = new RateLimitManager();

  constructor(opts: RestClientOptions = {}) {
    this.token = opts.token;
    this.baseUrl = opts.baseUrl || 'https://discord.com/api/v10';
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(method: string, path: string, body?: any, tries = 0): Promise<any> {
    const route = `${method}:${path}`;
    return this.rate.queue(route, async () => {
      const headers: any = { 'Content-Type': 'application/json' };
      if (this.token) headers.Authorization = `Bot ${this.token}`;
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 429 || res.status >= 500) {
        if (tries < 3) {
          const retry = Number(res.headers.get('retry-after')) * 1000 || 2 ** tries * 1000;
          await new Promise((r) => setTimeout(r, retry));
          return this.request(method, path, body, tries + 1);
        }
      }
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      if (res.status === 204) return null;
      return res.json();
    });
  }

  get(path: string) {
    return this.request('GET', path);
  }

  post(path: string, body: any) {
    return this.request('POST', path, body);
  }

  put(path: string, body: any) {
    return this.request('PUT', path, body);
  }

  patch(path: string, body: any) {
    return this.request('PATCH', path, body);
  }

  delete(path: string) {
    return this.request('DELETE', path);
  }

  getMe() {
    return this.get('/users/@me');
  }

  getGuilds() {
    return this.get('/users/@me/guilds');
  }

  createApplicationCommand(scope: 'global' | string, payload: any) {
    if (scope === 'global')
      return this.post('/applications/@me/commands', payload);
    return this.post(`/applications/@me/guilds/${scope}/commands`, payload);
  }

  bulkOverwriteCommands(scope: 'global' | string, payload: any[]) {
    if (scope === 'global')
      return this.put('/applications/@me/commands', payload);
    return this.put(`/applications/@me/guilds/${scope}/commands`, payload);
  }
}
