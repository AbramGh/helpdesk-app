// Types
export * from "./types/auth"
export * from "./types/issue"

// Schemas
export * from "./schemas/auth"
export * from "./schemas/issue"

// Constants
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    MFA_VERIFY: "/auth/mfa/verify",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  ISSUES: {
    LIST: "/issues",
    CREATE: "/issues",
    GET: "/issues/:id",
    UPDATE: "/issues/:id",
    DELETE: "/issues/:id",
  },
  COMMENTS: {
    LIST: "/issues/:issueId/comments",
    CREATE: "/issues/:issueId/comments",
  },
} as const
