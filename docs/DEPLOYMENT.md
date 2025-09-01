# Deployment Guide

This guide covers deploying the Helpdesk Dashboard to production environments.

## 🏗️ Architecture Overview

The application consists of multiple services:
- **Web App** (Next.js) - Frontend application
- **API Server** (NestJS) - Backend REST API
- **Worker Service** - Background job processing
- **PostgreSQL** - Primary database
- **Redis** - Caching and job queues
- **MinIO/S3** - File storage
- **SMTP Server** - Email notifications

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for small-medium deployments)

1. **Prepare environment**
   \`\`\`bash
   # Clone repository
   git clone <repository-url>
   cd helpdesk-dashboard
   
   # Copy production environment file
   cp .env.example .env.production
   \`\`\`

2. **Configure environment variables**
   \`\`\`env
   # Database
   DATABASE_URL="postgresql://helpdesk:secure_password@postgres:5432/helpdesk"
   
   # Authentication
   JWT_SECRET="your-super-secure-jwt-secret-key-here"
   JWT_EXPIRES_IN="7d"
   
   # Redis
   REDIS_URL="redis://redis:6379"
   
   # Email
   SMTP_HOST="your-smtp-server.com"
   SMTP_PORT="587"
   SMTP_USER="your-smtp-username"
   SMTP_PASS="your-smtp-password"
   FROM_EMAIL="noreply@yourdomain.com"
   
   # File Storage
   MINIO_ENDPOINT="minio"
   MINIO_PORT="9000"
   MINIO_ACCESS_KEY="your-access-key"
   MINIO_SECRET_KEY="your-secret-key"
   MINIO_BUCKET="helpdesk-files"
   
   # Application URLs
   WEB_URL="https://helpdesk.yourdomain.com"
   API_URL="https://api.helpdesk.yourdomain.com"
   \`\`\`

3. **Deploy with Docker Compose**
   \`\`\`bash
   # Build and start services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Run database migrations
   docker-compose exec api pnpm prisma migrate deploy
   
   # Seed initial data (optional)
   docker-compose exec api pnpm prisma db seed
   \`\`\`

### Option 2: Kubernetes (Recommended for large deployments)

1. **Create namespace**
   \`\`\`bash
   kubectl create namespace helpdesk
   \`\`\`

2. **Deploy PostgreSQL**
   \`\`\`yaml
   # postgres.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: postgres
     namespace: helpdesk
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: postgres
     template:
       metadata:
         labels:
           app: postgres
       spec:
         containers:
         - name: postgres
           image: postgres:14
           env:
           - name: POSTGRES_DB
             value: helpdesk
           - name: POSTGRES_USER
             value: helpdesk
           - name: POSTGRES_PASSWORD
             valueFrom:
               secretKeyRef:
                 name: postgres-secret
                 key: password
           ports:
           - containerPort: 5432
           volumeMounts:
           - name: postgres-storage
             mountPath: /var/lib/postgresql/data
         volumes:
         - name: postgres-storage
           persistentVolumeClaim:
             claimName: postgres-pvc
   \`\`\`

3. **Deploy Redis**
   \`\`\`yaml
   # redis.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: redis
     namespace: helpdesk
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: redis
     template:
       metadata:
         labels:
           app: redis
       spec:
         containers:
         - name: redis
           image: redis:6-alpine
           ports:
           - containerPort: 6379
   \`\`\`

4. **Deploy Application Services**
   \`\`\`yaml
   # api.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: helpdesk-api
     namespace: helpdesk
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: helpdesk-api
     template:
       metadata:
         labels:
           app: helpdesk-api
       spec:
         containers:
         - name: api
           image: helpdesk-api:latest
           ports:
           - containerPort: 3001
           env:
           - name: DATABASE_URL
             valueFrom:
               secretKeyRef:
                 name: app-secrets
                 key: database-url
           - name: JWT_SECRET
             valueFrom:
               secretKeyRef:
                 name: app-secrets
                 key: jwt-secret
   \`\`\`

### Option 3: Cloud Platforms

#### Vercel (Frontend) + Railway/Render (Backend)

1. **Deploy Frontend to Vercel**
   \`\`\`bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy from apps/web directory
   cd apps/web
   vercel --prod
   \`\`\`

2. **Deploy Backend to Railway**
   \`\`\`bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and deploy
   railway login
   railway deploy
   \`\`\`

#### AWS ECS/Fargate

1. **Build and push Docker images**
   \`\`\`bash
   # Build images
   docker build -f apps/web/Dockerfile -t helpdesk-web .
   docker build -f apps/api/Dockerfile -t helpdesk-api .
   docker build -f apps/worker/Dockerfile -t helpdesk-worker .
   
   # Tag and push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
   
   docker tag helpdesk-web:latest <account>.dkr.ecr.us-east-1.amazonaws.com/helpdesk-web:latest
   docker push <account>.dkr.ecr.us-east-1.amazonaws.com/helpdesk-web:latest
   \`\`\`

2. **Create ECS Task Definitions**
   \`\`\`json
   {
     "family": "helpdesk-api",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::<account>:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "helpdesk-api",
         "image": "<account>.dkr.ecr.us-east-1.amazonaws.com/helpdesk-api:latest",
         "portMappings": [
           {
             "containerPort": 3001,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "DATABASE_URL",
             "valueFrom": "arn:aws:secretsmanager:us-east-1:<account>:secret:helpdesk/database-url"
           }
         ]
       }
     ]
   }
   \`\`\`

## 🔧 Configuration

### Environment Variables

#### Required Production Variables
\`\`\`env
# Security
JWT_SECRET="your-256-bit-secret-key"
ENCRYPTION_KEY="your-encryption-key"

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
DATABASE_POOL_SIZE="20"

# Redis
REDIS_URL="redis://host:6379"
REDIS_PASSWORD="your-redis-password"

# Email
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT="587"
SMTP_SECURE="true"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="your-smtp-password"

# File Storage
S3_ENDPOINT="s3.amazonaws.com"
S3_BUCKET="helpdesk-files"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"
S3_REGION="us-east-1"

# Application
WEB_URL="https://helpdesk.yourdomain.com"
API_URL="https://api.helpdesk.yourdomain.com"
ALLOWED_ORIGINS="https://helpdesk.yourdomain.com"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
\`\`\`

### SSL/TLS Configuration

#### Using Let's Encrypt with Nginx
\`\`\`nginx
server {
    listen 80;
    server_name helpdesk.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name helpdesk.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/helpdesk.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/helpdesk.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

### Database Configuration

#### PostgreSQL Optimization
\`\`\`sql
-- postgresql.conf optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
\`\`\`

#### Connection Pooling with PgBouncer
\`\`\`ini
[databases]
helpdesk = host=localhost port=5432 dbname=helpdesk

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
\`\`\`

## 📊 Monitoring & Logging

### Health Checks
\`\`\`typescript
// apps/api/src/health/health.controller.ts
@Get('health')
async getHealth() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: await this.checkDatabase(),
    redis: await this.checkRedis(),
  }
}
\`\`\`

### Logging Configuration
\`\`\`typescript
// apps/api/src/main.ts
import { Logger } from '@nestjs/common'
import * as winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
\`\`\`

### Metrics Collection
\`\`\`typescript
// Prometheus metrics
import { register, Counter, Histogram } from 'prom-client'

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
})

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
})
\`\`\`

## 🔒 Security Checklist

### Pre-deployment Security
- [ ] Change all default passwords
- [ ] Generate secure JWT secrets (256-bit minimum)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CSP (Content Security Policy)
- [ ] Set up database connection encryption
- [ ] Configure file upload restrictions
- [ ] Enable audit logging

### Security Headers
\`\`\`typescript
// apps/web/next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
\`\`\`

## 🚨 Backup & Recovery

### Database Backups
\`\`\`bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="helpdesk"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/helpdesk_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/helpdesk_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/helpdesk_$DATE.sql.gz s3://your-backup-bucket/database/

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "helpdesk_*.sql.gz" -mtime +30 -delete
\`\`\`

### File Storage Backups
\`\`\`bash
#!/bin/bash
# backup-files.sh
aws s3 sync s3://helpdesk-files s3://helpdesk-files-backup --delete
\`\`\`

### Automated Backup Schedule
\`\`\`yaml
# k8s-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:14
            command:
            - /bin/bash
            - -c
            - |
              pg_dump $DATABASE_URL | gzip > /backup/helpdesk_$(date +%Y%m%d_%H%M%S).sql.gz
          restartPolicy: OnFailure
\`\`\`

## 🔄 Updates & Maintenance

### Rolling Updates
\`\`\`bash
# Zero-downtime deployment script
#!/bin/bash

# Build new images
docker build -f apps/api/Dockerfile -t helpdesk-api:$NEW_VERSION .
docker build -f apps/web/Dockerfile -t helpdesk-web:$NEW_VERSION .

# Update API (rolling update)
docker service update --image helpdesk-api:$NEW_VERSION helpdesk_api

# Wait for health check
while ! curl -f http://localhost:3001/health; do
  sleep 5
done

# Update Web
docker service update --image helpdesk-web:$NEW_VERSION helpdesk_web

# Run migrations if needed
docker run --rm --network helpdesk_default helpdesk-api:$NEW_VERSION pnpm prisma migrate deploy
\`\`\`

### Database Migrations
\`\`\`bash
# Production migration process
1. Backup database
2. Test migration on staging
3. Run migration during maintenance window
4. Verify application functionality
5. Monitor for issues
\`\`\`

## 📈 Performance Optimization

### Caching Strategy
- **Redis**: Session storage, rate limiting, job queues
- **CDN**: Static assets, images
- **Database**: Query result caching
- **Application**: Response caching for read-heavy endpoints

### Database Optimization
- Connection pooling (20-50 connections)
- Read replicas for reporting queries
- Proper indexing on frequently queried columns
- Regular VACUUM and ANALYZE operations

### Monitoring Alerts
\`\`\`yaml
# Example Prometheus alerts
groups:
- name: helpdesk
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    annotations:
      summary: High error rate detected
      
  - alert: DatabaseConnectionsHigh
    expr: pg_stat_activity_count > 80
    for: 2m
    annotations:
      summary: Database connections approaching limit
\`\`\`

This deployment guide provides comprehensive instructions for deploying the Helpdesk Dashboard in production environments with proper security, monitoring, and maintenance procedures.
