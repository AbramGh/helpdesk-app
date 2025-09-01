import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import * as request from "supertest"
import { AppModule } from "../src/app.module"
import { PrismaService } from "../src/prisma/prisma.service"
import { describe, beforeEach, afterEach, it, expect } from "jest"

describe("AppController (e2e)", () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()
  })

  afterEach(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  it("/ (GET)", () => {
    return request(app.getHttpServer()).get("/").expect(200).expect("Hello World!")
  })

  describe("Authentication", () => {
    it("/auth/register (POST)", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        })
        .expect(201)
    })

    it("/auth/login (POST)", async () => {
      // First register a user
      await request(app.getHttpServer()).post("/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      })

      // Then login
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token")
        })
    })
  })

  describe("Issues", () => {
    let authToken: string

    beforeEach(async () => {
      // Register and login to get auth token
      await request(app.getHttpServer()).post("/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      })

      const loginResponse = await request(app.getHttpServer()).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      })

      authToken = loginResponse.body.access_token
    })

    it("/issues (POST)", () => {
      return request(app.getHttpServer())
        .post("/issues")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Issue",
          description: "Test Description",
          priority: "medium",
          organizationId: "org-1",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id")
          expect(res.body.title).toBe("Test Issue")
        })
    })

    it("/issues (GET)", () => {
      return request(app.getHttpServer())
        .get("/issues")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("issues")
          expect(res.body).toHaveProperty("total")
        })
    })
  })
})
