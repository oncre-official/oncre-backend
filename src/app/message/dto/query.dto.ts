import { ApiPropertyOptional } from '@nestjs/swagger';

import { QueryDto } from '@on/utils/dto/query.dto';

import { CREDIT_STATUS } from '../types/message.interface';

export class QueryCreditDto extends QueryDto {
  @ApiPropertyOptional()
  ownerId?: string;

  @ApiPropertyOptional()
  customerId?: string;

  @ApiPropertyOptional({ enum: CREDIT_STATUS, required: false })
  status?: string;
}
