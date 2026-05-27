import { Injectable, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { config } from '@on/config';

import { IMessageRequest, IOTPRequest, IOTPpin, IPinVerification, MessageResponse, OTPResponse } from './type';

@Injectable()
export class TermiiService {
  private readonly axios: AxiosInstance;
  private readonly apiKey: string;
  private readonly senderId: string;

  constructor() {
    this.apiKey = config.termii.apiKey as string;
    this.senderId = config.termii.senderId || 'N-Alert';

    this.axios = axios.create({
      baseURL: 'https://api.ng.termii.com/api',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async sendMessage(to: string, message: string): Promise<MessageResponse> {
    const payload: IMessageRequest = {
      api_key: this.apiKey,
      to,
      from: this.senderId,
      sms: message,
      type: 'plain',
      channel: 'generic',
    };

    try {
      const { data } = await this.axios.post<MessageResponse>('/sms/send', payload);

      return data;
    } catch (error:any) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async sendOTP(to: string): Promise<OTPResponse> {
    const payload: IOTPRequest = {
      api_key: this.apiKey,
      message_type: 'NUMERIC',
      to,
      from: this.senderId,
      channel: 'dnd',
      pin_attempts: 10,
      pin_time_to_live: 5,
      pin_length: 6,
      pin_placeholder: '< 1234 >',
      message_text: 'Your code is < 1234 >. Valid for 30 minutes, one-time use only.',
      pin_type: 'NUMERIC',
    };

    try {
      const { data } = await this.axios.post<OTPResponse>('/sms/otp/send', payload);

      return data;
    } catch (error:any) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyOTP(data: IOTPpin): Promise<any> {
    const payload: IPinVerification = {
      api_key: this.apiKey,
      pin_id: data.pinId,
      pin: data.pin,
    };

    try {
      const { data: response } = await this.axios.post('/sms/otp/verify', payload);

      return response;
    } catch (error:any) {
      throw new BadRequestException(error.message);
    }
  }
}
