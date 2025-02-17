import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "src/auth/auth.module";
import { PrismaService } from "src/prisma.service";
import { UserModule } from "src/user/user.module";
import { App } from "supertest/types";

describe("AuthController (e2e)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.user.deleteMany();
  });

  describe("Login", () => {
    test("Should be able to login and set jwt cookie", async () => {
      await request(app.getHttpServer()).post("/users").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "johndoe@example.com",
          password: "password123",
        });

      expect(response.get("Set-Cookie")).toEqual([
        expect.stringContaining("jwt="),
      ]);
    });

    test("Should return 401 if user does not exists", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "johndoe@example.com",
          password: "password123",
        })
        .expect(401);
    });

    test("Should return 401 if user exists but password is wrong", async () => {
      await request(app.getHttpServer()).post("/users").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "johndoe@example.com",
          password: "wrong_pass",
        })
        .expect(401);
    });
  });
});
