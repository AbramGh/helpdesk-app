# API Documentation

## Authentication

All API endpoints (except registration and login) require authentication via JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Authentication Endpoints

#### Register User
\`\`\`http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "mfaEnabled": false
}
\`\`\`

#### Login
\`\`\`http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
\`\`\`

**Response:**
\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requires_mfa": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\`

#### Setup MFA
\`\`\`http
POST /auth/mfa/setup
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backupCodes": ["123456", "789012", "345678"]
}
\`\`\`

#### Verify MFA
\`\`\`http
POST /auth/mfa/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}
\`\`\`

## Issues API

### List Issues
\`\`\`http
GET /issues?page=1&limit=20&status=open&priority=high&search=login
Authorization: Bearer <token>
\`\`\`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (open, in-progress, done)
- `priority` (optional): Filter by priority (low, medium, high, urgent)
- `assigneeId` (optional): Filter by assignee
- `search` (optional): Full-text search query

**Response:**
\`\`\`json
{
  "issues": [
    {
      "id": "issue-123",
      "title": "Login page not working",
      "description": "Users cannot access the login page...",
      "status": "open",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "createdBy": {
        "id": "user-456",
        "name": "Jane Client",
        "email": "jane@client.com"
      },
      "assignee": {
        "id": "user-789",
        "name": "John Support",
        "email": "john@company.com"
      },
      "organization": {
        "id": "org-123",
        "name": "Acme Corp"
      },
      "_count": {
        "comments": 3,
        "attachments": 1
      }
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
\`\`\`

### Create Issue
\`\`\`http
POST /issues
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Cannot access dashboard",
  "description": "When I try to access the dashboard, I get a 500 error...",
  "priority": "high",
  "organizationId": "org-123",
  "assigneeId": "user-789"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "issue-124",
  "title": "Cannot access dashboard",
  "description": "When I try to access the dashboard, I get a 500 error...",
  "status": "open",
  "priority": "high",
  "organizationId": "org-123",
  "createdById": "user-456",
  "assigneeId": "user-789",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
\`\`\`

### Get Issue Details
\`\`\`http
GET /issues/issue-123
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
  "id": "issue-123",
  "title": "Login page not working",
  "description": "Users cannot access the login page...",
  "status": "open",
  "priority": "high",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "createdBy": {
    "id": "user-456",
    "name": "Jane Client",
    "email": "jane@client.com"
  },
  "assignee": {
    "id": "user-789",
    "name": "John Support",
    "email": "john@company.com"
  },
  "organization": {
    "id": "org-123",
    "name": "Acme Corp"
  },
  "comments": [
    {
      "id": "comment-1",
      "content": "I'm looking into this issue now.",
      "createdAt": "2024-01-15T11:00:00Z",
      "author": {
        "id": "user-789",
        "name": "John Support"
      }
    }
  ],
  "attachments": [
    {
      "id": "attachment-1",
      "filename": "screenshot.png",
      "originalName": "error-screenshot.png",
      "size": 245760,
      "mimeType": "image/png",
      "url": "/api/files/attachment-1"
    }
  ]
}
\`\`\`

### Update Issue
\`\`\`http
PATCH /issues/issue-123
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Login page not working - URGENT",
  "priority": "urgent",
  "assigneeId": "user-999"
}
\`\`\`

### Update Issue Status
\`\`\`http
PATCH /issues/issue-123/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress"
}
\`\`\`

### Delete Issue
\`\`\`http
DELETE /issues/issue-123
Authorization: Bearer <token>
\`\`\`

## Comments API

### Add Comment
\`\`\`http
POST /issues/issue-123/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "I've identified the issue and working on a fix."
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "comment-2",
  "content": "I've identified the issue and working on a fix.",
  "issueId": "issue-123",
  "authorId": "user-789",
  "createdAt": "2024-01-15T12:00:00Z",
  "author": {
    "id": "user-789",
    "name": "John Support",
    "email": "john@company.com"
  }
}
\`\`\`

### Update Comment
\`\`\`http
PATCH /comments/comment-2
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "I've identified the issue and deployed a fix. Please test."
}
\`\`\`

### Delete Comment
\`\`\`http
DELETE /comments/comment-2
Authorization: Bearer <token>
\`\`\`

## File Upload API

### Upload File
\`\`\`http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary-data>
\`\`\`

**Response:**
\`\`\`json
{
  "id": "file-123",
  "filename": "1642248000000-screenshot.png",
  "originalName": "screenshot.png",
  "size": 245760,
  "mimeType": "image/png",
  "url": "/api/files/file-123"
}
\`\`\`

### Download File
\`\`\`http
GET /api/files/file-123
Authorization: Bearer <token>
\`\`\`

Returns the file with appropriate Content-Type and Content-Disposition headers.

## Organizations API

### List Organizations
\`\`\`http
GET /organizations
Authorization: Bearer <token>
\`\`\`

### Create Organization
\`\`\`http
POST /organizations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "domain": "acme.com"
}
\`\`\`

### Get Organization Members
\`\`\`http
GET /organizations/org-123/members
Authorization: Bearer <token>
\`\`\`

### Add Organization Member
\`\`\`http
POST /organizations/org-123/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@acme.com",
  "role": "member"
}
\`\`\`

## Notifications API

### Get Notifications
\`\`\`http
GET /notifications?page=1&limit=20
Authorization: Bearer <token>
\`\`\`

### Get Unread Count
\`\`\`http
GET /notifications/unread-count
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
  "count": 5
}
\`\`\`

### Mark as Read
\`\`\`http
POST /notifications/notification-123/read
Authorization: Bearer <token>
\`\`\`

### Mark All as Read
\`\`\`http
POST /notifications/mark-all-read
Authorization: Bearer <token>
\`\`\`

## Webhooks API

### List Webhooks
\`\`\`http
GET /webhooks
Authorization: Bearer <token>
\`\`\`

### Create Webhook
\`\`\`http
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-n8n-instance.com/webhook/helpdesk",
  "events": ["issue.created", "issue.updated", "comment.added"],
  "active": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "webhook-123",
  "url": "https://your-n8n-instance.com/webhook/helpdesk",
  "events": ["issue.created", "issue.updated", "comment.added"],
  "secret": "wh_secret_abc123",
  "active": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
\`\`\`

### Get Webhook Logs
\`\`\`http
GET /webhooks/webhook-123/logs?page=1&limit=50
Authorization: Bearer <token>
\`\`\`

## Error Responses

All endpoints return consistent error responses:

\`\`\`json
{
  "error": "Validation failed",
  "message": "Title is required",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/issues"
}
\`\`\`

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited:
- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- File upload: 10 requests per minute

Rate limit headers are included in responses:
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248060
