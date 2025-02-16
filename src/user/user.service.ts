import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as argon2 from "argon2";
import { User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { UserResponse } from "./types/user-response.type";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await argon2.hash(createUserDto.password, {
      type: argon2.argon2i,
    });

    const userAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (userAlreadyExists) {
      throw new ConflictException("User already exists");
    }

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    const token = this.jwtService.sign({
      email: user.email,
      sub: user.id,
    });

    return {
      user: this.formatUser(user),
      token,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<{ user: UserResponse } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      user: this.formatUser(user),
    };
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.formatUser(user));
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  private formatUser(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance.toNumber(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
