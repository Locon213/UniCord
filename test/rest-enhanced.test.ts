import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RestClient } from '../src/index';

describe('RestClient Enhanced Features', () => {
  let client: RestClient;
  let mockFetch: any;

  beforeEach(() => {
    client = new RestClient({
      token: 'test-bot-token',
      baseUrl: 'https://discord.com/api/v10',
    });

    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('HTTP Methods', () => {
    it('should make GET requests', async () => {
      const mockResponse = { id: '123', name: 'Test Guild' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const result = await client.get('/guilds/123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://discord.com/api/v10/guilds/123',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bot test-bot-token',
          },
          body: undefined,
        },
      );
    });

    it('should make POST requests with JSON body', async () => {
      const mockResponse = { id: '456' };
      const requestBody = { content: 'Hello World!' };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      const result = await client.post('/channels/123/messages', requestBody);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://discord.com/api/v10/channels/123/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bot test-bot-token',
          },
          body: JSON.stringify(requestBody),
        },
      );
    });
  });

  describe('Form Data Upload', () => {
    it('should upload form data without Content-Type header', async () => {
      const mockFormData = new FormData();
      mockFormData.append(
        'payload_json',
        JSON.stringify({ content: 'File upload' }),
      );
      mockFormData.append(
        'files[0]',
        new Blob(['test content'], { type: 'text/plain' }),
        'test.txt',
      );

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: '789',
            attachments: [{ filename: 'test.txt' }],
          }),
        headers: new Headers(),
      });

      const result = await client.postFormData(
        '/channels/123/messages',
        mockFormData,
      );

      expect(result.id).toBe('789');
      expect(result.attachments[0].filename).toBe('test.txt');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://discord.com/api/v10/channels/123/messages',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bot test-bot-token',
          },
          body: mockFormData,
        },
      );

      // Verify Content-Type header is not set for FormData
      const call = mockFetch.mock.calls[0];
      expect(call[1].headers['Content-Type']).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses for errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers(),
      });

      await expect(client.get('/test')).rejects.toThrow('Request failed: 400');
    });

    it('should handle empty successful responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
      });

      const result = await client.delete('/test');
      expect(result).toBeNull();
    });
  });
});
