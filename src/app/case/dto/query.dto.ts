import { ApiPropertyOptional } from '@nestjs/swagger';

import { QueryDto } from '@on/utils/dto/query.dto';

import { CaseStatus, RecoveryMode } from '../types/case.interface';

export class QueryCaseDto extends QueryDto {
  @ApiPropertyOptional()
  case_id?: string;

  @ApiPropertyOptional()
  merchant_id?: string;

  @ApiPropertyOptional()
  debtor_name?: string;

  @ApiPropertyOptional()
  amount?: number;

  @ApiPropertyOptional({ enum: CaseStatus })
  status?: CaseStatus;

  @ApiPropertyOptional()
  escalation_level?: number;

  @ApiPropertyOptional()
  is_paused?: boolean;

  @ApiPropertyOptional()
  hold?: boolean;

  @ApiPropertyOptional({ enum: RecoveryMode })
  recovery_mode?: RecoveryMode;
}
