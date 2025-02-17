import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { loginSchema } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: any) {
    const parsedData = loginSchema.safeParse(body);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.format());
    }
    return this.authService.authenticate(parsedData.data);
  }
}
