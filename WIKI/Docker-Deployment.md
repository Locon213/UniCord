# Docker Deployment Guide

This guide covers deploying UniCord bots and applications using Docker for production-ready, scalable deployments.

## 🐳 Overview

Our Docker setup provides a complete production environment with:
- **Multi-stage builds** for optimized images
- **Redis** for caching and session storage
- **PostgreSQL** for persistent data
- **Nginx** as reverse proxy with SSL
- **Prometheus** for monitoring and metrics
- **Health checks** for all services

## 🚀 Quick Start

### Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Discord Bot Token** and application credentials

### Environment Setup

Create a `.env` file in your project root:

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

# Optional: Custom ports
NGINX_PORT_HTTP=80
NGINX_PORT_HTTPS=443
PROMETHEUS_PORT=9090
```

### Start Services

```bash
# Start all services
npm run docker:compose

# Or manually
docker-compose up -d

# View logs
npm run docker:logs
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

## 🔧 Service Configuration

### Bot Service

```yaml
bot:
  build: 
    context: .
    dockerfile: Dockerfile
    target: production
  container_name: unicord-bot
  restart: unless-stopped
  env_file: .env
  environment:
    - NODE_ENV=production
    - TZ=UTC
  volumes:
    - ./logs:/app/logs
    - ./config:/app/config
  depends_on:
    - redis
    - postgres
  networks:
    - unicord-network
  healthcheck:
    test: ["CMD", "node", "-e", "console.log('Health check passed')"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

### Redis Service

```yaml
redis:
  image: redis:7-alpine
  container_name: unicord-redis
  restart: unless-stopped
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-unicord123}
  volumes:
    - redis-data:/data
    - ./docker/redis/redis.conf:/usr/local/etc/redis/redis.conf
  ports:
    - "6379:6379"
  networks:
    - unicord-network
  healthcheck:
    test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### PostgreSQL Service

```yaml
postgres:
  image: postgres:15-alpine
  container_name: unicord-postgres
  restart: unless-stopped
  environment:
    POSTGRES_DB: unicord
    POSTGRES_USER: ${POSTGRES_USER:-unicord}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-unicord123}
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
  ports:
    - "5432:5432"
  networks:
    - unicord-network
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-unicord}"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 📊 Monitoring

### Prometheus Configuration

```yaml
monitoring:
  image: prom/prometheus:latest
  container_name: unicord-prometheus
  restart: unless-stopped
  ports:
    - "9090:9090"
  volumes:
    - ./docker/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus-data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
    - '--web.console.libraries=/etc/prometheus/console_libraries'
    - '--web.console.templates=/etc/prometheus/consoles'
    - '--storage.tsdb.retention.time=200h'
    - '--web.enable-lifecycle'
  networks:
    - unicord-network
```

### Metrics Endpoints

- **Bot Metrics**: `http://localhost:3000/metrics`
- **Prometheus**: `http://localhost:9090`
- **Health Check**: `http://localhost/health`

## 🔒 Security

### Nginx Security Headers

```nginx
# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### Rate Limiting

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=oauth:10m rate=5r/s;

# Apply to endpoints
location /api/ {
  limit_req zone=api burst=20 nodelay;
  # ... proxy configuration
}
```

### SSL Configuration

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# Scale bot instances
docker-compose up -d --scale bot=3

# Load balancer configuration
nginx:
  # ... existing config
  depends_on:
    - bot
  volumes:
    - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
```

### Sharding Support

```typescript
// In your bot code
const bot = new UniCordBot({
  token: process.env.DISCORD_TOKEN!,
  intents: 513,
  shardCount: 3, // Enable sharding
  prefix: '!'
});
```

## 🚨 Troubleshooting

### Common Issues

#### Bot Won't Start
```bash
# Check logs
docker-compose logs bot

# Check environment variables
docker-compose exec bot env | grep DISCORD

# Restart service
docker-compose restart bot
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U unicord

# Check logs
docker-compose logs postgres

# Reset database (WARNING: destroys data)
docker-compose down -v
docker-compose up -d
```

#### Redis Connection Issues
```bash
# Test Redis connection
docker-compose exec redis redis-cli -a unicord123 ping

# Check Redis logs
docker-compose logs redis
```

### Performance Issues

#### High Memory Usage
```bash
# Check resource usage
docker stats

# Optimize Redis memory
# Edit docker/redis/redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

#### Slow Response Times
```bash
# Check Prometheus metrics
# Visit http://localhost:9090

# Monitor Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## 🔄 Updates and Maintenance

### Update Bot
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U unicord unicord > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U unicord unicord < backup.sql
```

### Update Dependencies
```bash
# Update base images
docker-compose pull

# Restart services
docker-compose up -d
```

## 📚 Advanced Configuration

### Custom Nginx Configuration

Create `docker/nginx/conf.d/custom.conf`:

```nginx
# Custom location blocks
location /custom/ {
  proxy_pass http://unicord_bot;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}

# Custom error pages
error_page 404 /404.html;
error_page 500 502 503 504 /50x.html;
```

### Custom Redis Configuration

Edit `docker/redis/redis.conf`:

```redis
# Performance tuning
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# Persistence
appendonly yes
appendfsync everysec
```

### Custom PostgreSQL Configuration

Create `docker/postgres/postgresql.conf`:

```sql
-- Performance tuning
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

-- Logging
log_statement = 'all'
log_duration = on
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring alerts configured
- [ ] Rate limiting enabled
- [ ] Security headers set
- [ ] Health checks working
- [ ] Log rotation configured
- [ ] Resource limits set
- [ ] Backup strategy tested

## 📞 Support

For Docker-related issues:
- Check [Docker documentation](https://docs.docker.com/)
- Review [Docker Compose reference](https://docs.docker.com/compose/)
- Open an issue on [GitHub](https://github.com/Locon213/UniCord/issues)

Happy deploying! 🚀
