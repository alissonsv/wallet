import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { TransactionModule } from "./transaction/transaction.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [UserModule, AuthModule, TransactionModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
