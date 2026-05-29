import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

import { QueryDto } from '@on/utils/dto/query.dto';

export class RepaymentDto {
  @ApiProperty({ description: 'Total credit amount to offer', example: 2000, minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Credit due date (ISO string)', example: '2026-03-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  date: Date;
}

export class QueryRepaymentDto extends QueryDto {
  @ApiPropertyOptional()
  amount?: string;

  @ApiPropertyOptional()
  date?: string;

  @ApiPropertyOptional()
  creditId?: string;
}
