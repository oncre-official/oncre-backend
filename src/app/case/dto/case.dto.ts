import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsPositive, IsDateString, Matches } from 'class-validator';

export class CreateCaseDto {
  @ApiProperty({ example: 'Merchant name', description: 'Merchant Name' })
  @IsString()
  @IsNotEmpty()
  merchant_name: string;

  @ApiProperty({ example: 'Merchant phone', description: 'Merchant Phone' })
  @IsString()
  @IsNotEmpty()
  merchant_phone: string;

  @ApiProperty({ example: 'John Doe', description: 'Debtor full name' })
  @IsString()
  @IsNotEmpty()
  debtor_name: string;

  @ApiProperty({ example: '+2348012345678', description: 'Debtor phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, {
    message: 'Phone number must start with a country code (e.g., +234) followed by 10-15 digits',
  })
  debtor_phone: string;

  @ApiPropertyOptional({ example: '12 Admiralty Way, Lekki', description: 'Debtor address' })
  @IsOptional()
  @IsString()
  debtor_address?: string;

  @ApiPropertyOptional({ example: 'ABC Wholesalers Ltd', description: 'Wholesaler name' })
  @IsOptional()
  @IsString()
  wholesaler_name?: string;

  @ApiProperty({ example: 250000, description: 'Amount owed' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 'Outstanding payment for supplied goods' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-07-01', description: 'Debt due date' })
  @IsOptional()
  @IsDateString()
  due_date: Date;
}

export class UpdateCaseDto extends PartialType(CreateCaseDto) {}
