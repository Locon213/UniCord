import { EventEmitter } from 'events';
import { Gateway } from '../gateway/gateway';
import { ShardManager } from '../gateway/manager';
import { RestClient } from '../rest/client';
import { logger } from '../utils/logger';
import {
  DiscordMessage,
  DiscordInteraction,
  DiscordUser,
  DiscordMember,
  DiscordChannel,
  DiscordEmbed,
  DiscordActionRow,
  DiscordComponent,
  DiscordButton,
  DiscordStringSelect,
  MessagePayload,
  FileData,
  ButtonStyle,
  InteractionResponseType,
  DiscordInteractionResponse,
  DiscordInteractionCallbackData
} from '../types/discord';

export interface BotOptions {
  token: string;
  intents: number;
  prefix?: string;
  shardCount?: number;
  autoSyncCommands?: boolean;
  mentionPrefix?: boolean;
  handleAllMessages?: boolean;
}

interface CommandHandler {
  (ctx: MessageContext | InteractionContext): void | Promise<void>;
}

interface ComponentHandler {
  (ctx: ComponentContext): void | Promise<void>;
}

interface MentionHandler {
  (ctx: MessageContext): void | Promise<void>;
}

export interface MessageContext {
  message: DiscordMessage;
  author: DiscordUser;
  member?: DiscordMember;
  channel: DiscordChannel;
  guild?: any;
  content: string;
  mentions: DiscordUser[];
  mentionedRoles: string[];
  attachments: any[];
  args: string[];
  bot: UniCordBot;
  reply: (content: string | MessagePayload) => Promise<any>;
  send: (content: string | MessagePayload) => Promise<any>;
  react: (emoji: string) => Promise<any>;
  edit: (messageId: string, content: string | MessagePayload) => Promise<any>;
  delete: (messageId?: string) => Promise<any>;
  createButton: (label: string, customId: string, style?: ButtonStyle) => DiscordButton;
  createActionRow: (...components: DiscordComponent[]) => DiscordActionRow;
}

export interface InteractionContext {
  interaction: DiscordInteraction;
  user: DiscordUser;
  member?: DiscordMember;
  channel: DiscordChannel;
  guild?: any;
  options: Map<string, any>;
  bot: UniCordBot;
  reply: (content: string | MessagePayload) => Promise<any>;
  editReply: (content: string | MessagePayload) => Promise<any>;
  deleteReply: () => Promise<any>;
  followUp: (content: string | MessagePayload) => Promise<any>;
  defer: (ephemeral?: boolean) => Promise<any>;
  showModal: (title: string, customId: string, components: DiscordActionRow[]) => Promise<any>;
  createButton: (label: string, customId: string, style?: ButtonStyle) => DiscordButton;
  createActionRow: (...components: DiscordComponent[]) => DiscordActionRow;
}

export interface ComponentContext {
  interaction: DiscordInteraction;
  user: DiscordUser;
  member?: DiscordMember;
  channel: DiscordChannel;
  guild?: any;
  customId: string;
  values?: string[];
  bot: UniCordBot;
  reply: (content: string | MessagePayload) => Promise<any>;
  update: (content: string | MessagePayload) => Promise<any>;
  defer: (ephemeral?: boolean) => Promise<any>;
  followUp: (content: string | MessagePayload) => Promise<any>;
  createButton: (label: string, customId: string, style?: ButtonStyle) => DiscordButton;
  createActionRow: (...components: DiscordComponent[]) => DiscordActionRow;
}

export class UniCordBot extends EventEmitter {
  private gateway?: Gateway;
  private rest: RestClient;
  private commands = new Map<string, CommandHandler>();
  private slashCommands = new Map<string, { options: any; handler: CommandHandler }>();
  private components = new Map<string, ComponentHandler>();
  private mentionHandlers: MentionHandler[] = [];
  private messageHandlers: CommandHandler[] = [];
  private middlewares: Array<(ctx: MessageContext | InteractionContext | ComponentContext, next: () => Promise<void>) => Promise<void>> = [];
  public user?: DiscordUser;

  constructor(private opts: BotOptions) {
    super();
    this.rest = new RestClient({ token: opts.token });
  }

  // Command registration
  command(name: string, handler: CommandHandler) {
    this.commands.set(name, handler);
    return this;
  }

  slash(name: string, options: any, handler: CommandHandler) {
    this.slashCommands.set(name, { options, handler });
    return this;
  }

  // Component handling
  component(customId: string, handler: ComponentHandler) {
    this.components.set(customId, handler);
    return this;
  }

