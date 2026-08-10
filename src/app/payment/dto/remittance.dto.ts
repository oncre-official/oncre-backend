import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { QueryDto } from '@on/utils/dto/query.dto';

export class RemittanceDto {
  @ApiProperty({ description: 'The Payment id' })
  @IsString()
  @IsNotEmpty()
  payment_id: string;
}

export class QueryRemittanceOverviewDto extends QueryDto {
  @ApiPropertyOptional({ description: 'The merchant id' })
  merchant_id?: string;
}
