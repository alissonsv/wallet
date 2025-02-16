import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  INestApplication,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

type ExtendedPrismaClient = PrismaClient & {
  $on(event: "beforeExit", callback: () => void | Promise<void>): void;
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication): void {
    (this as unknown as ExtendedPrismaClient).$on("beforeExit", async () => {
      await app.close();
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
