import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { setupSwagger } from "./swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
