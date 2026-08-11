import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { SettingRepository } from '../repository/setting.repository';

import { settings } from './data';

@Injectable()
export class SettingSeeder implements OnModuleInit {
  private readonly logger = new Logger(SettingSeeder.name);

  constructor(private readonly setting: SettingRepository) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(): Promise<void> {
    this.logger.log('Seeding settings...');

    for (const setting of settings) {
      await this.setting.upsert({ key: setting.key }, setting, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }

    this.logger.log(`Seeded ${settings.length} platform settings.`);
  }
}
