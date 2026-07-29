import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Personal name of the customer', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiPropertyOptional({ description: 'Personal name of the customer', example: 'John Doe' })
  @IsString()
  @IsOptional()
  business_name: string;

  @ApiProperty({ description: 'Phone number of the customer', example: '+2348012345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, {
    message: 'Phone number must start with a country code (e.g., +234) followed by 10-15 digits',
  })
  customer_phone: string;
}

export class CustomerDto extends CreateCustomerDto {
  @ApiProperty({ description: 'Unique identifier for the customer', example: 'CUS-00001' })
  @IsString()
  @IsNotEmpty()
  customer_id: string;
}

export class CashOnlyDto {
  @ApiPropertyOptional({ description: 'Reason for the restriction change', example: 'Missed 3 consecutive payments' })
  @IsString()
  @IsOptional()
  reason?: string;
}
