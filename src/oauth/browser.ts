export interface OAuthOptions {
  clientId: string;
  redirectUri: string;
  backendTokenURL: string;
  defaultScopes?: string[];
}

export interface OAuthCallbackResult {
  user: any;
  tokens: any;
}

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

  async login(scopes?: string[] | string): Promise<void> {
    const scopeArray = Array.isArray(scopes)
      ? scopes
      : typeof scopes === 'string'
        ? scopes.split(' ')
        : this.opts.defaultScopes || [];
    const state = crypto.randomUUID();
    const codeVerifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const codeChallenge = base64url(await sha256(codeVerifier));

    sessionStorage.setItem('unicord_state', state);
    sessionStorage.setItem('unicord_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: this.opts.clientId,
      redirect_uri: this.opts.redirectUri,
      response_type: 'code',
      scope: scopeArray.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
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
    if (state !== savedState) {
      throw new Error('State mismatch');
    }

    try {
      const res = await fetch(this.opts.backendTokenURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code,
          code_verifier: verifier,
          redirect_uri: this.opts.redirectUri,
        }),
      });
      if (!res.ok) {
        throw new Error(`Token exchange failed: ${res.status}`);
      }
      const data = await res.json();
      return data as OAuthCallbackResult;
    } finally {
      sessionStorage.removeItem('unicord_state');
      sessionStorage.removeItem('unicord_verifier');
    }
  }
}
