import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './app/auth/auth.module';
import { CaseModule } from './app/case/case.module';
import { CreditModule } from './app/credit/credit.module';
import { CustomerModule } from './app/customer/customer.module';
import { MerchantModule } from './app/merchant/merchant.module';
import { MessageModule } from './app/message/message.module';
import { PaymentModule } from './app/payment/payment.module';
import { RoleModule } from './app/role/role.module';
import { SharedModule } from './app/shared/shared.module';
import { UserModule } from './app/user/user.module';
import { AppController } from './app.controller';
import { config } from './config';
import { HttpExceptionFilter } from './handlers/exceptions/http-exception.filter';

@Module({
  imports: [
    MongooseModule.forRoot(config.db.url as string),
    AuthModule,
    RoleModule,
    UserModule,
    SharedModule,
    CreditModule,
    CaseModule,
    CustomerModule,
    MerchantModule,
    MessageModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    {
      useClass: HttpExceptionFilter,
      provide: APP_FILTER,
    },
  ],
})
export class AppModule {}
