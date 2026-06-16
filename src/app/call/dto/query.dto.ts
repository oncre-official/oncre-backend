import { ApiPropertyOptional } from '@nestjs/swagger';

import { QueryDto } from '@on/utils/dto/query.dto';

export class QueryCallDto extends QueryDto {
  @ApiPropertyOptional()
  call_id?: string;

  @ApiPropertyOptional()
  case_id?: string;

  @ApiPropertyOptional()
  merchant_id?: string;

  @ApiPropertyOptional()
  call_type?: string;
}
