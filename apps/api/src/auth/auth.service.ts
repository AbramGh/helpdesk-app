import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { ConfigService } from "@nestjs/config"
import type { PrismaService } from "../prisma/prisma.service"
import type { MfaService } from "./mfa.service"
import * as argon2 from "argon2"
import * as crypto from "crypto"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mfaService: MfaService,
  ) {}

  async sendMagicLink(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true, mfaSettings: true },
    })

    if (!user || !user.isActive) {
      // Don't reveal if user exists
      return { message: "If an account exists, a magic link has been sent to your email." }
    }

    // Generate magic link token
    const magicToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store magic link token (you'd typically use Redis for this)
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: magicToken,
        expiresAt,
      },
    })

    // TODO: Send email with magic link
    console.log(`Magic link for ${email}: http://localhost:3000/auth/verify?token=${magicToken}`)

    return { message: "If an account exists, a magic link has been sent to your email." }
  }

  async verifyMagicLink(token: string, deviceInfo: any): Promise<{ requiresMfa: boolean; tempToken?: string }> {
    const magicToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { mfaSettings: true, organization: true } } },
    })

    if (!magicToken || magicToken.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired magic link")
    }

    const user = magicToken.user

    // Delete used magic link
    await this.prisma.refreshToken.delete({
      where: { id: magicToken.id },
    })

    // Check if device is trusted
    const trustedDevice = await this.prisma.trustedDevice.findUnique({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId: deviceInfo.deviceId,
        },
      },
    })

    const isTrustedDevice = trustedDevice && trustedDevice.expiresAt > new Date()

    // If MFA is enabled and device is not trusted, require MFA
    if (user.mfaSettings?.isEnabled && !isTrustedDevice) {
      const tempToken = this.jwtService.sign({ sub: user.id, type: "temp", amr: [] }, { expiresIn: "10m" })
      return { requiresMfa: true, tempToken }
    }

    // Generate full access tokens
    return this.generateTokens(user, ["pwd"], deviceInfo)
  }

  async verifyMfaToken(
    tempToken: string,
    totpToken: string,
    trustDevice: boolean,
    deviceInfo: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any
    try {
      payload = this.jwtService.verify(tempToken)
    } catch {
      throw new UnauthorizedException("Invalid temporary token")
    }

    if (payload.type !== "temp") {
      throw new UnauthorizedException("Invalid token type")
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { mfaSettings: true, organization: true },
    })

    if (!user || !user.mfaSettings?.isEnabled) {
      throw new UnauthorizedException("MFA not enabled")
    }

    // Verify TOTP token
    const isValidTotp = this.mfaService.verifyTotp(user.mfaSettings.secret, totpToken)
    if (!isValidTotp) {
      throw new UnauthorizedException("Invalid TOTP token")
    }

    // Trust device if requested
    if (trustDevice) {
      await this.trustDevice(user.id, deviceInfo)
    }

    // Generate full access tokens with MFA claim
    return this.generateTokens(user, ["pwd", "mfa"], deviceInfo)
  }

  async verifyRecoveryCode(
    tempToken: string,
    recoveryCode: string,
    deviceInfo: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any
    try {
      payload = this.jwtService.verify(tempToken)
    } catch {
      throw new UnauthorizedException("Invalid temporary token")
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { recoveryCodes: true, organization: true },
    })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    // Find and verify recovery code
    const validCode = await this.prisma.userRecoveryCode.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
      },
    })

    if (!validCode) {
      throw new UnauthorizedException("No valid recovery codes available")
    }

    const isValidCode = await argon2.verify(validCode.code, recoveryCode)
    if (!isValidCode) {
      throw new UnauthorizedException("Invalid recovery code")
    }

    // Mark recovery code as used
    await this.prisma.userRecoveryCode.update({
      where: { id: validCode.id },
      data: { isUsed: true, usedAt: new Date() },
    })

    // Generate full access tokens with MFA claim
    return this.generateTokens(user, ["pwd", "mfa"], deviceInfo)
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { organization: true } } },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid refresh token")
    }

    const user = tokenRecord.user

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    })

    // Generate new tokens
    return this.generateTokens(user, ["pwd", "mfa"], {})
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })
  }

  private async generateTokens(
    user: any,
    amr: string[],
    deviceInfo: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      amr,
    }

    const accessToken = this.jwtService.sign(payload)

    // Generate refresh token
    const refreshToken = crypto.randomBytes(32).toString("hex")
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    })

    return { accessToken, refreshToken }
  }

  private async trustDevice(userId: string, deviceInfo: any): Promise<void> {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await this.prisma.trustedDevice.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId: deviceInfo.deviceId,
        },
      },
      update: { expiresAt },
      create: {
        userId,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName || "Unknown Device",
        ipAddress: deviceInfo.ipAddress || "Unknown",
        userAgent: deviceInfo.userAgent || "Unknown",
        expiresAt,
      },
    })
  }
}
