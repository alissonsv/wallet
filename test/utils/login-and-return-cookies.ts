import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import * as argon2 from "argon2";
import { PrismaService } from "../../src/prisma.service";
import * as request from "supertest";
import { User } from "@prisma/client";

export async function loginAndReturnCookies(
  app: INestApplication<App>,
  prisma: PrismaService,
): Promise<{ createdUser: User; cookies: string[] }> {
  const password = "password123";
  const hashedPassword = await argon2.hash(password, {
    type: argon2.argon2i,
  });

  const createdUser = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "johndoe@example.com",
      password: hashedPassword,
      balance: 1000,
    },
  });

  const authResponse = await request(app.getHttpServer())
    .post("/auth/login")
    .send({
      email: "johndoe@example.com",
      password,
    });

  const cookies = authResponse.get("Set-Cookie");

  if (!cookies) {
    throw new Error("Missing cookies");
  }

  return {
    createdUser,
    cookies,
  };
}
