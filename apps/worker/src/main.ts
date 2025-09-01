import { NestFactory } from "@nestjs/core"
import { WorkerModule } from "./worker.module"

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule)

  console.log("🔄 Worker service started")

  // Keep the process running
  process.on("SIGINT", async () => {
    console.log("🛑 Worker service shutting down...")
    await app.close()
    process.exit(0)
  })
}

bootstrap()
