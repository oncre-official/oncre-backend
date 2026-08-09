import { ApiPropertyOptional } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { PaymentStatus } from '@on/enum';
import { QueryDto } from '@on/utils/dto/query.dto';

import {
  InstallmentPaymentStatus,
  PaymentFrequency,
  PaymentGenerationStatus,
  PaymentPlanStatus,
} from '../types/payment-plan.interface';
import { MerchantPaymentStatus, PaymentType } from '../types/payment.interface';

export class QueryPaymentDto extends QueryDto {
  @ApiPropertyOptional({ enum: PaymentStatus, description: 'The payment status' })
  status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentType, description: 'The payment type' })
  type?: PaymentType;

  @ApiPropertyOptional({ enum: MerchantPaymentStatus, description: 'The merchant payment status' })
  merchant_status?: MerchantPaymentStatus;

  @ApiPropertyOptional({ description: 'The payment id' })
  payment_id?: string;

  @ApiPropertyOptional({ description: 'The payment plan id' })
  plan_id?: string;

  @ApiPropertyOptional({ description: 'The case id' })
  case_id?: string;

  @ApiPropertyOptional({ description: 'The uploaded by user id' })
  uploaded_by?: ObjectId;
}

export class QueryPaymentPlanDto extends QueryDto {
  @ApiPropertyOptional({ enum: PaymentPlanStatus, description: 'The payment status' })
  status?: PaymentPlanStatus;

  @ApiPropertyOptional({ enum: PaymentFrequency, description: 'The payment frequency' })
  frequency?: PaymentFrequency;

  @ApiPropertyOptional({ description: 'The payment plan id' })
  plan_id?: string;

  @ApiPropertyOptional({ description: 'The case id' })
  case_id?: string;
}

export class QueryPaymentInstallmentDto extends QueryDto {
  @ApiPropertyOptional({ enum: InstallmentPaymentStatus, description: 'The payment status' })
  status?: InstallmentPaymentStatus;

  @ApiPropertyOptional({ enum: PaymentGenerationStatus, description: 'The payment generation status' })
  generation_status: PaymentGenerationStatus;

  @ApiPropertyOptional({ description: 'The payment installment_id id' })
  installment_id?: string;

  @ApiPropertyOptional({ description: 'The payment plan id' })
  plan_id?: string;

  @ApiPropertyOptional({ description: 'The case id' })
  case_id?: string;
}
