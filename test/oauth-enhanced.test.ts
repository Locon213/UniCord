import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  exchangeCodeForTokenNode, 
  getEnhancedUserData,
  getUserAvatarURL,
  getDefaultAvatarURL,
  getUserDisplayName,
  getGuildIconURL,
  hasPermission,
  Permissions,
  refreshAccessToken,
  revokeAccessToken,
  OAuth2,
  DiscordScopes
} from '../src/index';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OAuth Enhanced Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Server OAuth Functions', () => {
    it('should exchange authorization code for tokens', async () => {
      const mockTokenResponse = {
        access_token: 'access_token_123',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh_token_123',
        scope: 'identify email'
      };

      const mockUserResponse = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234',
        email: 'test@example.com',
        verified: true
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokenResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserResponse)
        });

      const result = await exchangeCodeForTokenNode({
        clientId: 'client123',
        clientSecret: 'secret123',
        code: 'auth_code',
        redirectUri: 'http://localhost:3000/callback'
      });

      expect(result.tokens).toEqual(mockTokenResponse);
      expect(result.user).toEqual(mockUserResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should get enhanced user data with scopes', async () => {
      const mockUser = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234',
        email: 'test@example.com'
      };

      const mockGuilds = [
        {
          id: 'guild123',
          name: 'Test Guild',
          icon: 'guild_icon',
          owner: true,
          permissions: '8' // Administrator
        }
      ];

      const mockConnections = [
        {
          id: 'connection123',
          name: 'GitHub',
          type: 'github',
          verified: true
        }
      ];

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockUser) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGuilds) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockConnections) });

      const result = await getEnhancedUserData('access_token_123', ['identify', 'guilds', 'connections']);

      expect(result.user).toEqual(mockUser);
      expect(result.guilds).toEqual(mockGuilds);
      expect(result.connections).toEqual(mockConnections);
    });

    it('should refresh access token', async () => {
      const mockResponse = {
        access_token: 'new_access_token',
        token_type: 'Bearer',
        expires_in: 3600
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await refreshAccessToken('client123', 'secret123', 'refresh_token_123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: expect.any(URLSearchParams)
      });
    });

    it('should revoke access token', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await revokeAccessToken('client123', 'secret123', 'access_token_123');

      expect(mockFetch).toHaveBeenCalledWith('https://discord.com/api/oauth2/token/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: expect.any(URLSearchParams)
      });
    });
  });

  describe('Utility Functions', () => {
    it('should get user avatar URL', () => {
      const user = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234',
        avatar: 'avatar_hash_123'
      };

      const avatarUrl = getUserAvatarURL(user, 512);
      expect(avatarUrl).toBe('https://cdn.discordapp.com/avatars/123456789/avatar_hash_123.png?size=512');
    });

    it('should get animated avatar URL', () => {
      const user = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234',
        avatar: 'a_animated_avatar_hash'
      };

      const avatarUrl = getUserAvatarURL(user);
      expect(avatarUrl).toBe('https://cdn.discordapp.com/avatars/123456789/a_animated_avatar_hash.gif?size=256');
    });

    it('should return null for users without avatar', () => {
      const user = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234'
      };

      const avatarUrl = getUserAvatarURL(user);
      expect(avatarUrl).toBeNull();
    });

    it('should get default avatar URL', () => {
      const user = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234'
      };

      const defaultUrl = getDefaultAvatarURL(user);
      expect(defaultUrl).toBe('https://cdn.discordapp.com/embed/avatars/4.png'); // 1234 % 5 = 4
    });

    it('should get user display name (global_name preferred)', () => {
      const user = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234',
        global_name: 'Test User Display'
      };

      const displayName = getUserDisplayName(user);
      expect(displayName).toBe('Test User Display');
    });

    it('should fallback to username if no global_name', () => {
      const user = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234'
      };

      const displayName = getUserDisplayName(user);
      expect(displayName).toBe('testuser');
    });

    it('should get guild icon URL', () => {
      const guild = {
        id: 'guild123',
        name: 'Test Guild',
        icon: 'guild_icon_hash',
        owner: false,
        permissions: '0'
      };

      const iconUrl = getGuildIconURL(guild, 128);
      expect(iconUrl).toBe('https://cdn.discordapp.com/icons/guild123/guild_icon_hash.png?size=128');
    });

    it('should check permissions correctly', () => {
      const guild = {
        id: 'guild123',
        name: 'Test Guild',
        owner: false,
        permissions: '8' // Administrator permission
      };

      expect(hasPermission(guild, Permissions.ADMINISTRATOR)).toBe(true);
      expect(hasPermission(guild, Permissions.MANAGE_GUILD)).toBe(true); // Admin includes all
      expect(hasPermission(guild, BigInt(1024))).toBe(true); // Any permission with admin
    });

    it('should check specific permissions', () => {
      const guild = {
        id: 'guild123',
        name: 'Test Guild',
        owner: false,
        permissions: '2048' // SEND_MESSAGES only
      };

      expect(hasPermission(guild, Permissions.SEND_MESSAGES)).toBe(true);
      expect(hasPermission(guild, Permissions.ADMINISTRATOR)).toBe(false);
      expect(hasPermission(guild, Permissions.MANAGE_GUILD)).toBe(false);
    });
  });

  describe('Browser OAuth Client', () => {
    let oauth: OAuth2;

    beforeEach(() => {
      oauth = new OAuth2({
        clientId: 'client123',
        redirectUri: 'http://localhost:3000/callback',
        backendTokenURL: '/api/token'
      });
    });

    it('should have predefined scope constants', () => {
      expect(DiscordScopes.IDENTIFY).toBe('identify');
      expect(DiscordScopes.EMAIL).toBe('email');
      expect(DiscordScopes.GUILDS).toBe('guilds');
      expect(DiscordScopes.CONNECTIONS).toBe('connections');
      expect(DiscordScopes.BOT).toBe('bot');
    });

    it('should provide convenience login methods', async () => {
      const loginSpy = vi.spyOn(oauth, 'login').mockImplementation(() => Promise.resolve());

      await oauth.loginBasic();
      expect(loginSpy).toHaveBeenCalledWith([DiscordScopes.IDENTIFY]);

      await oauth.loginWithEmail();
      expect(loginSpy).toHaveBeenCalledWith([DiscordScopes.IDENTIFY, DiscordScopes.EMAIL]);

      await oauth.loginFullProfile();
      expect(loginSpy).toHaveBeenCalledWith([
        DiscordScopes.IDENTIFY,
        DiscordScopes.EMAIL,
        DiscordScopes.GUILDS,
        DiscordScopes.CONNECTIONS
      ]);

      await oauth.loginForBotManagement('8');
      expect(loginSpy).toHaveBeenCalledWith([DiscordScopes.BOT, DiscordScopes.APPLICATIONS_COMMANDS], {
        permissions: '8'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle token exchange errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Invalid authorization code')
      });

      await expect(exchangeCodeForTokenNode({
        clientId: 'client123',
        code: 'invalid_code',
        redirectUri: 'http://localhost:3000/callback'
      })).rejects.toThrow('Invalid authorization code');
    });

    it('should handle refresh token errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Invalid refresh token'
      });

      await expect(refreshAccessToken('client123', 'secret123', 'invalid_refresh'))
        .rejects.toThrow('Failed to refresh token: Invalid refresh token');
    });

    it('should handle callback state mismatch', async () => {
      const oauth = new OAuth2({
        clientId: 'client123',
        redirectUri: 'http://localhost:3000/callback',
        backendTokenURL: '/api/token'
      });

      // Mock sessionStorage for this specific test
      const mockSessionStorage = {
        getItem: vi.fn().mockReturnValue('correct_state')
      };
      global.sessionStorage = mockSessionStorage as any;
      global.location = { search: '?code=auth_code&state=wrong_state' } as any;

      await expect(oauth.handleCallback()).rejects.toThrow('State mismatch');
    });
  });
});
