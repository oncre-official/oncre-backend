import { ActionType, EscalationTier, MessageType } from '@on/enum';
import { ScheduledMessage } from '@on/utils/types';

export function getEscalationMessages(tier: EscalationTier): ScheduledMessage[] {
  const tier1 = 1 as EscalationTier;
  const tier2 = 2 as EscalationTier;
  const tier3 = 3 as EscalationTier;

  switch (tier) {
    case tier1:
      return ESCALATION_TIER_1_MESSAGES;
    case tier2:
      return ESCALATION_TIER_2_MESSAGES;
    case tier3:
      return ESCALATION_TIER_3_MESSAGES;
    default:
      return [];
  }
}

export const FREE_REGULAR_MESSAGES: ScheduledMessage[] = [
  {
    message_type: MessageType.FREE_REGULAR,
    message_index: 1,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: -4, // 4 days before due date
    label: 'Regular — 4 Days Before Due',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nPayment of ${ctx.amount} to ${ctx.merchant_name} go due soon.\nAbeg plan am ahead make date no catch you by surprise.\nThanks.`,
  },
  {
    message_type: MessageType.FREE_REGULAR,
    message_index: 2,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 0, // On due date
    label: 'Regular — Due Date',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nToday na due date for your ${ctx.amount} payment to ${ctx.merchant_name}.\nThank you.`,
  },
  {
    message_type: MessageType.FREE_REGULAR,
    message_index: 3,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 9, // 9 days after due date
    label: 'Regular — 9 Days Overdue',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nYour ${ctx.amount} payment to ${ctx.merchant_name} still dey pending.\nThis credit don overdue. Abeg treat am with urgency.`,
  },
];

export const FREE_REENGAGEMENT_MESSAGES: ScheduledMessage[] = [
  {
    message_type: MessageType.FREE_REENGAGEMENT,
    message_index: 1,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 0, // Day of upload
    label: 'Re-Engagement — Day 0',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nThis na gentle reminder from ${ctx.merchant_name} about ${ctx.amount} wey still dey pending.\nAbeg put am for mind. You fit reach am ${ctx.merchant_phone}.\nThank you.`,
  },
  {
    message_type: MessageType.FREE_REENGAGEMENT,
    message_index: 2,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 4, // 4 days after upload
    label: 'Re-Engagement — Day 4',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nWe dey follow up from ${ctx.merchant_name} about ${ctx.amount} wey never clear.\nAbeg call make una agree on next step.\nThank you.`,
  },
  {
    message_type: MessageType.FREE_REENGAGEMENT,
    message_index: 3,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 14, // 10 days after second message (day 4 + 10 = 14)
    label: 'Re-Engagement — Day 14',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\n${ctx.merchant_name} still dey wait to hear from you about ${ctx.amount} wey dey outstanding.\nAbeg call today make this matter clear.`,
  },
];

export const OLD_DEBT_MESSAGES: ScheduledMessage[] = [
  {
    message_type: MessageType.OLD_DEBT,
    message_index: 1,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 0, // Upload day
    label: 'Old Debt — Day 0',
    body_fn: (ctx) =>
      `Hi ${ctx.customer_name},\nYou still have an unpaid balance of ${ctx.amount} from your last purchase at ${ctx.merchant_name}.\nPlease call ${ctx.merchant_phone} today so you can settle this or plan your next payment. Thank you!`,
  },
  {
    message_type: MessageType.OLD_DEBT,
    message_index: 2,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 7, // 7 days after upload
    label: 'Old Debt — Day 7',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, We're following up from ${ctx.merchant_name} on an unpaid balance of ${ctx.amount}.\nPlease call ${ctx.merchant_phone} right away to clear this balance.`,
  },
];

