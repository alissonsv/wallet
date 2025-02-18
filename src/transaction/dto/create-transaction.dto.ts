import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const createTransactionSchema = z.object({
  receiverId: z.string().uuid({ message: "Invalid receiver ID" }),
  amount: z.number().positive({ message: "Amount must be a positive number" }),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

export class CreateTransactionSwaggerDto {
  @ApiProperty({ example: "uuid-of-receiver" })
  receiverId: string;

  @ApiProperty({ example: 100.0, minimum: 0.01 })
  amount: number;
}
