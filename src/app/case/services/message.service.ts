import { Injectable } from '@nestjs/common';

import { MerchantRepository } from '@on/app/merchant/repository/merchant.repository';
import { MessageRepository } from '@on/app/message/repository/message.repository';
import { ActionType } from '@on/enum';
import { addDaysUTC, today } from '@on/helpers/date';
import { normalizePhone } from '@on/helpers/phone';
import { TermiiService } from '@on/services/termii/service';

import { CASE_ACTIVATION_MESSAGES, CASE_ESCALATION_MESSAGES, ESCALATION_DAYS } from '../helper/activation';
import { getEscalationLevel, isCaseOnHold } from '../helper/indexx';
import { Case } from '../model/case.model';
import { CaseRepository } from '../repository/case.repository';

@Injectable()
export class MessageService {
  constructor(
    private readonly cases: CaseRepository,
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

  async schedule(newCase: Case) {
    const { merchant_id, case_id, debtor_name, amount, wholesaler_name, description, due_date, activated_at } = newCase;

    const merchant = await this.merchant.findById(merchant_id);

    let scheduled = 0;
    const todayDate = today();

    const fmtDate = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });

    const templateCtxBase = {
      debtor_name,
      amount: String(amount),
      merchant_name: merchant?.merchant_name,
      wholesaler_name: wholesaler_name ?? merchant?.merchant_name ?? '',
      case_id,
      goods: description ?? 'goods',
      due_date: fmtDate(new Date(due_date)),
      l2_deadline: fmtDate(addDaysUTC(activated_at, 6)),
      l3_deadline: fmtDate(addDaysUTC(activated_at, 13)),
      closure_date: fmtDate(addDaysUTC(activated_at, 20)),
      recovery_number: process.env.ONCRE_RECOVERY_NUMBER ?? '07049965569',
      payment_link: `https://pay.oncre.com/${case_id}`,
    };

    for (const day of ESCALATION_DAYS) {
      const tmpl = CASE_ESCALATION_MESSAGES.find((t) => t.day === day && t.action_type === ActionType.SMS);
      if (!tmpl) continue;

      let sendDate = addDaysUTC(activated_at, day - 1);
      if (sendDate < todayDate) sendDate = todayDate;

      const existing = await this.message.findOne({
        case_id,
        message_type: 'case_escalation',
        message_index: tmpl.message_index,
      });

      if (existing) continue;

      await this.message.create({
        case_id,
        merchant_id,
        debtor_phone: newCase.debtor_phone,
        day: tmpl.day,
        message_type: 'case_escalation',
        message_index: tmpl.message_index,
        action_type: tmpl.action_type,
        message_body: tmpl.body_fn(templateCtxBase),
        scheduled_for: sendDate,
        delivery_status: 'scheduled',
        message_tier: null,
        sent_at: null,
        termii_message_id: null,
        error_details: null,
        cancelled_reason: null,
        credit_id: '',
        customer_key: 'debtor',
        customer_phone: newCase.debtor_phone,
      });

      scheduled++;
    }

    return scheduled;
  }

  async process(newCase: Case) {
    const { case_id, activated_at } = newCase;

    if (newCase.status !== 'ACTIVE' || newCase.is_paused) return;
    if (isCaseOnHold(newCase)) return;

    const todayDate = today();

    let sent = 0;
    let failed = 0;

    const daysPassed = Math.floor((todayDate.getTime() - new Date(activated_at).getTime()) / 86400000) + 1;
    const currentDay = Math.min(daysPassed, 21);

    const escalationLevel = getEscalationLevel(currentDay);

    await this.cases.updateOne(
      { case_id },
      { $set: { current_day: currentDay, escalation_level: escalationLevel, updated_at: new Date() } },
    );

    if (daysPassed > 21) {
      await this.cancel(newCase, 'Completed');

      await this.cases.updateOne({ case_id }, { $set: { status: 'CLOSED', updated_at: new Date() } });

      return { sent, failed };
    }

    const dueMessages = await this.message.find({
      case_id,
      delivery_status: 'scheduled',
      scheduled_for: { $lte: todayDate },
    });

    for (const msg of dueMessages) {
      const phone: string = msg?.debtor_phone ?? '';

      const result = await this.termii.sendSMS(phone, msg.message_body);

      await this.message.updateOne(
        { _id: msg._id },
        {
          $set: {
            delivery_status: result.success ? 'sent' : 'failed',
            termii_message_id: result.success ? result.message_id : null,
            error_details: result.success ? null : (result.error ?? 'Unknown failure'),
            sent_at: new Date(),
          },
        },
      );

      result.success ? sent++ : failed++;
    }

    return { sent, failed };
  }

  async cancel(newCase: Case, reason: string) {
    const { case_id } = newCase;

    const result = await this.message.updateMany(
      {
        case_id,
        delivery_status: 'scheduled',
      },
      {
        $set: {
          delivery_status: 'cancelled',
          cancelled_reason: reason,
          updated_at: new Date(),
        },
      },
    );

    if (result.modifiedCount > 0) {
      console.log(`[Case Scheduler] Cancelled ${result.modifiedCount} messages for ${case_id}: ${reason}`);
    }

    return result.modifiedCount;
  }
}
