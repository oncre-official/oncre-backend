import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';

import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { Merchant, MerchantSchema } from './model/merchant.model';
import { MerchantRepository } from './repository/merchant.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Merchant.name, schema: MerchantSchema }]), UserModule],
  controllers: [MerchantController],
  providers: [MerchantRepository, MerchantService, MerchantRepository],
  exports: [MerchantRepository, MerchantService, MerchantRepository],
})
export class MerchantModule {}
