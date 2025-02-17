import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Transaction, Prisma } from "@prisma/client";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    senderId: string,
  ): Promise<Transaction> {
    if (senderId === createTransactionDto.receiverId) {
      throw new BadRequestException("Sender and receiver cannot be the same");
    }

    return await this.prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({
        where: { id: senderId },
      });
      if (!sender) throw new BadRequestException("Sender not found");

      const receiver = await tx.user.findUnique({
        where: { id: createTransactionDto.receiverId },
      });
      if (!receiver) throw new BadRequestException("Receiver not found");

      if (Number(sender.balance) < createTransactionDto.amount) {
        throw new BadRequestException("Insufficient balance");
      }

      await tx.user.update({
        where: { id: senderId },
        data: {
          balance: new Prisma.Decimal(
            Number(sender.balance) - createTransactionDto.amount,
          ),
        },
      });

      await tx.user.update({
        where: { id: createTransactionDto.receiverId },
        data: {
          balance: new Prisma.Decimal(
            Number(receiver.balance) + createTransactionDto.amount,
          ),
        },
      });

      return tx.transaction.create({
        data: {
          senderId,
          receiverId: createTransactionDto.receiverId,
          amount: new Prisma.Decimal(createTransactionDto.amount),
          status: "completed",
        },
      });
    });
  }

  async reverseTransaction(transactionId: string): Promise<Transaction> {
    return await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new NotFoundException("Transaction not found");
      }

      if (transaction.status === "reversed") {
        throw new BadRequestException("Transaction has already been reversed");
      }

      const sender = await tx.user.findUnique({
        where: { id: transaction.senderId },
      });
      if (!sender) throw new NotFoundException("Sender not found");

      const receiver = await tx.user.findUnique({
        where: { id: transaction.receiverId },
      });
      if (!receiver) throw new NotFoundException("Receiver not found");

      if (Number(receiver.balance) < Number(transaction.amount)) {
        throw new BadRequestException(
          "Receiver does not have enough balance to reverse",
        );
      }

      await tx.user.update({
        where: { id: transaction.receiverId },
        data: {
          balance: new Prisma.Decimal(
            Number(receiver.balance) - Number(transaction.amount),
          ),
        },
      });

      await tx.user.update({
        where: { id: transaction.senderId },
        data: {
          balance: new Prisma.Decimal(
            Number(sender.balance) + Number(transaction.amount),
          ),
        },
      });

      return tx.transaction.update({
        where: { id: transactionId },
        data: { status: "reversed" },
      });
    });
  }

  async findAllByUserId(userId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ receiverId: userId }, { senderId: userId }],
      },
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }
}
