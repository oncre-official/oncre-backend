export interface IInitializePayment {
  email: string;
  amount: number;
  reference: string;
  metadata: Record<string, any>;
  callback_url?: string;
}
