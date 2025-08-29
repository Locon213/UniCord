# UniCord Docker Example

This example demonstrates how to deploy a UniCord bot using Docker with a complete production stack.

## 🐳 What's Included

- **Multi-stage Docker build** for optimized images
- **Docker Compose** with full production stack
- **Redis** for caching and session storage
- **PostgreSQL** for persistent data
- **Nginx** reverse proxy with SSL
- **Prometheus** monitoring and metrics
- **Health checks** for all services

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Discord Bot Token

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Locon213/UniCord.git
   cd UniCord
   ```

2. **Create environment file**
   ```bash
   cp env.example .env
   # Edit .env with your Discord credentials
   ```

3. **Start all services**
   ```bash
   npm run docker:compose
   ```

4. **Check status**
   ```bash
   docker-compose ps
   ```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (SSL)   │───▶│   UniCord Bot   │───▶│   PostgreSQL    │
│   Port 80/443   │    │   Port 3000     │    │   Port 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │    │      Redis      │    │   Health Checks │
│   Port 9090     │    │   Port 6379     │    │   Auto-restart  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

```env
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Database Configuration
POSTGRES_USER=unicord
POSTGRES_PASSWORD=unicord123
POSTGRES_DB=unicord

# Redis Configuration
REDIS_PASSWORD=unicord123
```

### Docker Services

- **Bot**: UniCord bot application
- **Redis**: Caching and session storage
- **PostgreSQL**: Persistent data storage
- **Nginx**: Reverse proxy and SSL termination
- **Prometheus**: Monitoring and metrics collection

## 📊 Monitoring

### Access Points

- **Bot API**: `http://localhost:3000`
- **Prometheus**: `http://localhost:9090`
- **Health Check**: `http://localhost/health`
- **Nginx Status**: `http://localhost/nginx_status`

### Metrics

The bot exposes metrics at `/metrics` endpoint for Prometheus scraping.

## 🔒 Security

### SSL Configuration

Nginx is configured with SSL/TLS best practices:
- TLS 1.2 and 1.3 only
- Strong cipher suites
- Security headers
- Rate limiting

### Rate Limiting

- API endpoints: 10 requests/second
- OAuth endpoints: 5 requests/second
- Configurable burst limits

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale bot instances
docker-compose up -d --scale bot=3

# Check status
docker-compose ps
```

### Load Balancing

Nginx automatically load balances between bot instances.

## 🚨 Troubleshooting

### Common Issues

#### Bot Won't Start
```bash
# Check logs
docker-compose logs bot

# Check environment
docker-compose exec bot env | grep DISCORD
```

#### Database Issues
```bash
# Check PostgreSQL
docker-compose exec postgres pg_isready -U unicord

# Check logs
docker-compose logs postgres
```

#### Redis Issues
```bash
# Test Redis
docker-compose exec redis redis-cli -a unicord123 ping

# Check logs
docker-compose logs redis
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Monitor logs
docker-compose logs -f
```

## 🔄 Maintenance

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backups

```bash
# Database backup
docker-compose exec postgres pg_dump -U unicord unicord > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U unicord unicord < backup.sql
```

## 📚 Documentation

- [Docker Deployment Guide](../../WIKI/Docker-Deployment.md)
- [Getting Started](../../WIKI/Getting-Started.md)
- [API Reference](../../WIKI/API-Reference.md)

## 🤝 Support

For Docker-related issues:
- Check [Docker documentation](https://docs.docker.com/)
- Review [Docker Compose reference](https://docs.docker.com/compose/)
- Open an issue on [GitHub](https://github.com/Locon213/UniCord/issues)

---

**Happy deploying! 🚀**
