import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaService } from "src/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "src/auth/jwt.strategy";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
