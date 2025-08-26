export interface RestClientOptions {
  token?: string;
  baseUrl?: string;
}

export class RestClient {
  private token?: string;
  private baseUrl: string;

  constructor(opts: RestClientOptions = {}) {
    this.token = opts.token;
    this.baseUrl = opts.baseUrl || 'https://discord.com/api';
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(path: string, options: RequestInit = {}) {
    const headers: any = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (this.token) headers.Authorization = `Bot ${this.token}`;
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    return res.json();
  }

  getMe() {
    return this.request('/users/@me');
  }

  getGuilds() {
    return this.request('/users/@me/guilds');
  }

  sendMessage(channelId: string, payload: any) {
    return this.request(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
