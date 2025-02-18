import { Request } from "express";

export interface GetUserAuthRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}
