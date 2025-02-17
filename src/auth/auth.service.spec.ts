import { Test, TestingModule } from "@nestjs/testing";
import { Prisma, User } from "@prisma/client";
import { UserService } from "../../src/user/user.service";
import { AuthService } from "./auth.service";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";

describe("Auth Service", () => {
  let authService: AuthService;
  let userService: UserService;

  const mockUser: User = {
    id: "123",
    name: "John Doe",
    email: "johndoe@example.com",
    password: "hashedpassword",
    balance: new Prisma.Decimal(100.0),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("token"),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    userService = module.get(UserService);
  });

  test("Should be defined", () => {
    expect(authService).toBeDefined();
  });

  test("Should authenticate user and return access_token", async () => {
    jest.spyOn(argon2, "verify").mockResolvedValueOnce(true);

    const response = await authService.authenticate({
      email: "mail@mail.com",
      password: "123123",
    });

    expect(response).toEqual({
      access_token: "token",
    });
  });

  test("Should throw UnauthorizedException if user was not found", async () => {
    jest.spyOn(userService, "findByEmail").mockResolvedValue(null);

    await expect(() =>
      authService.authenticate({
        email: "mail@mail.com",
        password: "123123",
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  test("Should throw UnauthorizedException if user password is incorrect", async () => {
    jest.spyOn(argon2, "verify").mockResolvedValueOnce(false);

    await expect(() =>
      authService.authenticate({
        email: "mail@mail.com",
        password: "123123",
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
