import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type LoginDto = z.infer<typeof loginSchema>;

export class LoginSwaggerDto {
  @ApiProperty({ example: "johndoe@example.com" })
  email: string;

  @ApiProperty({ example: "password123", minLength: 6 })
  password: string;
}