  button(customId: string, handler: ComponentHandler) {
    this.components.set(customId, handler);
    return this;
  }

  selectMenu(customId: string, handler: ComponentHandler) {
    this.components.set(customId, handler);
    return this;
  }

  // Mention and message handling
  onMention(handler: MentionHandler) {
    this.mentionHandlers.push(handler);
    return this;
  }

  onMessage(handler: CommandHandler) {
    this.messageHandlers.push(handler);
    return this;
  }

  middleware(fn: (ctx: MessageContext | InteractionContext | ComponentContext, next: () => Promise<void>) => Promise<void>) {
    this.middlewares.push(fn);
    return this;
  }

  onEvent(event: string, handler: CommandHandler) {
    this.on(event, handler);
    return this;
  }

  // File and message utilities
  createEmbed(): EmbedBuilder {
    return new EmbedBuilder();
  }

  createButton(label: string, customId: string, style: ButtonStyle = ButtonStyle.Primary): DiscordButton {
    return {
      type: 2,
      style,
      label,
      custom_id: customId
    };
  }

  createLinkButton(label: string, url: string): DiscordButton {
    return {
      type: 2,
      style: ButtonStyle.Link,
      label,
      url
    };
  }

  createStringSelect(customId: string, options: Array<{ label: string; value: string; description?: string; emoji?: any; default?: boolean }>): DiscordStringSelect {
    return {
      type: 3,
      custom_id: customId,
      options
    };
  }

  createActionRow(...components: DiscordComponent[]): DiscordActionRow {
    return {
      type: 1,
      components
    };
  }

  // File handling
  async uploadFile(channelId: string, file: FileData, content?: string): Promise<any> {
    const formData = new FormData();
    const payload: any = {};
    
    if (content) payload.content = content;
    
    formData.append('payload_json', JSON.stringify(payload));
    const blob = new Blob([file.data instanceof Buffer ? file.data : new Uint8Array(file.data)], { 
      type: file.contentType || 'application/octet-stream' 
    });
    formData.append('files[0]', blob, file.name);
    
    return this.rest.postFormData(`/channels/${channelId}/messages`, formData);
  }

  // Bot lifecycle
  async start() {
    if (this.opts.shardCount && this.opts.shardCount > 1) {
      const manager = new ShardManager({
        token: this.opts.token,
        intents: this.opts.intents,
      });
      manager.spawn(this.opts.shardCount);
      manager.shards.forEach((s) => this.bindGateway(s));
    } else {
      this.gateway = new Gateway({ token: this.opts.token, intents: this.opts.intents });
      this.bindGateway(this.gateway);
      this.gateway.connect();
    }
    if (this.opts.autoSyncCommands) {
      await this.syncCommands({ scope: 'global' });
    }
  }

  private bindGateway(g: Gateway) {
    g.on('MESSAGE_CREATE', (msg) => this.handleMessage(msg));
    g.on('INTERACTION_CREATE', (interaction) => this.handleInteraction(interaction));
    g.on('READY', (d) => {
      this.user = d.user;
      this.emit('ready', d);
    });
    g.on('MESSAGE_UPDATE', (msg) => this.emit('messageUpdate', msg));
    g.on('MESSAGE_DELETE', (msg) => this.emit('messageDelete', msg));
    g.on('GUILD_MEMBER_ADD', (member) => this.emit('guildMemberAdd', member));
    g.on('GUILD_MEMBER_REMOVE', (member) => this.emit('guildMemberRemove', member));
  }

