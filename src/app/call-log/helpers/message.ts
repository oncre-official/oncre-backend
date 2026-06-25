import { Call } from '@on/app/call/model/call.model';
import { Case } from '@on/app/case/model/case.model';

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

export function disputeRaisedContent(theCase: Case, note: string): { subject: string; content: string } {
  const subject = `New Disputed, Case - ${theCase.case_id} Requires Review`;

  const content = `
    <h2>New Dispute Raised</h2>
    <p>A case has been marked as <strong>DISPUTED</strong> and requires administrative review.</p>

    <p><strong>Case ID:</strong> ${theCase.case_id}</p>
    <p><strong>Merchant:</strong> ${theCase.merchant?.merchant_name}</p>
    <p><strong>Recovery Officer Note:</strong></p>
    <p>${note}</p>

    <p>The case engine has been paused pending review.</p>
  `;

  return { subject, content };
}
