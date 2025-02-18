import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  balance: z.number().optional().default(0),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export class CreateUserSwaggerDto {
  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({ example: "johndoe@example.com" })
  email: string;

  @ApiProperty({ example: "password123", minLength: 6 })
  password: string;

  @ApiProperty({ example: 0, required: false })
  balance?: number;
}
