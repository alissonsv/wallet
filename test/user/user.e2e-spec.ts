import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserModule } from "./../../src/user/user.module";
import { App } from "supertest/types";
import { PrismaService } from "./../../src/prisma.service";

describe("UserController (e2e)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.user.deleteMany();
  });

  describe("Create", () => {
    test("Should be able to create an user and return 201", async () => {
      const response = await request(app.getHttpServer()).post("/users").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        user: expect.objectContaining({
          name: "John Doe",
          email: "johndoe@example.com",
          balance: expect.any(Number),
        }),
        token: expect.any(String),
      });
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
      const createUserResponse = await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "John Doe",
          email: "johndoe@example.com",
          password: "password123",
        });

      const response = await request(app.getHttpServer()).get(
        `/users/${createUserResponse.body.user.id}`,
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
      const createUserResponse = await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "John Doe",
          email: "johndoe@example.com",
          password: "password123",
        });

      await request(app.getHttpServer()).delete(
        `/users/${createUserResponse.body.user.id}`,
      );

      const response = await request(app.getHttpServer()).get("/users");
      expect(response.body).toHaveLength(0);
    });
  });
});
