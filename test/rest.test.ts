import { describe, it, expect, vi } from 'vitest';
import { RestClient } from '../src/rest/client';

describe('RestClient', () => {
  it('should GET', async () => {
    const rest = new RestClient({ token: 'test', baseUrl: 'https://example.com' });
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
      headers: new Headers(),
    })) as any;
    const res = await rest.get('/test');
    expect(res.ok).toBe(true);
  });
});
