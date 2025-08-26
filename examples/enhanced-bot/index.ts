import { 
  UniCordBot, 
  ButtonStyle, 
  DiscordScopes, 
  OAuth2,
  EmbedBuilder,
  exchangeCodeForTokenNode,
  getUserDisplayName,
  hasPermission,
  Permissions 
} from '../../src/index';

// Enhanced Discord Bot Example
const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513, // GUILDS + GUILD_MESSAGES
  prefix: '!',
  mentionPrefix: true,
  handleAllMessages: true,
  autoSyncCommands: true
});

// Middleware for logging
bot.middleware(async (ctx, next) => {
  console.log(`Command executed by ${ctx.user?.username || ctx.author?.username}`);
  await next();
});

// Basic ping command with interactive components
bot.slash('ping', {
  description: 'Ping the bot with interactive buttons'
}, async (ctx) => {
  const embed = bot.createEmbed()
    .setTitle('🏓 Pong!')
    .setDescription('Bot is online and ready!')
    .setColor(0x00ff00)
    .addField('Response Time', '42ms', true)
    .addField('Uptime', '5 days', true)
    .setTimestamp();

  const buttons = [
    bot.createButton('Refresh', 'ping_refresh', ButtonStyle.Primary),
    bot.createButton('Stats', 'ping_stats', ButtonStyle.Secondary),
    bot.createLinkButton('Invite Bot', 'https://discord.com/oauth2/authorize?client_id=123')
  ];

  const actionRow = bot.createActionRow(...buttons);

  await ctx.reply({
    embeds: [embed.toJSON()],
    components: [actionRow]
  });
});

// Handle button interactions
bot.button('ping_refresh', async (ctx) => {
  await ctx.update({
    content: '✅ Refreshed! Bot is still running perfectly.',
    components: []
  });
});

bot.button('ping_stats', async (ctx) => {
  const embed = bot.createEmbed()
    .setTitle('📊 Bot Statistics')
    .addField('Servers', '150', true)
    .addField('Users', '50,000', true)
    .addField('Commands Run', '1,234,567', true)
    .setColor(0x0099ff);

  await ctx.update({
    embeds: [embed.toJSON()],
    components: []
  });
});

// File upload command
bot.command('upload', async (ctx) => {
  if (ctx.message.attachments.length === 0) {
    await ctx.reply('Please attach a file to upload!');
    return;
  }

  const attachment = ctx.message.attachments[0];
  
  // Process and re-upload file
  const processedFile = {
    name: `processed_${attachment.filename}`,
    data: Buffer.from('Processed file content'),
    contentType: 'text/plain'
  };

  const embed = bot.createEmbed()
    .setTitle('✅ File Processed')
    .setDescription(`Your file "${attachment.filename}" has been processed!`)
    .setColor(0x00ff00);

  await bot.uploadFile(ctx.message.channel_id, processedFile);
  await ctx.reply({ embeds: [embed.toJSON()] });
});

// Advanced form with select menus
bot.slash('feedback', {
  description: 'Submit feedback with interactive form'
}, async (ctx) => {
  const categorySelect = bot.createStringSelect('feedback_category', [
    { label: '🐛 Bug Report', value: 'bug', description: 'Report a bug or issue' },
    { label: '💡 Feature Request', value: 'feature', description: 'Request a new feature' },
    { label: '❓ General Question', value: 'question', description: 'Ask a general question' },
    { label: '👍 Compliment', value: 'compliment', description: 'Share positive feedback' }
  ]);

  const actionRow = bot.createActionRow(categorySelect);

  await ctx.reply({
    content: '📝 Please select a feedback category:',
    components: [actionRow],
    flags: 64 // Ephemeral
  });
});

bot.selectMenu('feedback_category', async (ctx) => {
  const category = ctx.values?.[0];
  const categoryEmojis = {
    bug: '🐛',
    feature: '💡', 
    question: '❓',
    compliment: '👍'
  };

  await ctx.update({
    content: `${categoryEmojis[category as keyof typeof categoryEmojis]} Thank you for selecting "${category}". Your feedback has been recorded!`,
    components: []
  });
});

// Auto-moderation with mention handling
bot.onMessage(async (ctx) => {
  // Auto-delete messages with prohibited content
  if (ctx.content.toLowerCase().includes('spam')) {
    await ctx.delete();
    
    const embed = bot.createEmbed()
      .setTitle('⚠️ Message Removed')
      .setDescription('Your message was removed for containing prohibited content.')
      .setColor(0xff0000)
      .addField('User', ctx.author.username, true)
      .addField('Reason', 'Spam content detected', true)
      .setTimestamp();

    await ctx.send({ embeds: [embed.toJSON()] });
  }
});

// Respond to mentions
bot.onMention(async (ctx) => {
  const responses = [
    "👋 Hello! You mentioned me!",
    "🤖 I'm here! How can I help?",
    "✨ You called? I'm ready to assist!"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  await ctx.reply(randomResponse);
});

// Advanced permission checking command
bot.command('permissions', async (ctx) => {
  if (!ctx.member) {
    await ctx.reply('This command can only be used in servers!');
    return;
  }

  // Simulate checking permissions (in real bot, you'd get this from Discord API)
  const userPermissions = '8'; // Administrator for example
  
  const checks = [
    { name: 'Administrator', permission: Permissions.ADMINISTRATOR },
    { name: 'Manage Server', permission: Permissions.MANAGE_GUILD },
    { name: 'Manage Messages', permission: Permissions.MANAGE_MESSAGES },
    { name: 'Kick Members', permission: Permissions.KICK_MEMBERS }
  ];

  const embed = bot.createEmbed()
    .setTitle(`🔐 Permissions for ${ctx.author.username}`)
    .setColor(0x5865f2);

  const mockGuild = { 
    id: ctx.guild?.id || '123', 
    name: 'Test Server',
    permissions: userPermissions,
    owner: false
  };

  checks.forEach(check => {
    const hasPermission = hasPermission(mockGuild, check.permission);
    embed.addField(
      check.name, 
      hasPermission ? '✅ Yes' : '❌ No', 
      true
    );
  });

  await ctx.reply({ embeds: [embed.toJSON()] });
});

// Start the bot
bot.start().then(() => {
  console.log('🚀 UniCord bot is online!');
}).catch(console.error);

// Enhanced OAuth2 Example for Web Integration
const oauth = new OAuth2({
  clientId: process.env.DISCORD_CLIENT_ID!,
  redirectUri: 'http://localhost:3000/auth/callback',
  backendTokenURL: '/api/auth/discord'
});

export { bot, oauth };