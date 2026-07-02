import { ApiPropertyOptional } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

import { PaymentStatus } from '@on/enum';
import { QueryDto } from '@on/utils/dto/query.dto';

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

  @ApiPropertyOptional({ description: 'The merchant id' })
  merchant_id?: string;

  @ApiPropertyOptional({ description: 'The case id' })
  case_id?: string;

  @ApiPropertyOptional({ description: 'The uploaded by user id' })
  uploaded_by?: ObjectId;
}
