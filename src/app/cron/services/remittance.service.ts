import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PaymentRepository } from '@on/app/payment/repository/payment.repository';
import { RemittanceRepository } from '@on/app/payment/repository/remittance.repository';
import { RemittancePaymentStatus } from '@on/app/payment/types/payment.interface';
import { RemittanceStatus } from '@on/app/payment/types/remittance.interface';

@Injectable()
export class RemittanceService {
  private readonly logger = new Logger(RemittanceService.name);

  constructor(
    private readonly payment: PaymentRepository,
    private readonly remittance: RemittanceRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processRemittances(): Promise<void> {
    this.logger.log('Starting pending remittance processing...');

    const pendingRemittances = await this.remittance.find({ status: RemittanceStatus.PENDING });

    if (!pendingRemittances.length) {
      this.logger.log('No pending remittances to process.');
      return;
    }

    this.logger.log(`Found ${pendingRemittances.length} pending remittances.`);

    for (const remittance of pendingRemittances) {
      try {
        await this.processSingleRemittance(remittance.remittance_id);
      } catch (error: any) {
        this.logger.error(`Failed processing remittance ${remittance.remittance_id}`, error.stack);
      }
    }
    this.logger.log('Pending remittance processing completed.');
  }

  /**
   * PRIVATE METHODS
   */

  async processSingleRemittance(remittanceId: string): Promise<void> {
    const remittance = await this.remittance.findOneAndUpdate(
      { remittance_id: remittanceId, status: RemittanceStatus.PENDING },
      { status: RemittanceStatus.PROCESSING },
    );

    if (!remittance) {
      this.logger.warn(`Remittance ${remittanceId} is no longer pending.`);
      return;
    }

    try {
      this.logger.log(`Processing remittance ${remittanceId} for ₦${remittance.net_amount}`);

      //TODO SEND THE MONEY HERE

      await this.remittance.updateOne(
        { remittance_id: remittance.remittance_id },
        {
          status: RemittanceStatus.REMITTED,
          provider_reference: null,
          remitted_at: new Date(),
          failure_reason: null,
        },
      );

      await this.payment.updateOne(
        { payment_id: remittance.payment_id },
        {
          remittance_status: RemittancePaymentStatus.REMITTED,
        },
      );

      this.logger.log(`Remittance ${remittanceId} completed successfully.`);
    } catch (error: any) {
      throw new BadRequestException(`Failed to process remittance ${remittanceId}: ${error.message}`);
    }
  }
}
