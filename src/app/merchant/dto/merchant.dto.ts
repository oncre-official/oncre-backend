import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMerchantDto {
  @ApiProperty({ description: 'Personal name of the merchant', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  merchant_name: string;

  @ApiProperty({ description: 'Store name of the merchant', example: "John's Store" })
  @IsString()
  @IsNotEmpty()
  merchant_store_name: string;

  @ApiProperty({ description: 'Phone number of the merchant', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  merchant_phone: string;

  @ApiProperty({ description: 'Type of business the merchant runs', example: 'Retail' })
  @IsString()
  @IsNotEmpty()
  business_type: string;

  @ApiProperty({ description: 'Location of the merchant', example: '123 Main St, City, Country' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ description: 'Bank name for merchant remittance', example: 'GTBank' })
  @IsString()
  @IsOptional()
  bank_name?: string;

  @ApiPropertyOptional({ description: 'Bank account number for merchant remittance', example: '0123456789' })
  @IsString()
  @IsOptional()
  bank_account_number?: string;

  @ApiPropertyOptional({ description: 'Bank account name for merchant remittance', example: 'John Doe' })
  @IsString()
  @IsOptional()
  bank_account_name?: string;
}

export class MerchantDto extends CreateMerchantDto {
  @ApiProperty({ description: 'Unique identifier for the merchant', example: 'MER-00001' })
  @IsString()
  @IsNotEmpty()
  merchant_id: string;
}
