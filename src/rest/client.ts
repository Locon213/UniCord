import { RateLimitManager } from '../utils/rateLimit';

export interface RestClientOptions {
  token?: string;
  baseUrl?: string;
}

export class RestClient {
  private token?: string;
  private baseUrl: string;
  private rate = new RateLimitManager();
  private applicationId?: string;

  constructor(opts: RestClientOptions = {}) {
    this.token = opts.token;
    this.baseUrl = opts.baseUrl || 'https://discord.com/api/v10';
  }

  setToken(token: string) {
    this.token = token;
  }

  setApplicationId(applicationId: string) {
    this.applicationId = applicationId;
  }

  private async request(method: string, path: string, body?: any, tries = 0, isFormData = false): Promise<any> {
    const route = `${method}:${path}`;
    return this.rate.queue(route, async () => {
      const headers: any = {};
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      if (this.token) headers.Authorization = `Bot ${this.token}`;
      
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      });
      
      if (res.status === 429 || res.status >= 500) {
        if (tries < 3) {
          const retry = Number(res.headers.get('retry-after')) * 1000 || 2 ** tries * 1000;
          await new Promise((r) => setTimeout(r, retry));
          return this.request(method, path, body, tries + 1, isFormData);
        }
      }
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      if (res.status === 204) return null;
      return res.json();
    });
  }

  private async requestFormData(method: string, path: string, formData: FormData, tries = 0): Promise<any> {
    return this.request(method, path, formData, tries, true);
  }

  get(path: string) {
    return this.request('GET', path);
  }

  post(path: string, body: any) {
    return this.request('POST', path, body);
  }

  postFormData(path: string, formData: FormData) {
    return this.requestFormData('POST', path, formData);
  }

  put(path: string, body: any) {
    return this.request('PUT', path, body);
  }

  patch(path: string, body: any) {
    return this.request('PATCH', path, body);
  }

  delete(path: string, body?: any) {
    return this.request('DELETE', path, body);
  }

  getMe() {
    return this.get('/users/@me');
  }

  getGuilds() {
    return this.get('/users/@me/guilds');
  }

  createApplicationCommand(scope: 'global' | string, payload: any) {
    if (!this.applicationId) {
      throw new Error('Application ID not set. Wait for the bot to be ready before creating commands.');
    }
    if (scope === 'global')
      return this.post(`/applications/${this.applicationId}/commands`, payload);
    return this.post(`/applications/${this.applicationId}/guilds/${scope}/commands`, payload);
  }

  bulkOverwriteCommands(scope: 'global' | string, payload: any[]) {
    if (!this.applicationId) {
      throw new Error('Application ID not set. Wait for the bot to be ready before syncing commands.');
    }
    if (scope === 'global')
      return this.put(`/applications/${this.applicationId}/commands`, payload);
    return this.put(`/applications/${this.applicationId}/guilds/${scope}/commands`, payload);
  }
}
