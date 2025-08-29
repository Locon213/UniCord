import { UniCordBot } from '../../src/index';

// Enhanced bot with new features
const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513, // GUILDS + GUILD_MESSAGES
  prefix: '!',
  mentionPrefix: true,
  handleAllMessages: true,
  autoSyncCommands: true
});

// Enhanced command with options
bot.command('ping', async (ctx) => {
  const start = Date.now();
  const msg = await ctx.reply('🏓 Pong!');
  const end = Date.now();
  
  if ('edit' in ctx) {
    await ctx.edit(msg.id, `🏓 Pong! Latency: ${end - start}ms`);
  }
}, {
  aliases: ['p', 'pingpong'],
  description: 'Check bot latency',
  category: 'Utility'
});

// Command with arguments and mentions
bot.command('kick', async (ctx) => {
  if ('mentions' in ctx && 'args' in ctx) {
    const user = ctx.mentions[0];
    const reason = ctx.args.join(' ') || 'No reason provided';
    
    if (!user) {
      await ctx.reply('❌ Please mention a user to kick!');
      return;
    }
    
    if (user.id === ctx.author.id) {
      await ctx.reply('❌ You cannot kick yourself!');
      return;
    }
    
    // Create confirmation embed
    const embed = bot.createEmbed()
      .setTitle('🦵 Kick Confirmation')
      .setDescription(`Are you sure you want to kick **${user.username}**?`)
      .addField('Reason', reason)
      .setColor(0xff9900)
      .setTimestamp();
    
    await ctx.reply({ embeds: [embed.toJSON()] });
  }
}, {
  aliases: ['boot', 'remove'],
  description: 'Kick a user from the server',
  category: 'Moderation'
});

// Enhanced slash command
bot.slash('userinfo', {
  description: 'Get information about a user',
  type: 1,
  options: [
    {
      name: 'user',
      description: 'The user to get info about',
      type: 6, // USER type
      required: false
    }
  ]
}, async (ctx) => {
  const targetUser = 'user' in ctx ? ctx.user : ctx.author;
  const member = 'member' in ctx ? ctx.member : undefined;
  
  const embed = bot.createEmbed()
    .setTitle(`${targetUser.username}'s Information`)
    .addField('User ID', targetUser.id, true)
    .addField('Username', targetUser.username, true)
    .addField('Discriminator', targetUser.discriminator || 'N/A', true);
  
  if (member) {
    embed.addField('Joined Server', new Date(member.joined_at!).toLocaleDateString(), true);
    embed.addField('Nickname', member.nick || 'None', true);
    embed.addField('Roles', member.roles?.length ? member.roles.length.toString() : '0', true);
  }
  
  embed.setColor(0x00ff00)
    .setTimestamp();
  
  await ctx.reply({ embeds: [embed.toJSON()] });
});

// Interactive menu command
bot.slash('menu', {
  description: 'Show interactive menu with buttons and select',
  type: 1
}, async (ctx) => {
  const button1 = bot.createButton('Click Me!', 'btn_1', 1); // Primary
  const button2 = bot.createButton('Danger!', 'btn_2', 4);   // Danger
  const button3 = bot.createLinkButton('Link', 'https://github.com/Locon213/UniCord');
  
  const select = bot.createStringSelect('choice', [
    { label: 'Option 1', value: 'opt1', description: 'First option' },
    { label: 'Option 2', value: 'opt2', description: 'Second option' },
    { label: 'Option 3', value: 'opt3', description: 'Third option' }
  ]);
  
  const buttonRow = bot.createActionRow(button1, button2, button3);
  const selectRow = bot.createActionRow(select);
  
  await ctx.reply({
    content: '🎛️ **Interactive Menu**\nChoose an option below:',
    components: [buttonRow, selectRow]
  });
});

// Button handlers
bot.button('btn_1', async (ctx) => {
  await ctx.update({ 
    content: '✅ Button 1 clicked! You chose the primary option.',
    components: [] 
  });
});

bot.button('btn_2', async (ctx) => {
  await ctx.update({ 
    content: '⚠️ Button 2 clicked! This was the danger option.',
    components: [] 
  });
});

// Select menu handler
bot.selectMenu('choice', async (ctx) => {
  const selected = ctx.values?.[0];
  const options = {
    'opt1': 'First option - Great choice! 🎉',
    'opt2': 'Second option - Nice pick! 👍',
    'opt3': 'Third option - Excellent! 🌟'
  };
  
  await ctx.update({ 
    content: `🎯 You selected: **${options[selected as keyof typeof options] || 'Unknown option'}**`,
    components: [] 
  });
});

// Event handlers
bot.onGuildMemberAdd(async (member) => {
  console.log(`🎉 Welcome ${member.user?.username} to the server!`);
});

// Use onMessage event instead of onMessageCreate for better compatibility
bot.onMessage(async (ctx) => {
  if ('content' in ctx) {
    const content = ctx.content.toLowerCase();
    
    if (content.includes('hello') || content.includes('hi')) {
      await ctx.reply('👋 Hello there! How can I help you?');
    }
    
    if (content.includes('help')) {
      await ctx.reply('📚 Need help? Use `!help` or `/help` for commands!');
    }
    
    if (content.includes('thanks') || content.includes('thank you')) {
      await ctx.reply('😊 You\'re welcome!');
    }
  }
});

bot.onGuildCreate(async (guild) => {
  console.log(`🎉 Bot joined new guild: ${guild.name} (${guild.id})`);
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('commandNotFound', ({ message, command }) => {
  console.log(`Command not found: ${command} in ${message.guild_id}`);
});

// Middleware for logging
bot.middleware(async (ctx, next) => {
  const start = Date.now();
  const content = 'content' in ctx ? ctx.content : 'interaction';
  console.log(`[${new Date().toISOString()}] Command executed: ${content}`);
  
  try {
    await next();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Command error:`, error);
    throw error;
  } finally {
    const end = Date.now();
    console.log(`[${new Date().toISOString()}] Command completed in ${end - start}ms`);
  }
});

// Start the bot
bot.start().then(() => {
  console.log('🚀 Enhanced UniCord bot is running!');
  console.log('📚 Use !help or /help for commands');
  console.log('🎛️ Try the interactive menu with /menu');
}).catch(console.error);
