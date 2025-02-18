import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserModule } from "../../src/user/user.module";
import { App } from "supertest/types";
import { PrismaService } from "../../src/prisma.service";
import { loginAndReturnCookies } from "../utils/login-and-return-cookies";
import { AuthModule } from "src/auth/auth.module";
import * as cookieParser from "cookie-parser";

describe("UserController (e2e)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.user.deleteMany();
    await prisma.transaction.deleteMany();
  });

  describe("Create", () => {
    test("Should be able to create an user and return 201", async () => {
      const response = await request(app.getHttpServer()).post("/users").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(201);

      expect(response.get("Set-Cookie")).toEqual([
        expect.stringContaining("jwt="),
      ]);
    });

    test("Should return 400 if given data is invalid", async () => {
      await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "John Doe",
          email: "johndoe@example.com",
        })
        .expect(400);
    });

    test("Should return 409 if user already exists", async () => {
      await request(app.getHttpServer()).post("/users").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      const response = await request(app.getHttpServer()).post("/users").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe("FindAll", () => {
    test("Should return a list of users", async () => {
      await request(app.getHttpServer()).post("/users").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      const response = await request(app.getHttpServer()).get("/users");
      expect(response.body).toHaveLength(1);
    });
  });

  describe("FindById", () => {
    test("Should be able to grab an user", async () => {
      const createdUser = await prisma.user.create({
        data: {
          email: "johndoe@example.com",
          name: "John Doe",
          password: "hashedpassword",
        },
      });

      const response = await request(app.getHttpServer()).get(
        `/users/${createdUser.id}`,
      );

      expect(response.body).toEqual({
        user: expect.objectContaining({
          name: "John Doe",
          email: "johndoe@example.com",
        }),
      });
    });
  });

  describe("Delete", () => {
    test("Should be able to delete an user", async () => {
      const { createdUser, cookies } = await loginAndReturnCookies(app, prisma);

      await request(app.getHttpServer())
        .delete(`/users/${createdUser.id}`)
        .set("Cookie", cookies);

      const response = await request(app.getHttpServer()).get("/users");
      expect(response.body).toHaveLength(0);
    });

    test("Should return 401 if user is trying to delete another user than himself", async () => {
      const anotherUserCreated = await prisma.user.create({
        data: {
          email: "another_user@example.com",
          name: "Another User",
          password: "hashedpassword",
        },
      });

      const { cookies } = await loginAndReturnCookies(app, prisma);

      await request(app.getHttpServer())
        .delete(`/users/${anotherUserCreated.id}`)
        .set("Cookie", cookies)
        .expect(401);
    });
  });
});
