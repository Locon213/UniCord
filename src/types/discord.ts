// Discord API Types
export interface DiscordUser {
  id: string;
  username: string;
  discriminator?: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface DiscordMember {
  user?: DiscordUser;
  nick?: string;
  avatar?: string;
  roles: string[];
  joined_at: string;
  premium_since?: string;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  icon_hash?: string;
  splash?: string;
  discovery_splash?: string;
  owner?: boolean;
  owner_id: string;
  permissions?: string;
  region?: string;
  afk_channel_id?: string;
  afk_timeout: number;
  widget_enabled?: boolean;
  widget_channel_id?: string;
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  roles: Record<string, unknown>[];
  emojis: Record<string, unknown>[];
  features: string[];
  mfa_level: number;
  application_id?: string;
  system_channel_id?: string;
  system_channel_flags: number;
  rules_channel_id?: string;
  max_presences?: number;
  max_members?: number;
  vanity_url_code?: string;
  description?: string;
  banner?: string;
  premium_tier: number;
  premium_subscription_count?: number;
  preferred_locale: string;
  public_updates_channel_id?: string;
  max_video_channel_users?: number;
  max_stage_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  welcome_screen?: Record<string, unknown>;
  nsfw_level: number;
  stickers?: Record<string, unknown>[];
  premium_progress_bar_enabled: boolean;
}

export interface DiscordChannel {
  id: string;
  type: number;
  guild_id?: string;
  position?: number;
  permission_overwrites?: Record<string, unknown>[];
  name?: string;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: DiscordUser[];
  icon?: string;
  owner_id?: string;
  application_id?: string;
  parent_id?: string;
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: Record<string, unknown>;
  member?: Record<string, unknown>;
  default_auto_archive_duration?: number;
  permissions?: string;
  flags?: number;
  total_message_sent?: number;
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: DiscordUser;
  member?: DiscordMember;
  content: string;
  timestamp: string;
  edited_timestamp?: string;
  tts: boolean;
  mention_everyone: boolean;
  mentions: DiscordUser[];
  mention_roles: string[];
  mention_channels?: Record<string, unknown>[];
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
  reactions?: DiscordReaction[];
  nonce?: string | number;
  pinned: boolean;
  webhook_id?: string;
  type: number;
  activity?: Record<string, unknown>;
  application?: Record<string, unknown>;
  application_id?: string;
  message_reference?: DiscordMessageReference;
  flags?: number;
  referenced_message?: DiscordMessage;
  interaction?: DiscordInteraction;
  thread?: DiscordChannel;
  components?: DiscordActionRow[];
  sticker_items?: Record<string, unknown>[];
  stickers?: Record<string, unknown>[];
  position?: number;
}

export interface DiscordAttachment {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
  flags?: number;
}

export interface DiscordEmbed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedThumbnail;
  video?: DiscordEmbedVideo;
  provider?: DiscordEmbedProvider;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedImage {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedThumbnail {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedVideo {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedProvider {
  name?: string;
  url?: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordReaction {
  count: number;
  me: boolean;
  emoji: DiscordEmoji;
}

export interface DiscordEmoji {
  id?: string;
  name?: string;
  roles?: string[];
  user?: DiscordUser;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export interface DiscordMessageReference {
  message_id?: string;
  channel_id?: string;
  guild_id?: string;
  fail_if_not_exists?: boolean;
}

export interface DiscordInteraction {
  id: string;
  application_id: string;
  type: number;
  data?: DiscordInteractionData;
  guild_id?: string;
  channel_id?: string;
  member?: DiscordMember;
  user?: DiscordUser;
  token: string;
  version: number;
  message?: DiscordMessage;
  app_permissions?: string;
  locale?: string;
  guild_locale?: string;
}

export interface DiscordInteractionData {
  id?: string;
  name?: string;
  type?: number;
  resolved?: Record<string, unknown>;
  options?: DiscordInteractionDataOption[];
  custom_id?: string;
  component_type?: number;
  values?: string[];
  target_id?: string;
  components?: DiscordActionRow[];
}

export interface DiscordInteractionDataOption {
  name: string;
  type: number;
  description?: string;
  value?: unknown;
  options?: DiscordInteractionDataOption[];
  focused?: boolean;
  required?: boolean;
}

// Component Types
export interface DiscordActionRow {
  type: 1;
  components: DiscordComponent[];
}

export type DiscordComponent =
  | DiscordButton
  | DiscordStringSelect
  | DiscordTextInput
  | DiscordUserSelect
  | DiscordRoleSelect
  | DiscordMentionableSelect
  | DiscordChannelSelect;

export interface DiscordButton {
  type: 2;
  style: ButtonStyle;
  label?: string;
  emoji?: DiscordEmoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface DiscordStringSelect {
  type: 3;
  custom_id: string;
  options: DiscordSelectOption[];
  channel_types?: number[];
  placeholder?: string;
  default_values?: string[];
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface DiscordUserSelect {
  type: 5;
  custom_id: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface DiscordRoleSelect {
  type: 6;
  custom_id: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface DiscordMentionableSelect {
  type: 7;
  custom_id: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface DiscordChannelSelect {
  type: 8;
  custom_id: string;
  channel_types?: number[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export interface DiscordTextInput {
  type: 4;
  custom_id: string;
  style: TextInputStyle;
  label: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
}

export interface DiscordSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: DiscordEmoji;
  default?: boolean;
}

export enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
  Success = 3,
  Danger = 4,
  Link = 5,
}

export enum TextInputStyle {
  Short = 1,
  Paragraph = 2,
}

// Response Types
export interface DiscordInteractionResponse {
  type: InteractionResponseType;
  data?: DiscordInteractionCallbackData;
}

export interface DiscordInteractionCallbackData {
  tts?: boolean;
  content?: string;
  embeds?: DiscordEmbed[];
  allowed_mentions?: DiscordAllowedMentions;
  flags?: number;
  components?: DiscordActionRow[];
  attachments?: Partial<DiscordAttachment>[];
}

export interface DiscordAllowedMentions {
  parse?: ('roles' | 'users' | 'everyone')[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export enum InteractionResponseType {
  Pong = 1,
  ChannelMessageWithSource = 4,
  DeferredChannelMessageWithSource = 5,
  DeferredUpdateMessage = 6,
  UpdateMessage = 7,
  ApplicationCommandAutocompleteResult = 8,
  Modal = 9,
}

// File Upload Types
export interface FileData {
  name: string;
  data: Buffer | Uint8Array;
  contentType?: string;
}

export interface MessagePayload {
  content?: string;
  embeds?: DiscordEmbed[];
  components?: DiscordActionRow[];
  files?: FileData[];
  allowed_mentions?: DiscordAllowedMentions;
  message_reference?: DiscordMessageReference;
  flags?: number;
}

// OAuth Types
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface OAuthUserData {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface OAuthGuildData {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
  permissions_new?: string;
  features: string[];
}

export interface OAuthConnectionData {
  id: string;
  name: string;
  type: string;
  revoked?: boolean;
  integrations?: any[];
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  two_way_link: boolean;
  visibility: number;
}
