# Docker Deployment

Deploy the Solana DeFi Wallet using Docker containers for consistent and portable deployments.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/SMSDAO/solana-defi-wallet.git
cd solana-defi-wallet

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_SOLANA_RPC_MAINNET=${NEXT_PUBLIC_SOLANA_RPC_MAINNET}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Dockerfile

Create `Dockerfile`:

```dockerfile
# Base stage
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Builder stage
FROM base AS builder
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## Multi-Stage Build Benefits

1. **Smaller image size** - Only production dependencies
2. **Better caching** - Separate dependency and build layers
3. **Security** - Non-root user
4. **Optimization** - Standalone output

---

## Building Images

### Development Build

```bash
docker build -t solana-wallet:dev .
docker run -p 3000:3000 --env-file .env solana-wallet:dev
```

### Production Build

```bash
docker build -t solana-wallet:latest .
docker run -p 3000:3000 --env-file .env solana-wallet:latest
```

### Build with specific tag

```bash
docker build -t solana-wallet:v1.0.0 .
```

---

## Environment Variables

Create `.env` for Docker:

```env
# Database
DATABASE_URL=postgresql://postgres:password@db:5432/solana_wallet
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_NAME=solana_wallet

# Application
NODE_ENV=production
NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://api.mainnet-beta.solana.com
JWT_SECRET=your-jwt-secret-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
BIRDEYE_API_KEY=your-birdeye-key
REDIS_URL=redis://redis:6379
```

---

## Running with Docker Compose

### Start services

```bash
# Start in detached mode
docker-compose up -d

# Start with build
docker-compose up -d --build

# View logs
docker-compose logs -f app

# View specific service logs
docker-compose logs -f db
```

### Stop services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop without removing containers
docker-compose stop
```

### Scale services

```bash
# Scale app instances
docker-compose up -d --scale app=3
```

---

## Database Management

### Run migrations

```bash
# Inside container
docker-compose exec app npx prisma migrate deploy

# Or from host
docker-compose run --rm app npx prisma migrate deploy
```

### Backup database

```bash
docker-compose exec db pg_dump -U postgres solana_wallet > backup.sql
```

### Restore database

```bash
docker-compose exec -T db psql -U postgres solana_wallet < backup.sql
```

---

## Health Checks

Add health checks to `docker-compose.yml`:

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Create health check endpoint in `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: 'healthy', timestamp: new Date() });
}
```

---

## Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml solana-wallet

# List services
docker service ls

# Scale service
docker service scale solana-wallet_app=3

# Remove stack
docker stack rm solana-wallet
```

### Using Kubernetes

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: solana-wallet
spec:
  replicas: 3
  selector:
    matchLabels:
      app: solana-wallet
  template:
    metadata:
      labels:
        app: solana-wallet
    spec:
      containers:
      - name: app
        image: solana-wallet:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
---
apiVersion: v1
kind: Service
metadata:
  name: solana-wallet
spec:
  selector:
    app: solana-wallet
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy to Kubernetes:

```bash
kubectl apply -f k8s-deployment.yaml
kubectl get pods
kubectl get services
```

---

## Monitoring

### Using Prometheus

Add to `docker-compose.yml`:

```yaml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Optimization Tips

### 1. Use .dockerignore

```
node_modules
.next
.git
.env
.env.local
npm-debug.log
README.md
.gitignore
```

### 2. Layer Caching

Order Dockerfile instructions from least to most frequently changed:

```dockerfile
# System deps (rarely change)
RUN apk add --no-cache libc6-compat

# Package deps (change occasionally)
COPY package*.json ./
RUN npm ci

# Application code (changes frequently)
COPY . .
RUN npm run build
```

### 3. Multi-platform builds

```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t solana-wallet:latest .
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps

# Restart service
docker-compose restart app
```

### Database connection issues

```bash
# Verify network
docker-compose exec app ping db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec app psql $DATABASE_URL
```

### Out of disk space

```bash
# Clean up
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

---

## Security Best Practices

1. **Use non-root user** in Dockerfile
2. **Scan images** for vulnerabilities
   ```bash
   docker scan solana-wallet:latest
   ```
3. **Use secrets** for sensitive data
4. **Limit container resources**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 2G
   ```
5. **Keep images updated**
6. **Use official base images**

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t solana-wallet:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker tag solana-wallet:${{ github.sha }} registry.example.com/solana-wallet:latest
          docker push registry.example.com/solana-wallet:latest
```

---

## Related Documentation

- [Production Deployment](PRODUCTION_DEPLOYMENT.md)
- [Architecture Overview](../architecture/OVERVIEW.md)
- [Troubleshooting](../guides/TROUBLESHOOTING.md)

---

**Last Updated**: 2025-01-20  
**Docker Version**: 20.10+  
**Docker Compose Version**: 2.0+
