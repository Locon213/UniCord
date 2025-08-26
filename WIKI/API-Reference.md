# API Reference

Complete API reference for @locon213/unicord 0.1.1

## UniCordBot

### Constructor

```typescript
new UniCordBot(options: BotOptions)
```

**BotOptions:**
```typescript
interface BotOptions {
  token: string;                // Discord bot token
  intents: number;             // Gateway intents
  prefix?: string;             // Text command prefix (default: '!')
  mentionPrefix?: boolean;     // Allow @bot commands (default: false)  
  handleAllMessages?: boolean; // Process all messages (default: false)
  autoSyncCommands?: boolean;  // Auto-sync slash commands (default: false)
}
```

### Command Registration

```typescript
// Text commands
bot.command(name: string, handler: (ctx: MessageContext) => Promise<void>)

// Slash commands  
bot.slash(name: string, options: SlashCommandOptions, handler: (ctx: InteractionContext) => Promise<void>)

// Component handlers
bot.button(customId: string, handler: (ctx: ComponentContext) => Promise<void>)
bot.selectMenu(customId: string, handler: (ctx: ComponentContext) => Promise<void>)

// Event handlers
bot.onMessage(handler: (ctx: MessageContext) => Promise<void>)
bot.onMention(handler: (ctx: MessageContext) => Promise<void>)
```

### Component Creation

```typescript
// Buttons
bot.createButton(label: string, customId: string, style?: ButtonStyle): DiscordButton
bot.createLinkButton(label: string, url: string): DiscordButton

// Select menus
bot.createStringSelect(customId: string, options: SelectOption[]): DiscordSelectMenu

// Action rows
bot.createActionRow(...components: DiscordComponent[]): DiscordActionRow

// Embeds
bot.createEmbed(): EmbedBuilder
```

### File Operations

```typescript
// Upload files
bot.uploadFile(channelId: string, file: FileData, content?: string): Promise<any>

interface FileData {
  name: string;
  data: Buffer | Uint8Array;
  contentType?: string;
}
```

### Middleware

```typescript
bot.middleware(handler: (ctx: Context, next: () => Promise<void>) => Promise<void>)
```

### Bot Lifecycle

```typescript
bot.start(): Promise<void>
bot.stop(): Promise<void>
bot.syncCommands(options: SyncOptions): Promise<void>
```

## Context Objects

### MessageContext

```typescript
interface MessageContext {
  message: DiscordMessage;
  author: DiscordUser;
  member?: DiscordMember;
  channel: DiscordChannel;
  guild?: DiscordGuild;
  content: string;
  mentions: DiscordUser[];
  mentionedRoles: string[];
  attachments: DiscordAttachment[];
  args: string[];
  bot: UniCordBot;
  
  // Methods
  reply(content: string | MessagePayload): Promise<any>;
  send(content: string | MessagePayload): Promise<any>;
  react(emoji: string): Promise<any>;
  edit(messageId: string, content: string | MessagePayload): Promise<any>;
  delete(messageId?: string): Promise<any>;
  createButton: typeof bot.createButton;
  createActionRow: typeof bot.createActionRow;
}
```

### InteractionContext

```typescript
interface InteractionContext {
  interaction: DiscordInteraction;
  user: DiscordUser;
  member?: DiscordMember;
  channel: DiscordChannel;
  guild?: DiscordGuild;
  options: Map<string, any>;
  bot: UniCordBot;
  
  // Methods
  reply(content: string | MessagePayload): Promise<any>;
  editReply(content: string | MessagePayload): Promise<any>;
  deleteReply(): Promise<any>;
  followUp(content: string | MessagePayload): Promise<any>;
  defer(ephemeral?: boolean): Promise<any>;
  showModal(title: string, customId: string, components: DiscordActionRow[]): Promise<any>;
  createButton: typeof bot.createButton;
  createActionRow: typeof bot.createActionRow;
}
```

### ComponentContext

```typescript
interface ComponentContext {
  interaction: DiscordInteraction;
  user: DiscordUser;
  member?: DiscordMember;
  channel: DiscordChannel;
  guild?: DiscordGuild;
  customId: string;
  values?: string[];
  bot: UniCordBot;
  
  // Methods
  reply(content: string | MessagePayload): Promise<any>;
  update(content: string | MessagePayload): Promise<any>;
  defer(ephemeral?: boolean): Promise<any>;
  followUp(content: string | MessagePayload): Promise<any>;
  createButton: typeof bot.createButton;
  createActionRow: typeof bot.createActionRow;
}
```

## EmbedBuilder

```typescript
class EmbedBuilder {
  setTitle(title: string): EmbedBuilder
  setDescription(description: string): EmbedBuilder
  setColor(color: number): EmbedBuilder
  setAuthor(name: string, iconUrl?: string, url?: string): EmbedBuilder
  setFooter(text: string, iconUrl?: string): EmbedBuilder
  setImage(url: string): EmbedBuilder
  setThumbnail(url: string): EmbedBuilder
  addField(name: string, value: string, inline?: boolean): EmbedBuilder
  setTimestamp(date?: Date): EmbedBuilder
  setUrl(url: string): EmbedBuilder
  toJSON(): DiscordEmbed
}
```

