import { Merchant } from '@on/app/merchant/model/merchant.model';
import { ActionType, MessageType } from '@on/enum';
import { formatDate } from '@on/helpers/date';
import { ScheduledMessage } from '@on/utils/types';

import { Case } from '../model/case.model';

const RECOVERY_NUMBER = process.env.ONCRE_RECOVERY_NUMBER ?? '07012345678';

export const ESCALATION_DAYS = [2, 3, 4, 7, 8, 9, 10, 12, 15, 16, 19];

export const CASE_ACTIVATION_MESSAGES = [
  {
    type: 'merchant',
    channel: 'sms',
    build: (data: Case, merchant: Merchant | any) =>
      `Hello ${merchant?.merchant_name ?? 'Partner'}, Case Activated! [Case ID: ${data.case_id}] We have officially started the recovery process for ${data.debtor_name} (₦${data.amount}). We will send you an update as soon as they respond or make a payment.`,
  },
  {
    type: 'debtor',
    channel: 'sms',
    build: (data: Case, merchant: Merchant | any) => {
      const wholesaler = data.wholesaler_name || merchant?.merchant_name || 'your supplier';
      const goods = data.description || 'goods';
      const date = formatDate(data.due_date);
      return `Hello ${data.debtor_name}. ${wholesaler} has asked us to follow up on an overdue payment for ${goods} collected on ${date}. Case ID: ${data.case_id}. Please call/WhatsApp ${RECOVERY_NUMBER} today to settle this so we can close the case. If you believe this is an error, contact us within 48 hours.`;
    },
  },
];

export const CASE_ESCALATION_MESSAGES: ScheduledMessage[] = [
  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 1,
    day: 2,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Following up on Case ID ${ctx.case_id} for ₦${ctx.amount} outstanding to ${ctx.wholesaler_name}. If you can't pay in full, call ${ctx.recovery_number} to set a repayment plan today.`,
    message_tier: null,
    label: 'Day 2 - L1 Follow-up',
  },

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 2,
    day: 3,
    action_type: ActionType.CALL,
    body_fn: () => '',
    message_tier: null,
    label: 'Day 3 - L1 Call',
  },
  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 3,
    day: 3,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `We attempted to reach you by phone regarding Case ID ${ctx.case_id} (₦${ctx.amount} outstanding). Please call ${ctx.recovery_number} today to settle or structure a plan.`,
    message_tier: null,
    label: 'Day 3 - Missed Call SMS',
  },

  // ───────── LEVEL 2: Formal Notice & Deadline (Days 4–7) ─────────

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 4,
    day: 4,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Case ID ${ctx.case_id} of ₦${ctx.amount} remains outstanding to ${ctx.wholesaler_name} for ${ctx.goods} collected on ${ctx.due_date}. Kindly settle this by ${ctx.l2_deadline} at 6pm by calling ${ctx.recovery_number} or using ${ctx.payment_link}.`,
    message_tier: null,
    label: 'Day 4 - L2 Formal Notice',
  },

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 5,
    day: 7,
    action_type: ActionType.CALL,
    body_fn: () => '',
    message_tier: null,
    label: 'Day 7 - L2 Call',
  },
  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 6,
    day: 7,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `We attempted to reach you by phone regarding Case ID ${ctx.case_id} (₦${ctx.amount} outstanding). Please call/WhatsApp ${ctx.recovery_number} to confirm settlement, or use ${ctx.payment_link} to start payment today.`,
    message_tier: null,
    label: 'Day 7 - Missed Call SMS',
  },

  // ───────── LEVEL 3: Final Demand & Part-Payment Trigger (Days 8–14) ─────────

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 7,
    day: 8,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Case ID ${ctx.case_id} of ₦${ctx.amount} remains unpaid. To avoid the formal transfer of your file to our legal recovery team, call us on ${ctx.recovery_number} or use ${ctx.payment_link} to start making part payments today.`,
    message_tier: null,
    label: 'Day 8 - L3 Formal Demand',
  },

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 8,
    day: 9,
    action_type: ActionType.CALL,
    body_fn: () => '',
    message_tier: null,
    label: 'Day 9 - L3 Call Attempt 1',
  },
  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 9,
    day: 9,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Case ID ${ctx.case_id} (₦${ctx.amount}), We just tried calling you but couldn't reach you. Please call ${ctx.recovery_number} today to resolve this, or use ${ctx.payment_link} to start part payment. Thank you.`,
    message_tier: null,
    label: 'Day 9 - Missed Call SMS',
  },

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 10,
    day: 10,
    action_type: ActionType.CALL,
    body_fn: () => '',
    message_tier: null,
    label: 'Day 10 - L3 Call Attempt 2',
  },
  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 11,
    day: 10,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Final reminder for Case ID ${ctx.case_id} (₦${ctx.amount}). If we do not hear from you or receive payment by ${ctx.l3_deadline} at 6pm, this case will move to the next escalation stage. Please call ${ctx.recovery_number} today to resolve this, or use ${ctx.payment_link} to start part payment. Thank you.`,
    message_tier: null,
    label: 'Day 10 - L3 Final Reminder',
  },

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 12,
    day: 12,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Case ID ${ctx.case_id} (₦${ctx.amount}). Resolve today to avoid record status update. Please call ${ctx.recovery_number} today to resolve this, or use ${ctx.payment_link} to start part payment. Thank you.`,
    message_tier: null,
    label: 'Day 12 - L3 Last Attempt',
  },

  // ───────── LEVEL 4: Credit Eligibility Status & Closure Window (Days 15–21) ─────────

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 13,
    day: 15,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Your outstanding Case ID ${ctx.case_id} of ₦${ctx.amount} has not been resolved. This case will be recorded as unpaid and may affect your future eligibility for credit purchases and credit standing with ${ctx.wholesaler_name}. This results in a 'Cash-Only' restriction across our internal partner network. You have a final window to resolve this by ${ctx.closure_date}. Call ${ctx.recovery_number} or use ${ctx.payment_link} to start making part payments today.`,
    message_tier: null,
    label: 'Day 15 - L4 Credit Consequence',
  },

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 14,
    day: 16,
    action_type: ActionType.CALL,
    body_fn: () => '',
    message_tier: null,
    label: 'Day 16 - L4 Call',
  },
  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 15,
    day: 16,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Case ID ${ctx.case_id} (₦${ctx.amount}). We tried calling you again but couldn't reach you. Please call ${ctx.recovery_number} today to resolve this, or use ${ctx.payment_link} to start part payment before the closure date. Thank you.`,
    message_tier: null,
    label: 'Day 16 - L4 Missed Call SMS',
  },

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 16,
    day: 19,
    action_type: ActionType.SMS,
    body_fn: (ctx) =>
      `Case ID ${ctx.case_id} (₦${ctx.amount}) remains unresolved. Please resolve this on or before ${ctx.closure_date} at 6pm to avoid case closure as unpaid. Please call ${ctx.recovery_number} today to resolve this, or use ${ctx.payment_link} to start part payment.`,
    message_tier: null,
    label: 'Day 19 - Final Warning',
  },

  {
    message_type: MessageType.CASE_ESCALATION,
    message_index: 17,
    day: 20,
    action_type: ActionType.CALL,
    body_fn: () => '',
    message_tier: null,
    label: 'Day 20 - Final Call',
  },
];
