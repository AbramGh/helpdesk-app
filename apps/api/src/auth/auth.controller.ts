import { Controller, Post, UseGuards, Get, UnauthorizedException, HttpCode, HttpStatus } from "@nestjs/common"
import type { Response, Request } from "express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import type { AuthService } from "./auth.service"
import type { MfaService } from "./mfa.service"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { MfaGuard } from "./guards/mfa.guard"

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private mfaService: MfaService,
  ) {}

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: "Send magic link to email" })
  @ApiResponse({ status: 200, description: "Magic link sent" })
  async login(body: { email: string }) {
    return this.authService.sendMagicLink(body.email)
  }

  @Post("verify")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: "Verify magic link" })
  async verifyMagicLink(body: { token: string }, req: Request, res: Response) {
    const deviceInfo = {
      deviceId: req.headers["x-device-id"] || "unknown",
      deviceName: req.headers["x-device-name"] || "Unknown Device",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }

    const result = await this.authService.verifyMagicLink(body.token, deviceInfo)

    if (result.requiresMfa) {
      return res.json({ requiresMfa: true, tempToken: result.tempToken })
    }

    // Set httpOnly cookies
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    })

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return res.json({ success: true })
  }

  @Post("mfa/verify")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "Verify MFA token" })
  async verifyMfa(body: { tempToken: string; token: string; trustDevice?: boolean }, req: Request, res: Response) {
    const deviceInfo = {
      deviceId: req.headers["x-device-id"] || "unknown",
      deviceName: req.headers["x-device-name"] || "Unknown Device",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }

    const result = await this.authService.verifyMfaToken(
      body.tempToken,
      body.token,
      body.trustDevice || false,
      deviceInfo,
    )

    // Set httpOnly cookies
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.json({ success: true })
  }

  @Post("mfa/recovery")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: "Use recovery code" })
  async useRecoveryCode(body: { tempToken: string; recoveryCode: string }, req: Request, res: Response) {
    const deviceInfo = {
      deviceId: req.headers["x-device-id"] || "unknown",
      deviceName: req.headers["x-device-name"] || "Unknown Device",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }

    const result = await this.authService.verifyRecoveryCode(body.tempToken, body.recoveryCode, deviceInfo)

    // Set httpOnly cookies
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.json({ success: true })
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      throw new UnauthorizedException("No refresh token")
    }

    const result = await this.authService.refreshTokens(refreshToken)

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.json({ success: true })
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout user" })
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
      await this.authService.logout(refreshToken)
    }

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")

    return res.json({ success: true })
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, MfaGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user" })
  async getMe(user: any) {
    return user
  }

  @Post("mfa/setup")
  @UseGuards(JwtAuthGuard, MfaGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Setup MFA" })
  async setupMfa(user: any) {
    return this.mfaService.setupMfa(user.id)
  }

  @Post("mfa/enable")
  @UseGuards(JwtAuthGuard, MfaGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Enable MFA" })
  async enableMfa(user: any, body: { token: string }) {
    await this.mfaService.enableMfa(user.id, body.token)
    return { success: true }
  }

  @Post("mfa/disable")
  @UseGuards(JwtAuthGuard, MfaGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Disable MFA" })
  async disableMfa(user: any, body: { token: string }) {
    await this.mfaService.disableMfa(user.id, body.token)
    return { success: true }
  }
}
