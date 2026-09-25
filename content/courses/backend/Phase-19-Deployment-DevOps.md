# Phase 19 — Deployment & DevOps

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Environment Configuration](#environment-configuration)
- [Process Manager — PM2](#process-manager--pm2)
- [Docker for Node.js](#docker-for-nodejs)
- [Nginx as Reverse Proxy](#nginx-as-reverse-proxy)
- [CI/CD Pipeline](#cicd-pipeline)
- [Cloud Deployment](#cloud-deployment)
- [SSL/TLS & HTTPS](#ssltls--https)
- [Monitoring & Health Checks](#mo
nitoring--health-checks)
- [Deployment Checklist](#deployment-checklist)
- [Key Takeaways](#key-takeaways)

---

## Deployment Overview

```
LOCAL DEVELOPMENT:
Your Machine → nodemon → localhost:3000

PRODUCTION DEPLOYMENT:
                    ┌─────────────────────────────────────┐
                    │           PRODUCTION SERVER          │
Internet ──→ Nginx ──→ PM2 ──→ Node.js App (Cluster)     │
             (443)     │       ├── Worker 1 (Port 3000)   │
                       │       ├── Worker 2 (Port 3000)   │
                       │       └── Worker 3 (Port 3000)   │
                       │                                   │
                       └──→ Static Files (HTML, CSS, JS)  │
                                                          │
                    └─────────────────────────────────────┘
```

---

## Environment Configuration

### Environment Variables in Production

```bash
# .env.production
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/myapp
JWT_SECRET=a-very-long-random-production-secret
JWT_EXPIRE=15m
REDIS_URL=redis://redis-server:6379
CORS_ORIGIN=https://myapp.com
```

```javascript
// config/index.js
const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN,
    isProduction: process.env.NODE_ENV === "production",
};

// Validate required variables at startup
const required = ["MONGO_URI", "JWT_SECRET"];
for (const key of required) {
    if (!process.env[key]) {
        console.error(`❌ Missing required env variable: ${key}`);
        process.exit(1);
    }
}

module.exports = config;
```

### Never Do This

```javascript
// ❌ NEVER hardcode secrets
const secret = "my-jwt-secret-123";
const dbUrl = "mongodb://admin:password@server:27017";

// ✅ ALWAYS use environment variables
const secret = process.env.JWT_SECRET;
const dbUrl = process.env.MONGO_URI;
```

---

## Process Manager — PM2

PM2 keeps your Node.js app running, restarts on crash, and enables clustering.

```bash
npm install -g pm2
```

### Basic Commands

```bash
# Start app
pm2 start server.js --name "my-api"

# Start with cluster mode (leverage all CPU cores)
pm2 start server.js -i max --name "my-api"

# Start with specific instances
pm2 start server.js -i 4 --name "my-api"

# List all processes
pm2 list

# Monitor (live dashboard)
pm2 monit

# View logs
pm2 logs
pm2 logs my-api --lines 100

# Restart
pm2 restart my-api

# Reload (zero downtime - graceful restart)
pm2 reload my-api

# Stop
pm2 stop my-api

# Delete process
pm2 delete my-api

# Save process list (persist across reboots)
pm2 save
pm2 startup    # Generate startup script
```

### Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "my-api",
            script: "server.js",
            instances: "max",         // Use all CPU cores
            exec_mode: "cluster",     // Cluster mode
            env: {
                NODE_ENV: "development",
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
            },

            // Logging
            log_file: "./logs/combined.log",
            out_file: "./logs/out.log",
            error_file: "./logs/error.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",

            // Restart behavior
            max_restarts: 10,
            min_uptime: "5s",
            max_memory_restart: "500M",    // Restart if exceeds 500MB
            restart_delay: 3000,           // Wait 3s before restart

            // Watch (only for development)
            watch: false,
        },
    ],
};
```

```bash
# Start with ecosystem file
pm2 start ecosystem.config.js --env production
```

---

## Docker for Node.js

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Don't run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

### .dockerignore

```
node_modules
npm-debug.log
.env
.git
.gitignore
docker-compose*.yml
Dockerfile
README.md
tests/
coverage/
.vscode/
```

### Docker Commands

```bash
# Build image
docker build -t my-api .

# Run container
docker run -d \
    --name my-api \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -e MONGO_URI="mongodb://host:27017/myapp" \
    -e JWT_SECRET="my-secret" \
    my-api

# View logs
docker logs -f my-api

# Stop and remove
docker stop my-api
docker rm my-api
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/myapp
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  mongo-data:
```

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

---

## Nginx as Reverse Proxy

### Why Nginx?

```
Client → Nginx (port 80/443) → Node.js (port 3000)

Nginx handles:
├── SSL termination (HTTPS)
├── Static file serving (faster than Node)
├── Load balancing (multiple Node instances)
├── Gzip compression
├── Rate limiting
├── Request buffering
└── Security headers
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name myapp.com www.myapp.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name myapp.com www.myapp.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/myapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
    gzip_min_length 1000;

    # Static files (served by Nginx, not Node)
    location /static/ {
        alias /var/www/myapp/public/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # API — proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Load Balancing

```nginx
# Load balance across multiple Node instances
upstream node_backend {
    least_conn;                          # Send to least busy server
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
    server 127.0.0.1:3004;
}

server {
    location /api/ {
        proxy_pass http://node_backend;
        # ... proxy headers
    }
}
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongo:
        image: mongo:7
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          MONGO_URI_TEST: mongodb://localhost:27017/test
          JWT_SECRET: test-secret

      - name: Check coverage
        run: npm run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t my-api:${{ github.sha }} .

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push to Docker Hub
        run: |
          docker tag my-api:${{ github.sha }} myuser/my-api:latest
          docker push myuser/my-api:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d --build
            docker system prune -f
```

### CI/CD Flow

```
Developer pushes code to GitHub
  ↓
GitHub Actions triggers pipeline:
  1. ✅ Run tests
  2. ✅ Run linter
  3. ✅ Check coverage
  4. 🔨 Build Docker image
  5. 📦 Push to Docker Hub
  6. 🚀 Deploy to server (SSH → docker-compose up)
```

---

## Cloud Deployment

### Deployment Options

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Railway** | Easy | Free tier → paid | Quick deploys, side projects |
| **Render** | Easy | Free tier → paid | Simple apps, APIs |
| **Heroku** | Easy | Paid | Traditional PaaS |
| **DigitalOcean** | Medium | $5+/mo | Full control, VPS |
| **AWS EC2** | Hard | Pay per use | Enterprise, scalability |
| **AWS ECS/EKS** | Hard | Pay per use | Container orchestration |

### DigitalOcean Droplet (VPS) Setup

```bash
# 1. Create a Droplet (Ubuntu 22.04)
#    SSH into the server

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone your repo
git clone https://github.com/youruser/my-api.git /var/www/my-api
cd /var/www/my-api
npm ci --production

# 5. Set environment variables
cp .env.example .env
nano .env    # Fill in production values

# 6. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 7. Install & configure Nginx
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/myapp
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 8. SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d myapp.com -d www.myapp.com
```

---

## SSL/TLS & HTTPS

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (auto-configures Nginx)
sudo certbot --nginx -d myapp.com -d www.myapp.com

# Auto-renewal (certbot sets up a cron job automatically)
sudo certbot renew --dry-run
```

### Trust Proxy in Express

```javascript
// When behind Nginx/load balancer
app.set("trust proxy", 1);

// Now req.ip returns the real client IP
// req.protocol returns "https" when behind SSL termination
```

---

## Monitoring & Health Checks

### Health Check Endpoint

```javascript
app.get("/health", async (req, res) => {
    const healthcheck = {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || "1.0.0",
    };

    try {
        // Check database connection
        await mongoose.connection.db.admin().ping();
        healthcheck.database = "connected";
    } catch (e) {
        healthcheck.status = "error";
        healthcheck.database = "disconnected";
    }

    res.status(healthcheck.status === "ok" ? 200 : 503).json(healthcheck);
});
```

### Graceful Shutdown

```javascript
// server.js
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle shutdown signals
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    // Stop accepting new connections
    server.close(async () => {
        console.log("HTTP server closed");

        // Close database connection
        await mongoose.connection.close();
        console.log("Database connection closed");

        // Close Redis connection
        await redisClient.quit();
        console.log("Redis connection closed");

        process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
    }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

---

## Deployment Checklist

```
PRE-DEPLOYMENT:
☐ NODE_ENV set to "production"
☐ All secrets in environment variables (not in code)
☐ Database connection string is production
☐ CORS configured for production domain
☐ Rate limiting enabled
☐ Helmet security headers enabled
☐ Logging configured (file-based, structured)
☐ Error handling doesn't leak stack traces to clients
☐ All tests passing
☐ Dependencies are up to date (npm audit)

SERVER SETUP:
☐ Node.js installed (LTS version)
☐ PM2 or Docker running the app
☐ Nginx configured as reverse proxy
☐ SSL certificate installed (HTTPS)
☐ Firewall configured (only 80/443 open)
☐ Health check endpoint (/health) working

CI/CD:
☐ Tests run automatically on push
☐ Docker image built and pushed
☐ Automatic deployment on main branch
☐ Rollback strategy defined

MONITORING:
☐ Application logs collected
☐ Error alerts configured
☐ Uptime monitoring (health checks)
☐ Resource monitoring (CPU, memory, disk)
☐ Graceful shutdown implemented
```

---

## Key Takeaways

1. **Never hardcode secrets** — always use environment variables
2. **PM2** keeps your app running with clustering and auto-restart
3. **Docker** makes deployments reproducible and portable
4. **Nginx** handles SSL, static files, and load balancing in front of Node.js
5. **CI/CD** automates testing and deployment — push to main = deploy
6. **Always use HTTPS** in production (Let's Encrypt = free SSL)
7. **Health checks** let you monitor if your app is working
8. **Graceful shutdown** prevents dropped connections during restarts
9. **Set `trust proxy`** when behind Nginx or a load balancer
10. **Follow the deployment checklist** before every production release

---

## Practice Exercises

1. **PM2:** Deploy a Node.js app with PM2 in cluster mode (4 instances)
2. **Docker:** Create a Dockerfile and docker-compose for your Express app + MongoDB
3. **Nginx:** Configure Nginx as reverse proxy with SSL for your Node.js app
4. **CI/CD:** Set up GitHub Actions to run tests and deploy on push to main
5. **Health check:** Create a `/health` endpoint that checks DB and Redis connectivity
6. **Graceful shutdown:** Implement signal handling for clean server shutdown

---

**Previous:** [← Phase 18 — Microservices Architecture](Phase-18-Microservices-Architecture.md)

**Next:** [Phase 20 — Scaling & Advanced Patterns →](Phase-20-Scaling-Advanced-Patterns.md)
