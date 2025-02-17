import { Test, TestingModule } from "@nestjs/testing";
import { TransactionService } from "./transaction.service";
import { PrismaService } from "../prisma.service";
import { Prisma, Transaction, User } from "@prisma/client";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("TransactionService", () => {
  let transactionService: TransactionService;
  let prismaService: PrismaService;

  const mockSenderUser: User = {
    id: "111",
    name: "John Doe",
    email: "johndoe@example.com",
    password: "hashedpassword",
    balance: new Prisma.Decimal(100.0),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReceiverUser: User = {
    id: "222",
    name: "Jane Doe",
    email: "janedoe@example.com",
    password: "hashedpassword",
    balance: new Prisma.Decimal(100.0),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction: Transaction = {
    id: "333",
    senderId: "111",
    receiverId: "222",
    amount: new Prisma.Decimal(50),
    status: "created",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            user: {
              findUnique: jest.fn().mockResolvedValue(mockSenderUser),
              update: jest.fn(),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({
                senderId: "111",
                receiverId: "222",
                amount: 20,
                status: "created",
              }),
            },
          },
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  test("Should be defined", () => {
    expect(transactionService).toBeDefined();
  });

  describe("Create transaction", () => {
    test("Should create a transaction and return it", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValueOnce(mockSenderUser)
              .mockResolvedValue(mockReceiverUser),
            update: jest.fn().mockResolvedValue(null),
          },
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const transaction = await transactionService.create(
        { receiverId: "222", amount: 50 },
        "111",
      );

      expect(transaction).toEqual(mockTransaction);
    });

    test("Should throw BadRequestException if receiver is the sender", async () => {
      await expect(
        transactionService.create({ receiverId: "111", amount: 20 }, "111"),
      ).rejects.toThrow(
        new BadRequestException("Sender and receiver cannot be the same"),
      );
    });

    test("Should throw BadRequestException if sender was not found", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        });
      });

      await expect(
        transactionService.create({ receiverId: "222", amount: 50 }, "111"),
      ).rejects.toThrow(new BadRequestException("Sender not found"));
    });

    test("Should throw BadRequestException if receiver was not found", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValueOnce(mockSenderUser)
              .mockResolvedValue(null),
          },
        });
      });

      await expect(
        transactionService.create({ receiverId: "222", amount: 50 }, "111"),
      ).rejects.toThrow(new BadRequestException("Receiver not found"));
    });

    test("Should throw BadRequestException if sender has no amount on the balance", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValueOnce(mockSenderUser)
              .mockResolvedValue(mockReceiverUser),
          },
        });
      });

      await expect(
        transactionService.create({ receiverId: "222", amount: 5000 }, "111"),
      ).rejects.toThrow(new BadRequestException("Insufficient balance"));
    });
  });

  describe("Reverse transaction", () => {
    test("Should reverse a transaction and return its content", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          transaction: {
            findUnique: jest.fn().mockResolvedValue(mockTransaction),
            update: jest.fn().mockResolvedValue({
              ...mockTransaction,
              status: "reversed",
            }),
          },
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValueOnce(mockSenderUser)
              .mockResolvedValue(mockReceiverUser),
            update: jest.fn(),
          },
        });
      });

      const transactionReversed =
        await transactionService.reverseTransaction("333");

      expect(transactionReversed).toEqual({
        ...mockTransaction,
        status: "reversed",
      });
    });

    test("Should throw NotFoundException if the transaction does not exist", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          transaction: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        });
      });

      await expect(
        transactionService.reverseTransaction("invalid-id"),
      ).rejects.toThrow(NotFoundException);
    });

    test("should throw BadRequestError if the transaction is already reversed", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          transaction: {
            findUnique: jest.fn().mockResolvedValue({
              ...mockTransaction,
              status: "reversed",
            }),
          },
        });
      });

      await expect(
        transactionService.reverseTransaction("333"),
      ).rejects.toThrow(BadRequestException);
    });

    test("Should throw NotFoundException if the sender does not exist", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          transaction: {
            findUnique: jest.fn().mockResolvedValue(mockTransaction),
          },
          user: {
            findUnique: jest.fn().mockResolvedValueOnce(null),
          },
        });
      });

      await expect(
        transactionService.reverseTransaction("333"),
      ).rejects.toThrow(NotFoundException);
    });

    test("Should throw NotFoundException if the receiver does not exist", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          transaction: {
            findUnique: jest.fn().mockResolvedValue(mockTransaction),
          },
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValueOnce(mockSenderUser)
              .mockResolvedValueOnce(null),
          },
        });
      });

      await expect(
        transactionService.reverseTransaction("333"),
      ).rejects.toThrow(NotFoundException);
    });

    test("Should throw BadRequestException if the receiver does not have enough balance to reverse", async () => {
      (prismaService.$transaction as jest.Mock).mockImplementation((cb) => {
        return cb({
          transaction: {
            findUnique: jest.fn().mockResolvedValue(mockTransaction),
          },
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValueOnce(mockSenderUser)
              .mockResolvedValueOnce({
                ...mockReceiverUser,
                balance: new Prisma.Decimal(0),
              }),
          },
        });
      });

      await expect(
        transactionService.reverseTransaction("333"),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
