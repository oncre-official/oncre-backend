export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TokenType {
  PHONE_VERIFICATION = 'phone_verification',
  PIN_RESET = 'pin_reset',
}

export enum PaymentStatus {
  UNPAID = 'Unpaid',
  PART_PAID = 'PartPaid',
  PAID = 'Paid',
}

export enum MessageType {
  FREE_REGULAR = 'free_regular',
  FREE_REENGAGEMENT = 'free_reengagement',
  OLD_DEBT = 'old_debt',
  PAID_PART_REENGAGEMENT = 'paid_part_reengagement',
  ESCALATION = 'escalation',
  CASE_ESCALATION = 'case_escalation',
  CASE_ACTIVATION = 'case_activation',
  MISSED_CALL = 'missed_call',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  PAYMENT_PLAN = 'payment_plan',
}

export enum CallType {
  DEBT = 'debt',
  CASE = 'case',
  CREDIT_REENGAGEMENT = 'credit_reengagement',
  CASE_ESCALATION = 'case_escalation',
}

export enum EscalationTier {
  TIER_0 = 0,
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
}

export enum MessageDeliveryStatus {
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum CallOutcomeStatus {
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum CasePaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum EventType {
  PAYMENT = 'payment',
  REENGAGEMENT = 'reengagement',
  ESCALATION = 'escalation',
}

export enum ActionType {
  SMS = 'sms',
  CALL = 'call',
}
