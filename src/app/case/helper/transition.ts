export function buildPassiveRecoveryMessage(payload: {
  debtor_name: string;
  amount: number;
  merchant_name?: string;
}): string {
  return `Dear ${payload.debtor_name},

Our records show that an outstanding balance of ₦${payload.amount} remains due to ${payload.merchant_name}.

Please make payment at your earliest convenience or contact us if you require assistance.

OnCre Recovery Team`;
}
