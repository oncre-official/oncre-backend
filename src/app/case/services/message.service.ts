import { Injectable } from '@nestjs/common';

import { MerchantRepository } from '@on/app/merchant/repository/merchant.repository';
import { MessageRepository } from '@on/app/message/repository/message.repository';
import { normalizePhone } from '@on/helpers/phone';
import { TermiiService } from '@on/services/termii/service';

import { CASE_ACTIVATION_MESSAGES } from '../helper.ts/activation';
import { Case } from '../model/case.model';

@Injectable()
export class MessageService {
  constructor(
    private readonly termii: TermiiService,
    private readonly message: MessageRepository,
    private readonly merchant: MerchantRepository,
  ) {}

  async sendActivation(newCase: Case) {
    const { merchant_id, debtor_phone, case_id } = newCase;

    const merchant = await this.merchant.findById(merchant_id);

    console.log(`[Case Activation] Starting for case ${case_id}`);
    console.log(`[Case Activation] Debtor phone: ${debtor_phone}`);
    console.log(`[Case Activation] Merchant phone: ${merchant?.merchant_phone}`);

    for (let i = 0; i < CASE_ACTIVATION_MESSAGES.length; i++) {
      const msg = CASE_ACTIVATION_MESSAGES[i];

      const messageBody = msg.build(newCase, merchant);
      let phone: string | null = null;

      if (msg.type === 'merchant') {
        phone = merchant?.merchant_phone ?? null;
        if (!phone) console.log(`[Case Activation] No phone for merchant ${merchant_id} — confirmation skipped`);
      }

      if (msg.type === 'debtor') {
        phone = debtor_phone;
        console.log(`[Case Activation] Debtor message - phone: ${phone}`);
      }

      console.log(`[Case Activation] Message ${i + 1} (${msg.type}) - phone: ${phone}`);

      if (!phone) {
        console.log(`[Case Activation] Skipping message ${i + 1} - no phone`);
        continue;
      }

      const alreadySent = await this.message.findOne({
        case_id,
        message_type: 'case_activation',
        message_index: i + 1,
      });
      if (alreadySent) {
        console.log(`[Case Activation] Message ${i + 1} already recorded for case ${case_id} — skipping`);
        continue;
      }

      phone = normalizePhone(phone);
      console.log(`[Case Activation] Normalized phone: ${phone}`);

      const smsOptions = {
        senderId: 'N-Alert',
        channel: 'dnd',
      };

      const result = await this.termii.sendSMS(phone, messageBody, smsOptions);
      console.log(
        `[Case Activation] SMS result for ${msg.type}: ${result.success ? 'sent' : 'failed'} - ${result.error || 'N/A'}`,
      );

      await this.message.create({
        case_id,
        merchant_id,
        debtor_phone,
        message_type: 'case_activation',
        message_index: i + 1,
        action_type: 'sms',
        message_body: messageBody,
        scheduled_for: new Date(),
        delivery_status: result.success ? 'sent' : 'failed',
        message_tier: 0,
        sent_at: new Date(),
        termii_message_id: result?.message_id ?? null,
        error_details: result.success ? null : (result.error ?? 'Failed to send'),
        cancelled_reason: null,
        customer_key: msg.type,
        customer_phone: phone,
      });
    }
  }
}
