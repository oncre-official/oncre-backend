import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';

import { Setting, SettingSchema } from './model/setting.model';
import { SettingRepository } from './repository/setting.repository';
import { SettingSeeder } from './seeder/seeder';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]), UserModule],
  controllers: [SettingController],
  providers: [SettingRepository, SettingService, SettingRepository, SettingSeeder],
  exports: [SettingRepository, SettingService, SettingRepository],
})
export class SettingModule {}
