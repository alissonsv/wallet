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
import {
  createTransactionSchema,
  CreateTransactionSwaggerDto,
} from "./dto/create-transaction.dto";
import { AuthGuard } from "@nestjs/passport";
import { GetUserAuthRequest } from "./types/request.type";
import { ApiBody, ApiOperation } from "@nestjs/swagger";

@Controller("transactions")
@UseGuards(AuthGuard("jwt"))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: "Creates a new transaction" })
  @ApiBody({ type: CreateTransactionSwaggerDto })
  async create(@Body() body: any, @Req() req: GetUserAuthRequest) {
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    return this.transactionService.create(parsed.data, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: "Get user transactions" })
  async findAllByUserId(@Req() req: GetUserAuthRequest) {
    return this.transactionService.findAllByUserId(req.user.userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get transaction by id" })
  async findOne(@Param("id") id: string) {
    return this.transactionService.findById(id);
  }

  @Patch(":transactionId/reverse")
  @ApiOperation({ summary: "Reverse a transaction" })
  async reverse(@Param("transactionId") transactionId: string) {
    return this.transactionService.reverseTransaction(transactionId);
  }
}
