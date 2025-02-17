import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";

interface JwtPayload {
  sub: string;
  email: string;
}

interface JwtRequest extends Request {
  cookies: {
    jwt?: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: JwtRequest): string | null => {
          const token = req.cookies.jwt;
          return token ? token : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    };

    super(options);
  }

  validate(payload: JwtPayload): { userId: string; email: string } {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
