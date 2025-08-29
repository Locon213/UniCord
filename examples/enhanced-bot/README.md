# Enhanced UniCord Bot Example

This example demonstrates all the new features introduced in UniCord 0.1.3, including enhanced command handling, interactive components, and improved event system.

## 🚀 Features Demonstrated

- **Enhanced Commands**: Commands with aliases, descriptions, and categories
- **Interactive Components**: Buttons, select menus, and action rows
- **Event Handling**: Guild events, member events, and message events
- **Middleware**: Command logging and error handling
- **Improved API**: Better command parsing and argument handling

## 📦 Installation

```bash
cd examples/enhanced-bot
npm install
```

## 🔧 Configuration

Create a `.env` file in the example directory:

```env
DISCORD_TOKEN=your_bot_token_here
```

## 🚀 Running the Bot

```bash
# Start the bot
npm start

# Development mode with auto-restart
npm run dev
```

## 🎮 Available Commands

### Text Commands
- `!ping` / `!p` / `!pingpong` - Check bot latency
- `!kick @user [reason]` - Kick confirmation (demo)

### Slash Commands
- `/userinfo [user]` - Get user information
- `/menu` - Interactive menu with buttons and select

## 🎛️ Interactive Features

### Buttons
- **Click Me!** - Primary button example
- **Danger!** - Danger button example
- **Link** - External link button

### Select Menu
- **Option 1** - First choice
- **Option 2** - Second choice  
- **Option 3** - Third choice

## 🔍 Event Handling

The bot automatically responds to:
- **Hello/Hi** - Greets users
- **Help** - Provides help information
- **Thanks/Thank you** - Responds politely
- **New members** - Welcomes new server members
- **New guilds** - Logs when joining new servers

## 🛠️ Middleware

The bot includes middleware for:
- Command execution logging
- Performance timing
- Error handling and logging

## 📚 Next Steps

- Customize commands for your needs
- Add more interactive components
- Implement database integration
- Add permission checking
- Create custom embeds

## 🐳 Docker Deployment

This example can be deployed using the Docker setup from the main project:

```bash
# From project root
npm run docker:compose
```

## 📖 Documentation

- [Getting Started](../../WIKI/Getting-Started.md)
- [Bot Commands](../../WIKI/Bot-Commands.md)
- [API Reference](../../WIKI/API-Reference.md)
- [Docker Deployment](../../WIKI/Docker-Deployment.md)

---

**Happy coding with UniCord! 🚀**