export const PART_REENGAGEMENT_MESSAGES: ScheduledMessage[] = [
  {
    message_type: MessageType.PAID_PART_REENGAGEMENT,
    message_index: 1,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 0, // Immediately after part payment — offset from activation
    label: 'Part Re-Engagement — Confirmation',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, We don confirm part payment of ${ctx.paid_amount} to ${ctx.merchant_name}. Thank you. Remaining balance na ${ctx.balance_amount}. We go follow up before the next date.`,
  },
  {
    message_type: MessageType.PAID_PART_REENGAGEMENT,
    message_index: 2,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 0, // ON the new/agreed due date — offset from due_date
    label: 'Part Re-Engagement — Due Date',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nToday na due date for remaining ${ctx.balance_amount} to ${ctx.merchant_name}.\nAbeg plan am make this record clear. Thank you.`,
  },
  {
    message_type: MessageType.PAID_PART_REENGAGEMENT,
    message_index: 3,
    message_tier: null,
    action_type: ActionType.SMS,
    day_offset: 7, // 7 days after due date
    label: 'Part Re-Engagement — 7 Days Overdue',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nThis na follow-up from ${ctx.merchant_name} on the remaining ${ctx.balance_amount} wey still dey outstanding.\nAbeg call today make this matter clear.`,
  },
];

export const ESCALATION_TIER_1_MESSAGES: ScheduledMessage[] = [
  {
    message_type: MessageType.ESCALATION,
    message_index: 1,
    message_tier: 1,
    action_type: ActionType.SMS,
    day_offset: 0,
    label: 'Tier 1 — Message 1',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nThis is a follow-up on an unpaid ${ctx.amount} balance with ${ctx.merchant_name}.\nPlease call ${ctx.merchant_phone} to confirm payment or discuss next steps.`,
  },
  {
    message_type: MessageType.ESCALATION,
    message_index: 2,
    message_tier: 1,
    action_type: ActionType.SMS,
    day_offset: 3,
    label: 'Tier 1 — Message 2',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nYour ${ctx.amount} balance with ${ctx.merchant_name} remains unpaid.\nPlease contact ${ctx.merchant_phone} to resolve this.`,
  },
  {
    message_type: MessageType.ESCALATION,
    message_index: 3,
    message_tier: 1,
    action_type: ActionType.SMS,
    day_offset: 6,
    label: 'Tier 1 — Message 3',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\n${ctx.amount} payment to ${ctx.merchant_name} has not been received.\nPlease call ${ctx.merchant_phone} to close this record.`,
  },
];

// ─── 6. ESCALATION TIER 2 — ₦500 ───────────────────────────
// 4 SMS (2-day interval) + 1 support call before final SMS
// Reference date: escalation_start_date

export const ESCALATION_TIER_2_MESSAGES: ScheduledMessage[] = [
  {
    message_type: MessageType.ESCALATION,
    message_index: 1,
    message_tier: 2,
    action_type: ActionType.SMS,
    day_offset: 0,
    label: 'Tier 2 — Message 1',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nImportant reminder, ${ctx.amount} balance with ${ctx.merchant_name} is unpaid. Please call ${ctx.merchant_phone} today.`,
  },
  {
    message_type: MessageType.ESCALATION,
    message_index: 2,
    message_tier: 2,
    action_type: ActionType.SMS,
    day_offset: 2,
    label: 'Tier 2 — Message 2',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nYour ${ctx.amount} balance with ${ctx.merchant_name} remains unpaid.\nPlease call ${ctx.merchant_phone} to agree on settlement.`,
  },
  {
    message_type: MessageType.ESCALATION,
    message_index: 3,
    message_tier: 2,
    action_type: ActionType.SMS,
    day_offset: 4,
    label: 'Tier 2 — Message 3',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\n${ctx.merchant_name} is still awaiting your ${ctx.amount} payment.\nPlease contact ${ctx.merchant_phone} today to resolve this.`,
  },
  {
    message_type: MessageType.ESCALATION,
    message_index: 4,
    message_tier: 2,
    action_type: ActionType.CALL,
    day_offset: 5, // Support call before final SMS
    label: 'Tier 2 — Support Call',
    body_fn: (ctx) =>
      `[CALL] Follow up with ${ctx.customer_name} regarding ${ctx.amount} balance with ${ctx.merchant_name}. Merchant contact: ${ctx.merchant_phone}`,
  },
  {
    message_type: MessageType.ESCALATION,
    message_index: 5,
    message_tier: 2,
    action_type: ActionType.SMS,
    day_offset: 6, // Final SMS after call
    label: 'Tier 2 — Message 4 (Final)',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name},\nPlease contact ${ctx.merchant_name} today regarding your ${ctx.amount} balance.\nWe would like to close this record.`,
  },
];

// ─── 7. ESCALATION TIER 3 — ₦1000 ──────────────────────────
// 10 daily SMS + 3 support calls
// Calls: Before Day 1, Day 3, Day 9
// Reference date: escalation_start_date

