# Helpdesk Web Application

An internal helpdesk and issue tracking system built with Next.js, NestJS, and PostgreSQL.

## Architecture

This is a monorepo containing:

- **apps/web** - Next.js frontend with shadcn/ui
- **apps/api** - NestJS backend API
- **apps/worker** - Background job processor
- **packages/shared** - Shared types and utilities

## Quick Start

1. **Setup the project:**
   \`\`\`bash
   make setup
   \`\`\`

2. **Start development environment:**
   \`\`\`bash
   make dev
   \`\`\`

3. **Access the application:**
   - Web Dashboard: http://localhost:3000
   - API Documentation: http://localhost:3001/docs
   - Email Testing: http://localhost:8025 (MailHog)
   - MinIO Console: http://localhost:9001

## Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm

### Available Commands

- `make dev` - Start development environment
- `make build` - Build all applications
- `make test` - Run all tests
- `make docker-up` - Start all services with Docker
- `make docker-down` - Stop all services
- `make clean` - Clean build artifacts

### Environment Variables

Copy `.env.example` to `.env` and adjust values as needed.

## Features

- **Dashboard-first UX** - Internal team dashboard for ticket management
- **Role-based Access** - Owner, Member, Client roles
- **MFA Authentication** - Magic links + TOTP required
- **Issue Management** - Full lifecycle tracking with comments and attachments
- **Client Portal** - Self-service portal for clients
- **Real-time Notifications** - Email and webhook integrations
- **File Handling** - S3-compatible storage with presigned uploads
- **Background Jobs** - SLA monitoring and digest emails

## Tech Stack

- **Frontend:** Next.js 15, React 18, Tailwind CSS, shadcn/ui
- **Backend:** NestJS, Prisma, PostgreSQL
- **Jobs:** BullMQ, Redis
- **Storage:** MinIO/S3
- **Email:** SMTP (MailHog for development)
- **Auth:** JWT with MFA, secure cookies

## Project Status

✅ **Complete** - Full-featured helpdesk dashboard with authentication, issue management, client portal, notifications, and webhooks.

## Documentation

- [API Documentation](docs/API.md) - Complete REST API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Development Setup](docs/DEVELOPMENT.md) - Local development guide

## Security Features

- JWT authentication with mandatory TOTP MFA
- Role-based access control (Owner, Member, Client)
- Rate limiting and request throttling
- Secure file upload with validation
- Audit logging for all actions
- HTTPS enforcement in production

## Integration Support

- **Webhooks** - n8n compatible webhook endpoints
- **Email Notifications** - SMTP integration with HTML templates  
- **File Storage** - S3-compatible storage (MinIO/AWS S3)
- **Background Jobs** - Redis-based job queues with BullMQ

## License

Private - Internal use only
