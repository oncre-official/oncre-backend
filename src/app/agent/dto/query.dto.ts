import { ApiPropertyOptional } from '@nestjs/swagger';

import { MerchantPaymentStatus } from '@on/app/payment/types/payment.interface';
import { PaginationDto } from '@on/utils/dto/pagination.dto';
import { QueryDto } from '@on/utils/dto/query.dto';

export class QueryAgentDto extends QueryDto {
  @ApiPropertyOptional()
  ownerId?: string;

  @ApiPropertyOptional()
  customerId?: string;
}

export enum ActivationFeeSortField {
  DATE = 'date',
  AGENT = 'agent',
  ZONE = 'zone',
  MERCHANT_NAME = 'merchant_name',
  AMOUNT = 'amount',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryActivationFeeSubmissionsDto extends PaginationDto {
  @ApiPropertyOptional()
  agent_name?: string;

  @ApiPropertyOptional()
  zone?: string;

  @ApiPropertyOptional({ enum: MerchantPaymentStatus })
  merchant_status?: MerchantPaymentStatus;

  @ApiPropertyOptional({ enum: ActivationFeeSortField, default: ActivationFeeSortField.DATE })
  sort_by?: ActivationFeeSortField;

  @ApiPropertyOptional({ enum: SortDirection, default: SortDirection.DESC })
  sort_dir?: SortDirection;
}

export class QueryCommissionDto extends QueryDto {
  @ApiPropertyOptional()
  user_id?: string;
}

export class ExportCommissionDto {
  @ApiPropertyOptional()
  user_id?: string;
}
