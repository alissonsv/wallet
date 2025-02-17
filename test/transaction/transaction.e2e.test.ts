import * as request from "supertest";
import * as argon2 from "argon2";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { TransactionModule } from "src/transaction/transaction.module";
import { App } from "supertest/types";
import { UserModule } from "src/user/user.module";
import { AuthModule } from "src/auth/auth.module";
import * as cookieParser from "cookie-parser";

describe("TransactionController (e2e)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let receiverId: string;
  const password = "password123";

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TransactionModule, UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.user.deleteMany();
    await prisma.transaction.deleteMany();

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2i,
    });

    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@example.com",
        password: hashedPassword,
        balance: 1000,
      },
    });
    const receiver = await prisma.user.create({
      data: {
        name: "Jane Doe",
        email: "janedoe@example.com",
        password: hashedPassword,
      },
    });

    receiverId = receiver.id;
  });

  describe("Create Transaction", () => {
    test("Should create a transaction", async () => {
      const authResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "johndoe@example.com",
          password,
        });

      const cookies = authResponse.get("Set-Cookie");
      expect(cookies).toBeDefined();

      await request(app.getHttpServer())
        .post("/transactions")
        .set("Cookie", cookies as string[])
        .send({
          receiverId,
          amount: 20,
        })
        .expect(201);
    });
  });
});
