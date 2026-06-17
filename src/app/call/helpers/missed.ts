import { Call } from '../model/call.model';

export function buildMissedCallMessage(call: Call): string {
  const day = call.day ?? 0;

  const base = `We tried reaching you regarding your outstanding debt of ₦${call.case.amount}.`;

  const messages: Record<number, string> = {
    3: `${base} Kindly call us back or make payment to avoid further reminders.`,
    7: `${base} This is a second attempt. Please respond urgently.`,
    9: `${base} Urgent attention required. Failure to respond may escalate this case.`,
    10: `${base} Immediate action is required to prevent further escalation.`,
    16: `${base} Multiple attempts made. Please resolve this today.`,
    20: `${base} FINAL NOTICE: Failure to respond will lead to final escalation.`,
  };

  return messages[day] || base;
}
