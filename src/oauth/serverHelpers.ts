export interface ExchangeOptions {
  clientId: string;
  clientSecret?: string;
  code: string;
  codeVerifier?: string;
  redirectUri: string;
}

export async function exchangeCodeForTokenNode(opts: ExchangeOptions): Promise<{
  tokens: any;
  user: any;
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
