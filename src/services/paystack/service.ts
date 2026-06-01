import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { IInitializePayment } from './type';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);

  private readonly axios: AxiosInstance;
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY!;
  private readonly appUrl = process.env.APP_URL;

  constructor() {
    if (!this.secretKey) {
      this.logger.error('PAYSTACK_SECRET_KEY is not configured');
    }

    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: this.getHeaders(),
      timeout: 15000,
    });
  }

  /**
   * Headers
   */
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Initialize payment
   */
  async initiatePayment(payload: IInitializePayment) {
    this.logger.log(`[Paystack] Initializing payment...`);

    const body = {
      ...payload,
      callback_url: payload.callback_url || `${this.appUrl}/payments/callback`,
    };

    try {
      const { data } = await this.axios.post('/transaction/initialize', body);
      if (!data?.status) throw new BadRequestException(data?.message || 'Paystack initialization failed');

      this.logger.log(`[Paystack] Init success → ${data.data.reference}`);

      return {
        paymentUrl: data.data.authorization_url,
        reference: data.data.reference,
      };
    } catch (error: any) {
      this.logger.error(`[Paystack] initiatePayment error: ${error.message}`);
      throw new BadRequestException(error?.response?.data?.message || error.message);
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(reference: string) {
    if (!reference) throw new BadRequestException('Payment reference is required');

    try {
      this.logger.log(`[Paystack] Verifying payment → ${reference}`);

      const { data } = await this.axios.get(`/transaction/verify/${reference}`);
      if (!data?.status) throw new BadRequestException(data?.message || 'Paystack verification failed');
      if (data.data.status !== 'success') throw new BadRequestException(`Payment not successful: ${data.data.status}`);

      this.logger.log(`[Paystack] Payment verified → ${reference}`);

      return {
        reference: data.data.reference,
        amount: data.data.amount / 100,
        metadata: data.data.metadata,
        paidAt: data.data.paid_at,
        channel: data.data.channel,
      };
    } catch (error: any) {
      this.logger.error(`[Paystack] verifyPayment error: ${error.message}`);
      throw new BadRequestException(error?.response?.data?.message || error.message);
    }
  }
}
