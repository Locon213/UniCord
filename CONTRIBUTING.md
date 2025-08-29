# Contributing to UniCord

Thank you for your interest in contributing to UniCord! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control
- **TypeScript** knowledge (basic)

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/UniCord.git
   cd UniCord
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 🔧 Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:
- `feature/command-system` - New features
- `fix/message-parsing` - Bug fixes
- `docs/api-reference` - Documentation updates
- `refactor/bot-class` - Code refactoring

### Commit Messages

Follow conventional commit format:
```
type(scope): description

feat(bot): add command cooldown system
fix(gateway): resolve connection timeout issue
docs(readme): update installation instructions
refactor(types): improve Discord interface definitions
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following coding standards
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run the test suite** to ensure everything works
6. **Submit a pull request** with clear description

## 📝 Coding Standards

### TypeScript

- Use **strict mode** and **strict null checks**
- Prefer **interfaces** over types for object shapes
- Use **async/await** instead of raw promises
- Add **JSDoc comments** for public APIs

### Code Style

- Follow **ESLint** configuration
- Use **Prettier** for code formatting
- Maximum line length: **100 characters**
- Use **meaningful variable names**

### Example

```typescript
/**
 * Creates a new Discord embed with the specified title
 * @param title - The embed title
 * @returns EmbedBuilder instance
 */
export function createEmbed(title: string): EmbedBuilder {
  return new EmbedBuilder().setTitle(title);
}

// ✅ Good
const userCount = guild.member_count || 0;
const hasPermission = member.permissions?.includes('ADMINISTRATOR');

// ❌ Bad
const c = g.member_count || 0;
const perm = m.permissions?.includes('ADMINISTRATOR');
```

## 🧪 Testing

### Writing Tests

- Use **Vitest** testing framework
- Test **both success and failure cases**
- Mock **external dependencies**
- Aim for **high test coverage**

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { UniCordBot } from '../src/bot/bot';

describe('UniCordBot', () => {
  let bot: UniCordBot;

  beforeEach(() => {
    bot = new UniCordBot({
      token: 'test-token',
      intents: 513
    });
  });

  describe('command registration', () => {
    it('should register text commands', () => {
      bot.command('test', () => {});
      expect(bot['commands'].has('test')).toBe(true);
    });

    it('should handle command execution', async () => {
      let executed = false;
      bot.command('test', () => { executed = true; });
      
      // Test command execution
      expect(executed).toBe(true);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- bot.test.ts
```

## 📚 Documentation

### Code Documentation

- **Document all public APIs** with JSDoc
- **Include usage examples** in comments
- **Update README** for new features
- **Maintain Wiki** documentation

### Documentation Standards

```typescript
/**
 * Represents a Discord message context for command handling
 * @interface MessageContext
 */
export interface MessageContext {
  /** The original Discord message */
  message: DiscordMessage;
  
  /** The message author */
  author: DiscordUser;
  
  /** Reply to the message
   * @param content - Text or message payload to send
   * @returns Promise resolving to the sent message
   */
  reply(content: string | MessagePayload): Promise<any>;
}
```

## 🐛 Bug Reports

### Before Reporting

1. **Check existing issues** for duplicates
2. **Verify the issue** with latest version
3. **Provide minimal reproduction** steps
4. **Include error messages** and stack traces

### Bug Report Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows 10
- Node.js: 18.17.0
- UniCord: 0.1.3

## Additional Information
Any other relevant details
```

## 💡 Feature Requests

### Feature Request Guidelines

- **Describe the problem** you're solving
- **Explain the solution** you propose
- **Consider alternatives** and trade-offs
- **Show use cases** and examples

### Feature Request Template

```markdown
## Problem Statement
Describe the problem this feature would solve

## Proposed Solution
Explain your proposed solution

## Use Cases
- Use case 1
- Use case 2
- Use case 3

## Alternatives Considered
What other approaches were considered

## Additional Context
Any other relevant information
```

## 🔒 Security

### Security Guidelines

- **Never commit sensitive data** (tokens, keys, passwords)
- **Report security vulnerabilities** privately
- **Follow security best practices** in code
- **Validate all user input** thoroughly

### Reporting Security Issues

For security vulnerabilities, please email:
- **Email**: security@unicord.dev
- **Subject**: [SECURITY] UniCord Vulnerability Report

## 🏗️ Architecture

### Project Structure

```
src/
├── bot/           # Bot framework and commands
├── gateway/       # Discord Gateway connection
├── rest/          # Discord REST API client
├── oauth/         # OAuth2 implementation
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── webhooks/      # Webhook handling
```

### Key Principles

- **Separation of concerns** - Each module has a single responsibility
- **Dependency injection** - Dependencies are passed in, not created
- **Event-driven architecture** - Components communicate via events
- **Type safety** - Full TypeScript coverage for all APIs

## 🚀 Release Process

### Version Bumping

- **Patch** (0.1.3 → 0.1.4) - Bug fixes
- **Minor** (0.1.3 → 0.2.0) - New features, backward compatible
- **Major** (0.1.3 → 1.0.0) - Breaking changes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes written
- [ ] NPM package published

## 🤝 Community

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Discord Server** - For real-time help and chat

### Code of Conduct

- **Be respectful** to all contributors
- **Welcome newcomers** and help them learn
- **Focus on the code** and technical discussions
- **Report inappropriate behavior** to maintainers

## 📞 Contact

### Maintainers

- **Locon213** - Project lead and main maintainer
- **GitHub**: [@Locon213](https://github.com/Locon213)

### Communication Channels

- **GitHub Issues**: [UniCord Issues](https://github.com/Locon213/UniCord/issues)
- **GitHub Discussions**: [UniCord Discussions](https://github.com/Locon213/UniCord/discussions)
- **Email**: andrei070220111@gmail.com

## 🙏 Acknowledgments

Thank you to all contributors who have helped make UniCord what it is today! Your contributions, whether big or small, are greatly appreciated.

---

**Happy contributing! 🚀**
