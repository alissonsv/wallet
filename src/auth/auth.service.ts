import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async authenticate({ email, password }: LoginDto) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordCorrect = await argon2.verify(user.password, password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
