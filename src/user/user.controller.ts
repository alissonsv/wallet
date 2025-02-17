import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  Delete,
  Res,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { createUserSchema } from "./dto/create-user.dto";
import { UserResponse } from "./types/user-response.type";
import { Response } from "express";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: any, @Res() res: Response) {
    const parsedData = createUserSchema.safeParse(body);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.format());
    }

    const { token } = await this.userService.create(parsedData.data);

    const ONE_HOUR_IN_MS = 3600000;
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ONE_HOUR_IN_MS,
    });

    return res.status(201).json({ message: "User created successfully" });
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  async findById(
    @Param("id") id: string,
  ): Promise<{ user: UserResponse } | null> {
    return this.userService.findById(id);
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    await this.userService.deleteById(id);
  }
}
