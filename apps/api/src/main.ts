import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"
import * as cookieParser from "cookie-parser"
import helmet from "helmet"
import * as compression from "compression"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Security middleware
  app.use(helmet())
  app.use(compression())
  app.use(cookieParser())

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // CORS
  app.enableCors({
    origin: process.env.WEB_URL || "http://localhost:3000",
    credentials: true,
  })

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Helpdesk API")
    .setDescription("Internal helpdesk and issue tracking API")
    .setVersion("1.0")
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("docs", app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 API server running on http://localhost:${port}`)
  console.log(`📚 API documentation available at http://localhost:${port}/docs`)
}

bootstrap()
