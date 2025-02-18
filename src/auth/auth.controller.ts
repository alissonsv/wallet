import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { loginSchema, LoginSwaggerDto } from "./dto/login.dto";
import { Response } from "express";
import { ApiBody, ApiOperation } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Login and store jwt as cookie" })
  @ApiBody({ type: LoginSwaggerDto })
  async login(@Body() body: any, @Res() res: Response) {
    const parsedData = loginSchema.safeParse(body);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.format());
    }

    const token = await this.authService.authenticate(parsedData.data);

    const ONE_HOUR_IN_MS = 3600000;
    res.cookie("jwt", token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ONE_HOUR_IN_MS,
    });

    return res.status(200).json({ message: "Logged in successfully" });
  }

  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Logout cleaning jwt cookie" })
  logout(@Res() res: Response) {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "Logged out successfully" });
  }
}
