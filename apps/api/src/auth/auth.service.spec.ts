import { Test, type TestingModule } from "@nestjs/testing"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { AuthService } from "./auth.service"
import { PrismaService } from "../prisma/prisma.service"
import { MfaService } from "./mfa.service"
import * as bcrypt from "bcrypt"
import { jest } from "@jest/globals"

describe("AuthService", () => {
  let service: AuthService
  let prismaService: PrismaService
  let jwtService: JwtService
  let mfaService: MfaService

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    password: "hashedPassword",
    mfaEnabled: true,
    mfaSecret: "secret",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: MfaService,
          useValue: {
            generateSecret: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    prismaService = module.get<PrismaService>(PrismaService)
    jwtService = module.get<JwtService>(JwtService)
    mfaService = module.get<MfaService>(MfaService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("validateUser", () => {
    it("should return user data when credentials are valid", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUser)
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never)

      const result = await service.validateUser("test@example.com", "password")

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      })
    })

    it("should return null when user is not found", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null)

      const result = await service.validateUser("test@example.com", "password")

      expect(result).toBeNull()
    })

    it("should return null when password is invalid", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUser)
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never)

      const result = await service.validateUser("test@example.com", "wrongpassword")

      expect(result).toBeNull()
    })
  })

  describe("login", () => {
    it("should return access token and require MFA when user has MFA enabled", async () => {
      const result = await service.login(mockUser)

      expect(result).toHaveProperty("access_token")
      expect(result).toHaveProperty("requires_mfa", true)
    })
  })

  describe("register", () => {
    it("should create new user and return user data", async () => {
      const newUser = { ...mockUser, mfaEnabled: false }
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null)
      jest.spyOn(prismaService.user, "create").mockResolvedValue(newUser)
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword" as never)

      const result = await service.register({
        email: "test@example.com",
        password: "password",
        name: "Test User",
      })

      expect(result).toEqual({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      })
    })

    it("should throw error when user already exists", async () => {
      jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(mockUser)

      await expect(
        service.register({
          email: "test@example.com",
          password: "password",
          name: "Test User",
        }),
      ).rejects.toThrow("User already exists")
    })
  })
})
