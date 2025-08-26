# Bot Commands

@locon213/unicord supports both text commands and slash commands with a unified API.

## Text Commands

```typescript
// Simple text command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

// Command with arguments
bot.command('echo', async (ctx) => {
  const message = ctx.args.join(' ');
  if (!message) {
    await ctx.reply('Please provide a message to echo!');
    return;
  }
  await ctx.reply(`You said: ${message}`);
});

// Command with rich context
bot.command('userinfo', async (ctx) => {
  const embed = bot.createEmbed()
    .setTitle('User Information')
    .addField('Username', ctx.author.username, true)
    .addField('User ID', ctx.author.id, true)
    .setThumbnail(`https://cdn.discordapp.com/avatars/${ctx.author.id}/${ctx.author.avatar}.png`);
    
  await ctx.reply({ embeds: [embed.toJSON()] });
});
```

## Slash Commands

```typescript
// Simple slash command
bot.slash('ping', { 
  description: 'Ping the bot' 
}, async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

// Slash command with options
bot.slash('greet', {
  description: 'Greet someone',
  options: [
    {
      name: 'user',
      description: 'User to greet',
      type: 6, // USER
      required: true
    },
    {
      name: 'message',
      description: 'Custom greeting message',
      type: 3, // STRING
      required: false
    }
  ]
}, async (ctx) => {
  const user = ctx.options.get('user');
  const customMessage = ctx.options.get('message') || 'Hello';
  
  await ctx.reply(`${customMessage}, <@${user}>!`);
});
```

## Interactive Components

```typescript
// Command with buttons
bot.slash('menu', { description: 'Show interactive menu' }, async (ctx) => {
  const embed = bot.createEmbed()
    .setTitle('Interactive Menu')
    .setDescription('Choose an option below:');
    
  const buttons = [
    bot.createButton('Option 1', 'opt_1', ButtonStyle.Primary),
    bot.createButton('Option 2', 'opt_2', ButtonStyle.Secondary),
    bot.createButton('Cancel', 'cancel', ButtonStyle.Danger)
  ];
  
  const row = bot.createActionRow(...buttons);
  
  await ctx.reply({
    embeds: [embed.toJSON()],
    components: [row]
  });
});

// Handle button interactions
bot.button('opt_1', async (ctx) => {
  await ctx.update({ content: 'You chose Option 1! ✅' });
});

bot.button('opt_2', async (ctx) => {
  await ctx.update({ content: 'You chose Option 2! 🔵' });
});

bot.button('cancel', async (ctx) => {
  await ctx.update({ content: 'Operation cancelled ❌', components: [] });
});
```

## Select Menus

```typescript
// Command with select menu
bot.slash('categories', { description: 'Choose from categories' }, async (ctx) => {
  const select = bot.createStringSelect('category_select', [
    { label: '🎮 Gaming', value: 'gaming', description: 'Gaming related content' },
    { label: '🎵 Music', value: 'music', description: 'Music and audio' },
    { label: '📚 Books', value: 'books', description: 'Literature and reading' },
    { label: '🎨 Art', value: 'art', description: 'Visual arts and creativity' }
  ]);
  
  const row = bot.createActionRow(select);
  
  await ctx.reply({
    content: 'Please select a category:',
    components: [row]
  });
});

// Handle select menu interactions
bot.selectMenu('category_select', async (ctx) => {
  const selected = ctx.values?.[0];
  const categoryEmojis = {
    gaming: '🎮',
    music: '🎵',
    books: '📚',
    art: '🎨'
  };
  
  await ctx.update({
    content: `${categoryEmojis[selected]} You selected: ${selected}`,
    components: []
  });
});
```

## File Handling

```typescript
bot.command('upload', async (ctx) => {
  // Check for attachments
  if (ctx.message.attachments.length === 0) {
    await ctx.reply('Please attach a file!');
    return;
  }
  
  // Process the file
  const attachment = ctx.message.attachments[0];
  
  // Create a processed file
  const processedFile = {
    name: `processed_${attachment.filename}`,
    data: Buffer.from('File processed successfully'),
    contentType: 'text/plain'
  };
  
  // Upload the processed file
  await bot.uploadFile(ctx.message.channel_id, processedFile, 'Here is your processed file!');
});
```

## Mention Handling

```typescript
// Respond to mentions
bot.onMention(async (ctx) => {
  const responses = [
    '👋 Hello! You mentioned me!',
    '🤖 I\'m here! How can I help?',
    '✨ You called? I\'m ready to assist!'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  await ctx.reply(randomResponse);
});

// Handle all messages (great for AI bots)
bot.onMessage(async (ctx) => {
  // Auto-moderation
  if (ctx.content.toLowerCase().includes('spam')) {
    await ctx.delete();
    await ctx.send('Message removed: spam content detected');
  }
});
```

## Middleware System

```typescript
// Authentication middleware
bot.middleware(async (ctx, next) => {
  // Check if user is banned
  if (ctx.user?.id === 'banned_user_id') {
    return; // Block execution
  }
  
  // Continue to next middleware/command
  await next();
});

// Logging middleware
bot.middleware(async (ctx, next) => {
  console.log(`Command executed by ${ctx.user?.username}`);
  await next();
  console.log('Command completed');
});
```

## Command Synchronization

```typescript
// Sync commands globally (takes up to 1 hour to propagate)
await bot.syncCommands({ scope: 'global' });

// Sync commands to a specific guild (instant)
await bot.syncCommands({ 
  scope: 'guild', 
  guildId: 'your-guild-id' 
});

// Auto-sync on bot start
const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  autoSyncCommands: true // Automatically sync slash commands
});
```

## Configuration Options

```typescript
const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513, // GUILDS + GUILD_MESSAGES
  prefix: '!', // Text command prefix
  mentionPrefix: true, // Allow @bot command
  handleAllMessages: true, // Process all messages
  autoSyncCommands: true // Auto-sync slash commands
});
```
