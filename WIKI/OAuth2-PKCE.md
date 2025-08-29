# OAuth2 PKCE Integration

@locon213/unicord provides a complete OAuth2 implementation with PKCE (Proof Key for Code Exchange) for secure Discord authentication.

## Browser OAuth2 Client

```typescript
import { OAuth2, DiscordScopes } from '@locon213/unicord';

const oauth = new OAuth2({
  clientId: 'your-discord-client-id',
  redirectUri: 'http://localhost:3000/callback',
  backendTokenURL: '/api/auth/discord',
});

// Basic user authentication
await oauth.loginBasic(); // Gets user info only

// Authentication with email
await oauth.loginWithEmail(); // Gets user info + email

// Full profile authentication
await oauth.loginFullProfile(); // Gets user, email, guilds, connections

// Bot management authentication
await oauth.loginForBotManagement('8'); // For bot management with admin permissions
```

## Custom Scopes

```typescript
// Custom scope authentication
await oauth.login([
  DiscordScopes.IDENTIFY,
  DiscordScopes.EMAIL,
  DiscordScopes.GUILDS,
  DiscordScopes.CONNECTIONS,
]);

// Available scopes
DiscordScopes.IDENTIFY; // Basic user info
DiscordScopes.EMAIL; // User email
DiscordScopes.GUILDS; // User's Discord servers
DiscordScopes.CONNECTIONS; // Connected accounts (GitHub, etc.)
DiscordScopes.BOT; // Bot permissions
DiscordScopes.WEBHOOK_INCOMING; // Webhook permissions
```

## Server-side Token Exchange

```typescript
import {
  exchangeCodeForTokenNode,
  getUserDisplayName,
  hasPermission,
} from '@locon213/unicord';

// Express.js route example
app.post('/api/auth/discord', async (req, res) => {
  const { code, redirect_uri } = req.body;

  try {
    const result = await exchangeCodeForTokenNode({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      code,
      redirectUri: redirect_uri,
    });

    // Enhanced user data
    const displayName = getUserDisplayName(result.user);
    const avatarUrl = getUserAvatarURL(result.user, 256);

    res.json({
      success: true,
      user: {
        ...result.user,
        displayName,
        avatarUrl,
      },
      guilds: result.guilds,
      connections: result.connections,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Enhanced User Data Extraction

```typescript
// Get comprehensive user data with multiple scopes
const userData = await getEnhancedUserData(accessToken, [
  'identify',
  'email',
  'guilds',
  'connections',
]);

console.log(userData.user.email); // User email
console.log(userData.guilds); // User's Discord servers
console.log(userData.connections); // Connected accounts
```

## Utility Functions

```typescript
import {
  getUserAvatarURL,
  getUserDisplayName,
  getDefaultAvatarURL,
  getGuildIconURL,
  hasPermission,
  Permissions,
} from '@locon213/unicord';

// Avatar utilities
const avatarUrl = getUserAvatarURL(user, 512); // Get user avatar
const displayName = getUserDisplayName(user); // Get display name
const defaultAvatar = getDefaultAvatarURL(user); // Get default avatar

// Guild utilities
const guildIcon = getGuildIconURL(guild, 256); // Get guild icon

// Permission checking
const canManageGuild = hasPermission(guild, Permissions.MANAGE_GUILD);
const isAdmin = hasPermission(guild, Permissions.ADMINISTRATOR);
```

## Token Management

```typescript
// Refresh access token
const newTokens = await refreshAccessToken(
  clientId,
  clientSecret,
  refreshToken,
);

// Revoke access token
await revokeAccessToken(clientId, clientSecret, accessToken);

// Get current user
const currentUser = await oauth.getCurrentUser();

// Logout
await oauth.logout();
```

## Callback Handling

```typescript
// Handle OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

if (code && state) {
  try {
    const result = await oauth.handleCallback(code, state);
    console.log('Authentication successful:', result);
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

## Session Management

```typescript
// Check if user is logged in
if (oauth.isLoggedIn()) {
  const user = await oauth.getCurrentUser();
  console.log('Welcome back,', user.username);
} else {
  // Redirect to login
  await oauth.loginBasic();
}

// Get user session
const session = oauth.getSession();
if (session) {
  console.log('Access token expires at:', session.expiresAt);
}
```

## Security Features

### PKCE (Proof Key for Code Exchange)

PKCE protects the authorization code exchange by requiring a code verifier and code challenge. The client generates a `code_verifier` and `code_challenge`, and the server validates their correspondence to prevent code interception attacks.

### State Parameter

The `state` parameter protects against CSRF attacks. UniCord automatically generates and validates state parameters, storing them securely in sessionStorage.

### Secure Token Storage

Access tokens are stored securely and automatically refreshed when needed. Refresh tokens are handled server-side for maximum security.

## Error Handling

```typescript
try {
  await oauth.loginBasic();
} catch (error) {
  if (error.message.includes('access_denied')) {
    console.log('User denied access');
  } else if (error.message.includes('invalid_grant')) {
    console.log('Authorization code expired or invalid');
  } else {
    console.error('OAuth error:', error.message);
  }
}
```
