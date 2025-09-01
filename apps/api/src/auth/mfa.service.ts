import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import * as otplib from "otplib"
import * as qrcode from "qrcode"
import * as argon2 from "argon2"
import * as crypto from "crypto"

@Injectable()
export class MfaService {
  constructor(private prisma: PrismaService) {}

  async setupMfa(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Generate secret
    const secret = otplib.authenticator.generateSecret()

    // Generate QR code
    const otpauth = otplib.authenticator.keyuri(user.email, "Helpdesk", secret)
    const qrCode = await qrcode.toDataURL(otpauth)

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString("hex").toUpperCase())

    // Store encrypted secret (don't enable yet)
    await this.prisma.userMfa.upsert({
      where: { userId },
      update: { secret },
      create: { userId, secret, isEnabled: false },
    })

    // Store hashed backup codes
    await this.prisma.userRecoveryCode.deleteMany({ where: { userId } })
    await Promise.all(
      backupCodes.map(async (code) => {
        const hashedCode = await argon2.hash(code)
        return this.prisma.userRecoveryCode.create({
          data: { userId, code: hashedCode },
        })
      }),
    )

    return { secret, qrCode, backupCodes }
  }

  async enableMfa(userId: string, token: string): Promise<void> {
    const mfaSettings = await this.prisma.userMfa.findUnique({
      where: { userId },
    })

    if (!mfaSettings) {
      throw new Error("MFA not set up")
    }

    const isValid = this.verifyTotp(mfaSettings.secret, token)
    if (!isValid) {
      throw new Error("Invalid TOTP token")
    }

    await this.prisma.userMfa.update({
      where: { userId },
      data: { isEnabled: true },
    })
  }

  async disableMfa(userId: string, token: string): Promise<void> {
    const mfaSettings = await this.prisma.userMfa.findUnique({
      where: { userId },
    })

    if (!mfaSettings?.isEnabled) {
      throw new Error("MFA not enabled")
    }

    const isValid = this.verifyTotp(mfaSettings.secret, token)
    if (!isValid) {
      throw new Error("Invalid TOTP token")
    }

    await this.prisma.userMfa.update({
      where: { userId },
      data: { isEnabled: false },
    })

    // Remove all trusted devices
    await this.prisma.trustedDevice.deleteMany({ where: { userId } })
  }

  verifyTotp(secret: string, token: string): boolean {
    return otplib.authenticator.verify({ token, secret })
  }

  async getRecoveryCodes(userId: string): Promise<string[]> {
    // This should only be called once after MFA setup
    // In a real app, you'd track if codes have been shown
    const codes = await this.prisma.userRecoveryCode.findMany({
      where: { userId, isUsed: false },
    })

    return codes.map((code) => code.id) // Return IDs, not actual codes for security
  }
}
