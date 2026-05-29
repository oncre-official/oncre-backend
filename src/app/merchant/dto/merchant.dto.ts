import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MerchantDto {
  @ApiProperty({ description: 'Unique identifier for the merchant', example: 'MER-00001' })
  @IsString()
  @IsNotEmpty()
  merchant_id: string;

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

  @ApiProperty({ description: 'Location of the merchant', example: '123 Main St, City, Country' })
  @IsString()
  @IsNotEmpty()
  location: string;
}
