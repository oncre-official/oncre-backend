import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class InitiateActivationDto {
  @ApiPropertyOptional({ description: 'Where Paystack redirects the browser after checkout' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  callback_url?: string;
}

export class VerifyActivationDto {
  @ApiProperty({ description: 'The Paystack transaction reference' })
  @IsString()
  @IsNotEmpty()
  reference: string;
}

export class RemittanceDto {
  @ApiProperty({ description: 'The Payment id' })
  @IsString()
  @IsNotEmpty()
  payment_id: string;
}
