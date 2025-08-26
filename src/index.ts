// Core Bot
export { UniCordBot, EmbedBuilder } from './bot/bot';
export type { 
  BotOptions, 
  MessageContext, 
  InteractionContext, 
  ComponentContext 
} from './bot/bot';

// OAuth
export { OAuth2, DiscordScopes } from './oauth/browser';
export { 
  exchangeCodeForTokenNode,
  getEnhancedUserData,
  getUserAvatarURL,
  getDefaultAvatarURL,
  getUserDisplayName,
  getGuildIconURL,
  hasPermission,
  Permissions,
  refreshAccessToken,
  revokeAccessToken
} from './oauth/serverHelpers';
export type { 
  OAuthOptions, 
  OAuthCallbackResult
} from './oauth/browser';
export type {
  ExchangeOptions,
  EnhancedUserData
} from './oauth/serverHelpers';

// Gateway & Networking
export { Gateway } from './gateway/gateway';
export { ShardManager } from './gateway/manager';
export { RestClient } from './rest/client';
export { sendWebhook } from './webhooks/webhook';

// Utilities
export { logger } from './utils/logger';
export { RateLimitManager } from './utils/rateLimit';

// Discord API Types
export type {
  DiscordUser,
  DiscordMember,
  DiscordChannel,
  DiscordMessage,
  DiscordAttachment,
  DiscordEmbed,
  DiscordEmbedFooter,
  DiscordEmbedImage,
  DiscordEmbedThumbnail,
  DiscordEmbedVideo,
  DiscordEmbedProvider,
  DiscordEmbedAuthor,
  DiscordEmbedField,
  DiscordReaction,
  DiscordEmoji,
  DiscordMessageReference,
  DiscordInteraction,
  DiscordInteractionData,
  DiscordInteractionDataOption,
  DiscordActionRow,
  DiscordComponent,
  DiscordButton,
  DiscordStringSelect,
  DiscordUserSelect,
  DiscordRoleSelect,
  DiscordMentionableSelect,
  DiscordChannelSelect,
  DiscordTextInput,
  DiscordSelectOption,
  DiscordInteractionResponse,
  DiscordInteractionCallbackData,
  DiscordAllowedMentions,
  FileData,
  MessagePayload,
  OAuthTokenResponse,
  OAuthUserData,
  OAuthGuildData,
  OAuthConnectionData,
  ButtonStyle,
  TextInputStyle,
  InteractionResponseType
} from './types/discord';