  private async runMiddlewares(ctx: MessageContext | InteractionContext | ComponentContext, handler: CommandHandler | ComponentHandler) {
    let idx = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= idx) return;
      idx = i;
      const fn = this.middlewares[i];
      if (fn) await fn(ctx, () => dispatch(i + 1));
      else await handler(ctx as any);
    };
    await dispatch(0);
  }

  private async handleMessage(msg: DiscordMessage) {
    try {
      const ctx = this.createMessageContext(msg);
      
      // Handle mentions
      const botMention = this.user && msg.mentions.some(u => u.id === this.user!.id);
      if (botMention && this.mentionHandlers.length > 0) {
        for (const handler of this.mentionHandlers) {
          await this.runMiddlewares(ctx, handler as any);
        }
      }
      
      // Handle all messages if enabled
      if (this.opts.handleAllMessages && this.messageHandlers.length > 0) {
        for (const handler of this.messageHandlers) {
          await this.runMiddlewares(ctx, handler);
        }
      }
      
      // Handle prefix commands
      const prefix = this.opts.prefix;
      const mentionPrefix = this.opts.mentionPrefix && this.user && msg.content.startsWith(`<@${this.user.id}>`);
      
      if (prefix && msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        
        if (commandName) {
          const handler = this.commands.get(commandName);
          if (handler) {
            ctx.args = args;
            await this.runMiddlewares(ctx, handler);
          }
        }
      } else if (mentionPrefix) {
        const args = msg.content.replace(`<@${this.user!.id}>`, '').trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        
        if (commandName) {
          const handler = this.commands.get(commandName);
          if (handler) {
            ctx.args = args;
            await this.runMiddlewares(ctx, handler);
          }
        }
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  private async handleInteraction(inter: DiscordInteraction) {
    try {
      if (inter.type === 2) { // Application Command
        const name = inter.data?.name;
        if (name) {
          const cmd = this.slashCommands.get(name);
          if (cmd) {
            const ctx = this.createInteractionContext(inter);
            await this.runMiddlewares(ctx, cmd.handler);
          }
        }
      } else if (inter.type === 3) { // Message Component
        const customId = inter.data?.custom_id;
        if (customId) {
          const handler = this.components.get(customId);
          if (handler) {
            const ctx = this.createComponentContext(inter);
            await this.runMiddlewares(ctx, handler);
          }
        }
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  private createMessageContext(msg: DiscordMessage): MessageContext {
    const ctx: MessageContext = {
      message: msg,
      author: msg.author,
      member: msg.member,
      channel: { id: msg.channel_id } as DiscordChannel,
      guild: msg.guild_id ? { id: msg.guild_id } : undefined,
      content: msg.content,
      mentions: msg.mentions,
      mentionedRoles: msg.mention_roles,
      attachments: msg.attachments,
      args: [],
      bot: this,
      reply: (content: string | MessagePayload) => this.sendMessage(msg.channel_id, content, msg.id),
      send: (content: string | MessagePayload) => this.sendMessage(msg.channel_id, content),
      react: (emoji: string) => this.rest.put(`/channels/${msg.channel_id}/messages/${msg.id}/reactions/${encodeURIComponent(emoji)}/@me`, {}),
      edit: (messageId: string, content: string | MessagePayload) => this.editMessage(msg.channel_id, messageId, content),
      delete: (messageId?: string) => this.rest.delete(`/channels/${msg.channel_id}/messages/${messageId || msg.id}`),
      createButton: this.createButton.bind(this),
      createActionRow: this.createActionRow.bind(this)
    };
    return ctx;
  }

  private createInteractionContext(inter: DiscordInteraction): InteractionContext {
    const options = new Map();
    if (inter.data?.options) {
      for (const option of inter.data.options) {
        options.set(option.name, option.value);
      }
    }

    const ctx: InteractionContext = {
      interaction: inter,
      user: inter.user || (inter.member?.user ?? { id: '', username: '', discriminator: '0000' }),
      member: inter.member,
      channel: { id: inter.channel_id ?? '' } as DiscordChannel,
      guild: inter.guild_id ? { id: inter.guild_id } : undefined,
      options,
      bot: this,
      reply: (content: string | MessagePayload) => this.replyToInteraction(inter, content),
      editReply: (content: string | MessagePayload) => this.editInteractionResponse(inter, content),
      deleteReply: () => this.rest.delete(`/webhooks/${inter.application_id}/${inter.token}/messages/@original`),
      followUp: (content: string | MessagePayload) => this.followUpInteraction(inter, content),
      defer: (ephemeral = false) => this.deferInteraction(inter, ephemeral),
      showModal: (title: string, customId: string, components: DiscordActionRow[]) => this.showModal(inter, title, customId, components),
      createButton: this.createButton.bind(this),
      createActionRow: this.createActionRow.bind(this)
    };
    return ctx;
  }

  private createComponentContext(inter: DiscordInteraction): ComponentContext {
    const ctx: ComponentContext = {
      interaction: inter,
      user: inter.user || (inter.member?.user ?? { id: '', username: '', discriminator: '0000' }),
      member: inter.member,
      channel: { id: inter.channel_id ?? '' } as DiscordChannel,
      guild: inter.guild_id ? { id: inter.guild_id } : undefined,
      customId: inter.data?.custom_id ?? '',
      values: inter.data?.values,
      bot: this,
      reply: (content: string | MessagePayload) => this.replyToInteraction(inter, content),
      update: (content: string | MessagePayload) => this.updateInteraction(inter, content),
      defer: (ephemeral = false) => this.deferInteraction(inter, ephemeral),
      followUp: (content: string | MessagePayload) => this.followUpInteraction(inter, content),
      createButton: this.createButton.bind(this),
      createActionRow: this.createActionRow.bind(this)
    };
    return ctx;
  }

  // Utility methods
  private async sendMessage(channelId: string, content: string | MessagePayload, replyToId?: string) {
    const payload = typeof content === 'string' ? { content } : content;
    if (replyToId) {
      payload.message_reference = { message_id: replyToId };
    }
    return this.rest.post(`/channels/${channelId}/messages`, payload);
  }

  private async editMessage(channelId: string, messageId: string, content: string | MessagePayload) {
    const payload = typeof content === 'string' ? { content } : content;
    return this.rest.patch(`/channels/${channelId}/messages/${messageId}`, payload);
  }

  private async replyToInteraction(inter: DiscordInteraction, content: string | MessagePayload) {
    const data = typeof content === 'string' ? { content } : content;
    const response: DiscordInteractionResponse = {
      type: InteractionResponseType.ChannelMessageWithSource,
      data
    };
    return this.rest.post(`/interactions/${inter.id}/${inter.token}/callback`, response);
  }

  private async updateInteraction(inter: DiscordInteraction, content: string | MessagePayload) {
    const data = typeof content === 'string' ? { content } : content;
    const response: DiscordInteractionResponse = {
      type: InteractionResponseType.UpdateMessage,
      data
    };
    return this.rest.post(`/interactions/${inter.id}/${inter.token}/callback`, response);
  }

  private async deferInteraction(inter: DiscordInteraction, ephemeral = false) {
    const response: DiscordInteractionResponse = {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data: ephemeral ? { flags: 64 } : undefined
    };
    return this.rest.post(`/interactions/${inter.id}/${inter.token}/callback`, response);
  }

  private async editInteractionResponse(inter: DiscordInteraction, content: string | MessagePayload) {
    const data = typeof content === 'string' ? { content } : content;
    return this.rest.patch(`/webhooks/${inter.application_id}/${inter.token}/messages/@original`, data);
  }

  private async followUpInteraction(inter: DiscordInteraction, content: string | MessagePayload) {
    const data = typeof content === 'string' ? { content } : content;
    return this.rest.post(`/webhooks/${inter.application_id}/${inter.token}`, data);
  }

  private async showModal(inter: DiscordInteraction, title: string, customId: string, components: DiscordActionRow[]) {
    const response: DiscordInteractionResponse = {
      type: InteractionResponseType.Modal,
      data: {
        title,
        custom_id: customId,
        components
      } as DiscordInteractionCallbackData
    };
    return this.rest.post(`/interactions/${inter.id}/${inter.token}/callback`, response);
  }

  async syncCommands(opts: { scope: 'global' | 'guild'; guildId?: string }) {
    const commands = Array.from(this.slashCommands.entries()).map(([name, { options }]) => ({
      name,
      ...options,
    }));
    if (opts.scope === 'global') {
      await this.rest.bulkOverwriteCommands('global', commands);
    } else {
      if (opts.guildId) {
        await this.rest.bulkOverwriteCommands(opts.guildId, commands);
      }
    }
    logger.info('Commands synced');
  }
}

// Embed Builder Helper Class
export class EmbedBuilder {
  private embed: DiscordEmbed = {};

  setTitle(title: string) {
    this.embed.title = title;
    return this;
  }

  setDescription(description: string) {
    this.embed.description = description;
    return this;
  }

  setColor(color: number) {
    this.embed.color = color;
    return this;
  }

  setAuthor(name: string, iconUrl?: string, url?: string) {
    this.embed.author = { name, icon_url: iconUrl, url };
    return this;
  }

  setFooter(text: string, iconUrl?: string) {
    this.embed.footer = { text, icon_url: iconUrl };
    return this;
  }

  setImage(url: string) {
    this.embed.image = { url };
    return this;
  }

  setThumbnail(url: string) {
    this.embed.thumbnail = { url };
    return this;
  }

  addField(name: string, value: string, inline = false) {
    if (!this.embed.fields) this.embed.fields = [];
    this.embed.fields.push({ name, value, inline });
    return this;
  }

  setTimestamp(date?: Date) {
    this.embed.timestamp = (date || new Date()).toISOString();
    return this;
  }

  setUrl(url: string) {
    this.embed.url = url;
    return this;
  }

  toJSON(): DiscordEmbed {
    return this.embed;
  }
}
