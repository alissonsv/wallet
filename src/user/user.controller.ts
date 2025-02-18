import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  Delete,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { createUserSchema, CreateUserSwaggerDto } from "./dto/create-user.dto";
import { UserResponse } from "./types/user-response.type";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { GetUserAuthRequest } from "./types/request.type";
import {
  ApiBody,
  ApiHeaders,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUserSwaggerDto })
  @ApiOperation({ summary: "Creates an user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
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
  @ApiOperation({ summary: "Get all users" })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by id" })
  async findById(
    @Param("id") id: string,
  ): Promise<{ user: UserResponse } | null> {
    return this.userService.findById(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete self user" })
  @UseGuards(AuthGuard("jwt"))
  async delete(
    @Param("id") id: string,
    @Req() req: GetUserAuthRequest,
  ): Promise<void> {
    if (!(req.user.userId === id)) {
      throw new UnauthorizedException();
    }
    await this.userService.deleteById(id);
  }
}
