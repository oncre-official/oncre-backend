import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OfferCreditDto {
  @ApiProperty({ description: 'Customer phone number', example: '08012345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Customer full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Total credit amount to offer', example: 2000, minimum: 1 })
  @IsNumber()
  @Min(1)
  totalAmount: number;

  @ApiProperty({ description: 'Credit due date (ISO string)', example: '2026-03-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty({ description: 'Enable extra charges for this credit', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  enableCharges?: boolean;
}
