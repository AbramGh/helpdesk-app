import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { ConfigService } from "@nestjs/config"
import type { PrismaService } from "../../prisma/prisma.service"
import type { Request } from "express"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET"),
    })
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { organization: true, mfaSettings: true },
    })

    if (!user || !user.isActive) {
      throw new UnauthorizedException()
    }

    return {
      id: user.id,
      email: user.email,
    }
  }
}
