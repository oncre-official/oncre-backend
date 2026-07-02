import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum ActivationStatus {
  APPROVED = 'approved',
  FLAGGED = 'flagged',
  FOLLOW_UP = 'follow_up',
}

export class ActivationPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  merchant_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsString()
  receipt_url: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class ConfirmActivationPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  payment_id: string;

  @ApiProperty({ enum: ActivationStatus })
  @IsEnum(ActivationStatus)
  @IsNotEmpty()
  status: ActivationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