export const ESCALATION_TIER_3_MESSAGES: ScheduledMessage[] = [
  // Call 1 — Before Day 1 (understanding + payment plan)
  {
    message_type: MessageType.ESCALATION,
    message_index: 1,
    message_tier: 3,
    action_type: ActionType.CALL,
    day_offset: 0,
    label: 'Tier 3 — Call 1 (Before Day 1)',
    body_fn: (ctx) =>
      `[CALL] Understanding + payment plan with ${ctx.customer_name} regarding ${ctx.amount} with ${ctx.merchant_name}. Merchant: ${ctx.merchant_phone}`,
  },
  // Day 1
  {
    message_type: MessageType.ESCALATION,
    message_index: 2,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 0,
    label: 'Tier 3 — Day 1',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, This is a daily reminder regarding an unpaid balance of ${ctx.amount} with ${ctx.merchant_name}. Please contact ${ctx.merchant_phone} to resolve this.`,
  },
  // Day 2
  {
    message_type: MessageType.ESCALATION,
    message_index: 3,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 1,
    label: 'Tier 3 — Day 2',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, This is a daily reminder regarding an unpaid balance of ${ctx.amount} with ${ctx.merchant_name}. Please contact ${ctx.merchant_phone} to resolve this.`,
  },
  // Day 3 — SMS + Call 2
  {
    message_type: MessageType.ESCALATION,
    message_index: 4,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 2,
    label: 'Tier 3 — Day 3',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, This is a daily reminder regarding an unpaid balance of ${ctx.amount} with ${ctx.merchant_name}. Please contact ${ctx.merchant_phone} to resolve this.`,
  },
  {
    message_type: MessageType.ESCALATION,
    message_index: 5,
    message_tier: 3,
    action_type: ActionType.CALL,
    day_offset: 2,
    label: 'Tier 3 — Call 2 (Day 3)',
    body_fn: (ctx) =>
      `[CALL] Follow-up with ${ctx.customer_name} regarding ${ctx.amount} with ${ctx.merchant_name}. Merchant: ${ctx.merchant_phone}`,
  },
  // Day 4
  {
    message_type: MessageType.ESCALATION,
    message_index: 6,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 3,
    label: 'Tier 3 — Day 4',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, Your outstanding balance of ${ctx.amount} with ${ctx.merchant_name} remains unresolved. Please call to agree on payment.`,
  },
  // Day 5
  {
    message_type: MessageType.ESCALATION,
    message_index: 7,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 4,
    label: 'Tier 3 — Day 5',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, Your outstanding balance of ${ctx.amount} with ${ctx.merchant_name} remains unresolved. Please call to agree on payment.`,
  },
  // Day 6
  {
    message_type: MessageType.ESCALATION,
    message_index: 8,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 5,
    label: 'Tier 3 — Day 6',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, Your outstanding balance of ${ctx.amount} with ${ctx.merchant_name} remains unresolved. Please call to agree on payment.`,
  },
  // Day 7
  {
    message_type: MessageType.ESCALATION,
    message_index: 9,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 6,
    label: 'Tier 3 — Day 7',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, Your outstanding balance of ${ctx.amount} with ${ctx.merchant_name} remains unresolved. Please call to agree on payment.`,
  },
  // Day 8
  {
    message_type: MessageType.ESCALATION,
    message_index: 10,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 7,
    label: 'Tier 3 — Day 8',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, This unpaid balance of ${ctx.amount} with ${ctx.merchant_name} is still open. This reminder will stop once the record is cleared.`,
  },
  // Day 9 — SMS + Call 3
  {
    message_type: MessageType.ESCALATION,
    message_index: 11,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 8,
    label: 'Tier 3 — Day 9',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, This unpaid balance of ${ctx.amount} with ${ctx.merchant_name} is still open. This reminder will stop once the record is cleared.`,
  },
  {
    message_type: MessageType.ESCALATION,
    message_index: 12,
    message_tier: 3,
    action_type: ActionType.CALL,
    day_offset: 8,
    label: 'Tier 3 — Call 3 (Day 9, Final)',
    body_fn: (ctx) =>
      `[CALL] Final support call with ${ctx.customer_name} regarding ${ctx.amount} with ${ctx.merchant_name}. Merchant: ${ctx.merchant_phone}`,
  },
  // Day 10
  {
    message_type: MessageType.ESCALATION,
    message_index: 13,
    message_tier: 3,
    action_type: ActionType.SMS,
    day_offset: 9,
    label: 'Tier 3 — Day 10',
    body_fn: (ctx) =>
      `Hello ${ctx.customer_name}, This unpaid balance of ${ctx.amount} with ${ctx.merchant_name} is still open. This reminder will stop once the record is cleared.`,
  },
];