## OAuth2

### Constructor

```typescript
new OAuth2(options: OAuth2Options)

interface OAuth2Options {
  clientId: string;
  redirectUri: string;
  backendTokenURL: string;
}
```

### Authentication Methods

```typescript
// Login methods
oauth.login(scopes: string[]): Promise<void>
oauth.loginBasic(): Promise<void>
oauth.loginWithEmail(): Promise<void>
oauth.loginFullProfile(): Promise<void>
oauth.loginForBotManagement(permissions: string): Promise<void>

// Callback handling
oauth.handleCallback(code: string, state: string): Promise<any>

// Session management
oauth.isLoggedIn(): boolean
oauth.getCurrentUser(): Promise<DiscordUser>
oauth.getSession(): OAuthSession | null
oauth.logout(): Promise<void>
```

### Server-side Functions

```typescript
// Token exchange
exchangeCodeForTokenNode(options: TokenExchangeOptions): Promise<TokenResult>

interface TokenExchangeOptions {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}

// Enhanced user data
getEnhancedUserData(accessToken: string, scopes: string[]): Promise<EnhancedUserData>

// Token management
refreshAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<TokenResult>
revokeAccessToken(clientId: string, clientSecret: string, accessToken: string): Promise<void>
```

### Utility Functions

```typescript
// Avatar utilities
getUserAvatarURL(user: DiscordUser, size?: number): string
getUserDisplayName(user: DiscordUser): string
getDefaultAvatarURL(user: DiscordUser): string

// Guild utilities
getGuildIconURL(guild: DiscordGuild, size?: number): string

// Permission utilities  
hasPermission(guild: DiscordGuild, permission: string): boolean
```

## Enums and Constants

### ButtonStyle

```typescript
enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5
}
```

### InteractionResponseType

```typescript
enum InteractionResponseType {
  Pong = 1,
  ChannelMessageWithSource = 4,
  DeferredChannelMessageWithSource = 5,
  DeferredUpdateMessage = 6,
  UpdateMessage = 7,
  ApplicationCommandAutocompleteResult = 8,
  Modal = 9
}
```

### DiscordScopes

```typescript
export const DiscordScopes = {
  IDENTIFY: 'identify',
  EMAIL: 'email',
  GUILDS: 'guilds',
  CONNECTIONS: 'connections',
  BOT: 'bot',
  WEBHOOK_INCOMING: 'webhook.incoming',
  APPLICATIONS_COMMANDS: 'applications.commands',
  APPLICATIONS_COMMANDS_UPDATE: 'applications.commands.update',
  APPLICATIONS_COMMANDS_PERMISSIONS_UPDATE: 'applications.commands.permissions.update'
};
```

### Permissions

```typescript
export const Permissions = {
  CREATE_INSTANT_INVITE: '1',
  KICK_MEMBERS: '2',
  BAN_MEMBERS: '4',
  ADMINISTRATOR: '8',
  MANAGE_CHANNELS: '16',
  MANAGE_GUILD: '32',
  ADD_REACTIONS: '64',
  VIEW_AUDIT_LOG: '128',
  PRIORITY_SPEAKER: '256',
  STREAM: '512',
  VIEW_CHANNEL: '1024',
  SEND_MESSAGES: '2048',
  SEND_TTS_MESSAGES: '4096',
  MANAGE_MESSAGES: '8192',
  EMBED_LINKS: '16384',
  ATTACH_FILES: '32768',
  READ_MESSAGE_HISTORY: '65536',
  MENTION_EVERYONE: '131072',
  USE_EXTERNAL_EMOJIS: '262144',
  VIEW_GUILD_INSIGHTS: '524288',
  CONNECT: '1048576',
  SPEAK: '2097152',
  MUTE_MEMBERS: '4194304',
  DEAFEN_MEMBERS: '8388608',
  MOVE_MEMBERS: '16777216',
  USE_VAD: '33554432'
};
```

## REST Client

```typescript
class RestClient {
  get(path: string): Promise<any>
  post(path: string, body: any): Promise<any>
  postFormData(path: string, formData: FormData): Promise<any>
  put(path: string, body: any): Promise<any>
  patch(path: string, body: any): Promise<any>
  delete(path: string, body?: any): Promise<any>
}
```

## Type Definitions

All Discord API types are available:

- `DiscordUser`
- `DiscordGuild`
- `DiscordChannel`
- `DiscordMessage`
- `DiscordInteraction`
- `DiscordEmbed`
- `DiscordButton`
- `DiscordSelectMenu`
- `DiscordActionRow`
- `DiscordAttachment`
- And 200+ more interfaces...

## Error Handling

```typescript
try {
  await bot.start();
} catch (error) {
  console.error('Bot failed to start:', error);
}

// OAuth errors
try {
  await oauth.loginBasic();
} catch (error) {
  if (error.message.includes('access_denied')) {
    // User denied access
  } else {
    // Other OAuth error
  }
}
```

## Examples

See the `examples/` directory for complete working examples:
- `examples/bot-basic/` - Simple echo bot
- `examples/bot-slash/` - Slash commands
- `examples/enhanced-bot/` - Advanced features
- `examples/node-server/` - OAuth2 integration