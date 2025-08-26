import { 
  OAuthTokenResponse, 
  OAuthUserData, 
  OAuthGuildData, 
  OAuthConnectionData 
} from '../types/discord';

export interface ExchangeOptions {
  clientId: string;
  clientSecret?: string;
  code: string;
  codeVerifier?: string;
  redirectUri: string;
}

export interface EnhancedUserData {
  tokens: OAuthTokenResponse;
  user: OAuthUserData;
  guilds?: OAuthGuildData[];
  connections?: OAuthConnectionData[];
}

export async function exchangeCodeForTokenNode(opts: ExchangeOptions): Promise<{
  tokens: OAuthTokenResponse;
  user: OAuthUserData;
}> {
  const body = new URLSearchParams({
    client_id: opts.clientId,
    grant_type: 'authorization_code',
    code: opts.code,
    redirect_uri: opts.redirectUri,
  });
  if (opts.clientSecret) body.append('client_secret', opts.clientSecret);
  if (opts.codeVerifier) body.append('code_verifier', opts.codeVerifier);

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!tokenRes.ok) {
    throw new Error(await tokenRes.text());
  }
  const tokens = await tokenRes.json();

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) {
    throw new Error(await userRes.text());
  }
  const user = await userRes.json();
  return { tokens, user };
}

// Enhanced function to get all available user data
export async function getEnhancedUserData(accessToken: string, scopes?: string[]): Promise<EnhancedUserData> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  
  // Get basic user info
  const userRes = await fetch('https://discord.com/api/users/@me', { headers });
  if (!userRes.ok) {
    throw new Error(`Failed to fetch user: ${userRes.statusText}`);
  }
  const user = await userRes.json();
  
  const result: EnhancedUserData = {
    tokens: { access_token: accessToken } as OAuthTokenResponse,
    user
  };
  
  // Get user guilds if guilds scope is available
  if (scopes?.includes('guilds')) {
    try {
      const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', { headers });
      if (guildsRes.ok) {
        result.guilds = await guildsRes.json();
      }
    } catch (error) {
      console.warn('Failed to fetch guilds:', error);
    }
  }
  
  // Get user connections if connections scope is available
  if (scopes?.includes('connections')) {
    try {
      const connectionsRes = await fetch('https://discord.com/api/users/@me/connections', { headers });
      if (connectionsRes.ok) {
        result.connections = await connectionsRes.json();
      }
    } catch (error) {
      console.warn('Failed to fetch connections:', error);
    }
  }
  
  return result;
}

// Get user avatar URL
export function getUserAvatarURL(user: OAuthUserData, size = 256): string | null {
  if (!user.avatar) return null;
  const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=${size}`;
}

// Get default avatar URL
export function getDefaultAvatarURL(user: OAuthUserData): string {
  const discriminator = parseInt(user.discriminator) || 0;
  const index = discriminator % 5;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

// Get user display name (global_name or username)
export function getUserDisplayName(user: OAuthUserData): string {
  return user.global_name || user.username;
}

// Get guild icon URL
export function getGuildIconURL(guild: OAuthGuildData, size = 256): string | null {
  if (!guild.icon) return null;
  const extension = guild.icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${extension}?size=${size}`;
}

// Check if user has specific permissions in a guild
export function hasPermission(guild: OAuthGuildData, permission: bigint): boolean {
  const permissions = BigInt(guild.permissions);
  // Administrator permission (8) grants all permissions
  if ((permissions & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR) {
    return true;
  }
  return (permissions & permission) === permission;
}

// Common Discord permissions as constants
export const Permissions = {
  ADMINISTRATOR: 1n << 3n,
  MANAGE_GUILD: 1n << 5n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_CHANNELS: 1n << 4n,
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  MANAGE_MESSAGES: 1n << 13n,
  SEND_MESSAGES: 1n << 11n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  USE_SLASH_COMMANDS: 1n << 31n
} as const;

// Refresh an access token using a refresh token
export async function refreshAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<OAuthTokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });
  
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }
  
  return response.json();
}

// Revoke an access token
export async function revokeAccessToken(clientId: string, clientSecret: string, accessToken: string): Promise<void> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    token: accessToken
  });
  
  const response = await fetch('https://discord.com/api/oauth2/token/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`Failed to revoke token: ${response.statusText}`);
  }
}
