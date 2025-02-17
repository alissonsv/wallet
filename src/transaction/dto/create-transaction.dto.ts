import { z } from "zod";

export const createTransactionSchema = z.object({
  receiverId: z.string().uuid({ message: "Invalid receiver ID" }),
  amount: z.number().positive({ message: "Amount must be a positive number" }),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
