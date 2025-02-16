import { User } from "@prisma/client";

export type UserResponse = Omit<User, "password" | "balance"> & {
  balance: number;
};
