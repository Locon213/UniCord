import { OAuthUserData, OAuthGuildData, OAuthConnectionData } from '../types/discord';

export interface OAuthOptions {
  clientId: string;
  redirectUri: string;
  backendTokenURL: string;
  defaultScopes?: string[];
}

export interface OAuthCallbackResult {
  user: OAuthUserData;
  tokens: any;
  guilds?: OAuthGuildData[];
  connections?: OAuthConnectionData[];
}

// Available Discord OAuth2 scopes
export const DiscordScopes = {
  IDENTIFY: 'identify',
  EMAIL: 'email',
  CONNECTIONS: 'connections',
  GUILDS: 'guilds',
  GUILDS_JOIN: 'guilds.join',
  GUILDS_MEMBERS_READ: 'guilds.members.read',
  GDM_JOIN: 'gdm.join',
  RPC: 'rpc',
  RPC_NOTIFICATIONS_READ: 'rpc.notifications.read',
  RPC_VOICE_READ: 'rpc.voice.read',
  RPC_VOICE_WRITE: 'rpc.voice.write',
  RPC_ACTIVITIES_WRITE: 'rpc.activities.write',
  BOT: 'bot',
  WEBHOOK_INCOMING: 'webhook.incoming',
  MESSAGES_READ: 'messages.read',
  APPLICATIONS_BUILDS_UPLOAD: 'applications.builds.upload',
  APPLICATIONS_BUILDS_READ: 'applications.builds.read',
  APPLICATIONS_COMMANDS: 'applications.commands',
  APPLICATIONS_COMMANDS_UPDATE: 'applications.commands.update',
  APPLICATIONS_COMMANDS_PERMISSIONS_UPDATE: 'applications.commands.permissions.update',
  APPLICATIONS_STORE_UPDATE: 'applications.store.update',
  APPLICATIONS_ENTITLEMENTS: 'applications.entitlements',
  ACTIVITIES_READ: 'activities.read',
  ACTIVITIES_WRITE: 'activities.write',
  RELATIONSHIPS_READ: 'relationships.read',
  VOICE: 'voice',
  DM_CHANNELS_READ: 'dm_channels.read',
  ROLE_CONNECTIONS_WRITE: 'role_connections.write'
} as const;

function base64url(input: ArrayBuffer | Uint8Array): string {
  // Encode array buffer or Uint8Array to base64url
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(verifier: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode(verifier);
  return crypto.subtle.digest('SHA-256', data);
}

export class OAuth2 {
  private opts: OAuthOptions;

  constructor(opts: OAuthOptions) {
    this.opts = opts;
  }

  async login(scopes?: string[] | string, options?: { prompt?: 'consent' | 'none'; permissions?: string }): Promise<void> {
    const scopeArray = Array.isArray(scopes)
      ? scopes
      : typeof scopes === 'string'
        ? scopes.split(' ')
        : this.opts.defaultScopes || [DiscordScopes.IDENTIFY];
    
    const state = crypto.randomUUID();
    const codeVerifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const codeChallenge = base64url(await sha256(codeVerifier));

    sessionStorage.setItem('unicord_state', state);
    sessionStorage.setItem('unicord_verifier', codeVerifier);
    sessionStorage.setItem('unicord_scopes', JSON.stringify(scopeArray));

    const params = new URLSearchParams({
      client_id: this.opts.clientId,
      redirect_uri: this.opts.redirectUri,
      response_type: 'code',
      scope: scopeArray.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    
    if (options?.prompt) {
      params.append('prompt', options.prompt);
    }
    
    if (options?.permissions) {
      params.append('permissions', options.permissions);
    }

    location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
  }

  // Login with basic user info (identify scope)
  async loginBasic(): Promise<void> {
    return this.login([DiscordScopes.IDENTIFY]);
  }

  // Login with user info and email
  async loginWithEmail(): Promise<void> {
    return this.login([DiscordScopes.IDENTIFY, DiscordScopes.EMAIL]);
  }

  // Login with full profile access (user, email, guilds, connections)
  async loginFullProfile(): Promise<void> {
    return this.login([
      DiscordScopes.IDENTIFY,
      DiscordScopes.EMAIL,
      DiscordScopes.GUILDS,
      DiscordScopes.CONNECTIONS
    ]);
  }

  // Login for bot management
  async loginForBotManagement(permissions?: string): Promise<void> {
    return this.login([DiscordScopes.BOT, DiscordScopes.APPLICATIONS_COMMANDS], {
      permissions
    });
  }

  async handleCallback(): Promise<OAuthCallbackResult> {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      throw new Error('Missing code or state');
    }

    const savedState = sessionStorage.getItem('unicord_state');
    const verifier = sessionStorage.getItem('unicord_verifier');
    const scopesStr = sessionStorage.getItem('unicord_scopes');
    
    if (state !== savedState) {
      throw new Error('State mismatch');
    }

    try {
      const requestBody: any = {
        code,
        code_verifier: verifier,
        redirect_uri: this.opts.redirectUri,
      };
      
      if (scopesStr) {
        requestBody.scopes = JSON.parse(scopesStr);
      }
      
      const res = await fetch(this.opts.backendTokenURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        throw new Error(`Token exchange failed: ${res.status}`);
      }
      
      const data = await res.json();
      return data as OAuthCallbackResult;
    } finally {
      sessionStorage.removeItem('unicord_state');
      sessionStorage.removeItem('unicord_verifier');
      sessionStorage.removeItem('unicord_scopes');
    }
  }

  // Get current user info if already authenticated
  async getCurrentUser(): Promise<OAuthUserData | null> {
    try {
      const res = await fetch('/api/user', {
        credentials: 'include'
      });
      
      if (res.ok) {
        return res.json();
      }
      
      return null;
    } catch {
      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Logout failed:', error);
    }
    
    // Clear any stored auth data
    sessionStorage.removeItem('unicord_state');
    sessionStorage.removeItem('unicord_verifier');
    sessionStorage.removeItem('unicord_scopes');
  }
}
