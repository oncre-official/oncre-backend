import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Personal name of the customer', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiPropertyOptional({ description: 'Personal name of the customer', example: 'John Doe' })
  @IsString()
  @IsOptional()
  business_name: string;

  @ApiProperty({ description: 'Phone number of the customer', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  customer_phone: string;
}

export class CustomerDto extends CreateCustomerDto {
  @ApiProperty({ description: 'Unique identifier for the customer', example: 'CUS-00001' })
  @IsString()
  @IsNotEmpty()
  customer_id: string;
}
