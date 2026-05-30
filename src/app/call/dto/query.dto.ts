import { ApiPropertyOptional } from '@nestjs/swagger';

import { QueryDto } from '@on/utils/dto/query.dto';

export class QueryCallDto extends QueryDto {
  @ApiPropertyOptional()
  ownerId?: string;

  @ApiPropertyOptional()
  customerId?: string;
}
