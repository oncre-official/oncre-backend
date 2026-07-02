import { ApiPropertyOptional } from '@nestjs/swagger';

import { QueryDto } from '@on/utils/dto/query.dto';

export class QueryAgentDto extends QueryDto {
  @ApiPropertyOptional()
  ownerId?: string;

  @ApiPropertyOptional()
  customerId?: string;
}

export class QueryCommissionDto extends QueryDto {
  @ApiPropertyOptional()
  user_id?: string;
}
