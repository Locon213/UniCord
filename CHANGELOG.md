# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Voice channel support
- Advanced permission system
- Plugin architecture
- WebSocket API for real-time updates

## [0.1.3] - 2025-08-30

### 🎉 Major Release - Thank you for 135+ weekly downloads!

### Added

- 🐳 **Complete Docker Support**
  - Multi-stage Docker builds for optimized images
  - Docker Compose with full production stack
  - Redis for caching and session storage
  - PostgreSQL for persistent data storage
  - Nginx reverse proxy with SSL support
  - Prometheus monitoring and metrics
  - Health checks for all services
  - Auto-restart and failover support

- 🤖 **Enhanced Bot API**
  - Full Discord.js-level functionality
  - Improved command handling with aliases and cooldowns
  - Enhanced slash command registration
  - Comprehensive event handling system
  - Guild management API (create, update, delete)
  - Role management (create, update, delete)
  - Channel management (create, update, delete)
  - Message management (get, delete, bulk delete)
  - User management and information
  - Webhook creation and management
  - Invite system support
  - Emoji management

- 🔧 **Fixed Message Reading**
  - Bots now properly read messages with prefixes like `!ping`
  - Improved command argument parsing with quote support
  - Better handling of mention prefixes
  - Command not found event emission
  - Skip bot messages to prevent loops

- 📚 **Improved Wiki Documentation**
  - Modern documentation following industry standards
  - Comprehensive Getting Started guide
  - Complete Docker deployment guide
  - Advanced bot command examples
  - Best practices and troubleshooting
  - Performance optimization tips

- ⚡ **Performance Improvements**
  - Better caching mechanisms
  - Improved rate limiting
  - Enhanced error handling
  - Memory optimization
  - Connection pooling support

### Changed

- **Version**: Updated from 0.1.2 to 0.1.3
- **Dependencies**: Updated all dependencies to latest versions
- **Documentation**: Complete rewrite of Wiki with modern standards
- **Examples**: Enhanced examples with new API features
- **README**: Added comprehensive badges and feature descriptions

### Fixed

- Bot message reading with prefix commands
- Command argument parsing issues
- Event handling reliability
- Error handling in message processing
- Docker build optimization
- TypeScript type definitions

### Security

- Added security headers in Nginx
- Rate limiting for API endpoints
- Environment variable validation
- Secure Docker configurations
- SSL/TLS best practices

## [0.1.2] - 2025-08-27

### Added

- Basic bot framework
- OAuth2 integration
- Slash command support
- Interactive components (buttons, select menus)
- Embed builder
- Basic TypeScript types

### Fixed

- Initial release bugs
- TypeScript compilation issues
- Basic error handling

## [0.1.1] - 2025-08-27

### Added

- Initial project structure
- Basic Discord API client
- Gateway connection handling
- REST API client

### Fixed

- Project setup issues
- Basic functionality

## [0.1.0] - 2025-08-26

### Added

- Initial project creation
- Basic TypeScript setup
- Project structure and configuration
- README and basic documentation

---

## Migration Guide

### From 0.1.2 to 0.1.3

#### Bot Commands

```typescript
// Old way
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
});

// New way with options
bot.command(
  'ping',
  async (ctx) => {
    await ctx.reply('Pong!');
  },
  {
    aliases: ['p'],
    description: 'Check bot latency',
    category: 'Utility',
  },
);
```

#### Event Handling

```typescript
// Old way
bot.on('GUILD_MEMBER_ADD', handler);

// New way
bot.onGuildMemberAdd(handler);
```

#### Docker Deployment

```bash
# New Docker commands
npm run docker:build
npm run docker:compose
npm run docker:logs
```

### Breaking Changes

- None in this release - all changes are backward compatible
- New features are additive and don't affect existing code

---

## Support

- **GitHub Issues**: [Report bugs](https://github.com/Locon213/UniCord/issues)
- **Documentation**: [Wiki](./WIKI/)
- **Examples**: [examples/](./examples/)

---

**Thank you for using UniCord! 🚀**
