import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  Delete,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { createUserSchema } from "./dto/create-user.dto";
import { UserResponse } from "./types/user-response.type";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() body: any,
  ): Promise<{ user: UserResponse; token: string }> {
    const parsedData = createUserSchema.safeParse(body);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.format());
    }

    return this.userService.create(parsedData.data);
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
