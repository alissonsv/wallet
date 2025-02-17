import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  UseGuards,
  Req,
  Patch,
} from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { createTransactionSchema } from "./dto/create-transaction.dto";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { GetUserAuthRequest } from "./types/request.type";

@Controller("transactions")
@UseGuards(AuthGuard("jwt"))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() body: any, @Req() req: GetUserAuthRequest) {
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    return this.transactionService.create(parsed.data, req.user.userId);
  }

  @Get()
  async findAllByUserId(@Req() req: GetUserAuthRequest) {
    return this.transactionService.findAllByUserId(req.user.userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.transactionService.findById(id);
  }

  @Patch(":transactionId/reverse")
  async reverse(@Param("transactionId") transactionId: string) {
    return this.transactionService.reverseTransaction(transactionId);
  }
}
