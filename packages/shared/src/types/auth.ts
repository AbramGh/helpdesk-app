export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  organizationId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  OWNER = "owner",
  MEMBER = "member",
  CLIENT = "client",
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface MfaSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface LoginRequest {
  email: string
}

export interface MfaVerifyRequest {
  token: string
  trustDevice?: boolean
}
