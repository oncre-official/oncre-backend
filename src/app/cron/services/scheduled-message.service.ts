import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { Message } from '@on/app/message/model/message.model';
import { MessageRepository } from '@on/app/message/repository/message.repository';
import { calculateStartAndEndOfDay } from '@on/helpers/date';
import { TermiiService } from '@on/services/termii/service';

@Injectable()
export class ScheduledMessageSerice {
  private readonly logger = new Logger(ScheduledMessageSerice.name);

  constructor(
    private readonly termii: TermiiService,
    private readonly message: MessageRepository,
  ) {}

  @Cron('0 13 * * *')
  async processScheduledMessagesAtOnePM() {
    await this.processMessages();
  }

  @Cron('0 15 * * *')
  async processScheduledMessagesAtThreePM() {
    await this.processMessages();
  }

  /**
   * PRIVATE METHODS
   */
  private async processMessages() {
    const { start, end } = calculateStartAndEndOfDay();

    const messages = await this.message.find({
      delivery_status: 'scheduled',
      scheduled_for: { $gte: start, $lte: end },
    });

    this.logger.log(`[Message Cron] Found ${messages.length} messages to process`);

    for (const msg of messages) {
      await this.sendMessage(msg);
    }
  }

  private async sendMessage(msg: Message): Promise<void> {
    try {
      const { customer_phone, message_body } = msg;

      const result = await this.termii.sendSMS(customer_phone, message_body);

      await this.message.updateOne(
        { _id: msg._id },
        {
          $set: {
            delivery_status: result.success ? 'sent' : 'failed',
            sent_at: new Date(),
            termii_message_id: result?.message_id ?? null,
            error_details: result.success ? null : (result.error ?? 'Failed to send'),
            updated_at: new Date(),
          },
        },
      );

      this.logger.log(`[Message Cron] ${msg.customer_phone} => ${result.success ? 'sent' : 'failed'}`);
    } catch (error: any) {
      await this.message.updateOne(
        { _id: msg._id },
        {
          $set: {
            delivery_status: 'failed',
            error_details: error?.message,
            updated_at: new Date(),
          },
        },
      );

      this.logger.error(`[Message Cron] Failed sending message ${String(msg?._id)}`, error.stack);
    }
  }
}
