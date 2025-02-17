import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { TransactionModule } from "./transaction/transaction.module";

@Module({
  imports: [UserModule, AuthModule, TransactionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
