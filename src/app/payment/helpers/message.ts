import { TemplateContext } from '@on/utils/types';

import { PaymentInstallment } from '../model/payment-installment.model';

export function buildInstallmentReminderMessage(inst: PaymentInstallment): string {
  return `Reminder: Your scheduled payment of ₦${inst.amount} is due on ${new Date(inst.due_date).toLocaleDateString(
    'en-GB',
  )}.

Kindly make your payment using the link below:
${inst.payment_url}

Thank you.`;
}

export function paymentConfirmationMessage(ctx: TemplateContext): string {
  return `Thank you ${ctx.customer_name}.\nYour ${ctx.amount} payment to ${ctx.merchant_name} has been received.`;
}
