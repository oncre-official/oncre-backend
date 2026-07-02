import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationDto } from './pagination.dto';

export class QueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'The module id' })
  _id?: string;

  @ApiPropertyOptional({ description: 'The search parameter' })
  search?: string;

  @ApiPropertyOptional()
  start_date?: Date;

  @ApiPropertyOptional()
  end_date?: Date;
}
