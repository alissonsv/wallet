import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { PrismaService } from "../prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { Prisma, User } from "@prisma/client";

describe("UserService", () => {
  let userService: UserService;
  let prisma: PrismaService;
  let jwtService: JwtService;

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
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn().mockResolvedValue(mockUser),
              findUnique: jest.fn().mockResolvedValue(mockUser),
              findMany: jest.fn().mockResolvedValue([mockUser]),
              delete: jest.fn().mockResolvedValue(null),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("mocked-jwt-token"),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  test("Should be defined", () => {
    expect(userService).toBeDefined();
  });

  describe("Create", () => {
    test("Should create a new user and return user with a JWT token", async () => {
      const dto = {
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
      };

      jest.spyOn(prisma.user, "findUnique").mockResolvedValueOnce(null);
      jest.spyOn(argon2, "hash").mockResolvedValue("hashedpassword");

      const result = await userService.create(dto);

      expect(result).toEqual({
        user: {
          ...mockUser,
          balance: 100,
          password: undefined,
        },
        token: "mocked-jwt-token",
      });
    });
  });

  describe("FindByEmail", () => {
    test("Should return a user by email", async () => {
      const result = await userService.findByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
    });
  });

  describe("FindById", () => {
    test("Should return a user by ID without password", async () => {
      const result = await userService.findById(mockUser.id);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: "123",
          name: "John Doe",
          email: "johndoe@example.com",
        }),
      });

      expect(result).not.toHaveProperty("password");
    });
  });

  describe("FindAll", () => {
    test("Should return a list of users", async () => {
      const result = await userService.findAll();
      expect(result).toEqual([
        {
          ...mockUser,
          balance: 100,
          password: undefined,
        },
      ]);
    });
  });

  describe("DeleteById", () => {
    test("Should be able to delete an user", async () => {
      const result = await userService.deleteById("123123123");
      expect(result).toBeUndefined();
    });
  });
});
