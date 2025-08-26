import { describe, it, expect } from 'vitest';
import { OAuth2 } from '../src/oauth/browser';

describe('OAuth2', () => {
  it('should expose login and handleCallback', () => {
    const oauth = new OAuth2({
      clientId: 'id',
      redirectUri: 'uri',
      backendTokenURL: '/token',
    });
    expect(typeof oauth.login).toBe('function');
    expect(typeof oauth.handleCallback).toBe('function');
  });
});
