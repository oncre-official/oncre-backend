import { ApiPropertyOptional } from '@nestjs/swagger';

import { QueryDto } from '@on/utils/dto/query.dto';

export class QueryCaseDto extends QueryDto {
  @ApiPropertyOptional()
  ownerId?: string;

  @ApiPropertyOptional()
  customerId?: string;
}
