import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MerchantModule } from '../merchant/merchant.module';
import { PaymentModule } from '../payment/payment.module';
import { RoleModule } from '../role/role.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { CommissionPayout, CommissionPayoutSchema } from './model/commission-payout.model';
import { WalletTransaction, WalletTransactionSchema } from './model/wallet-transaction.model';
import { Wallet, WalletSchema } from './model/wallet.model';
import { CommissionPayoutRepository } from './repository/commission-payout.repository';
import { WalletTransactionRepository } from './repository/wallet-transaction.repository';
import { WalletRepository } from './repository/wallet.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: CommissionPayout.name, schema: CommissionPayoutSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
    UserModule,
    RoleModule,
    SharedModule,
    PaymentModule,
    MerchantModule,
  ],
  controllers: [AgentController],
  providers: [AgentService, WalletRepository, WalletTransactionRepository, CommissionPayoutRepository],
  exports: [AgentService, WalletRepository, WalletTransactionRepository, CommissionPayoutRepository],
})
export class AgentModule {}
