import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { TransactionModule } from "src/transaction/transaction.module";
import { App } from "supertest/types";
import { Prisma } from "@prisma/client";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";

describe("TransactionController (e2e)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let receiverId: string;
  let senderToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TransactionModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.user.deleteMany();
    await prisma.transaction.deleteMany();

    const senderResponse = await request(app.getHttpServer())
      .post("/users")
      .send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });
    senderToken = senderResponse.body.token;
    await prisma.user.update({
      where: {
        id: senderResponse.body.user.id,
      },
      data: {
        balance: new Prisma.Decimal(1000),
      },
    });

    const receiverResponse = await request(app.getHttpServer())
      .post("/users")
      .send({
        name: "Jane Doe",
        email: "janedoe@example.com",
        password: "password123",
      });

    receiverId = receiverResponse.body.user.id;
  });

  describe("Create Transaction", () => {
    test("Should create a transaction", async () => {
      await request(app.getHttpServer())
        .post("/transactions")
        .auth(senderToken, { type: "bearer" })
        .send({
          receiverId,
          amount: 20,
        })
        .expect(201);
    });
  });
});
