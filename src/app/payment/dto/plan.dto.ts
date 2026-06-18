import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum } from 'class-validator';

export enum TrancheType {
  Week = 'week',
  Month = 'month',
}

export class CreatePlanDto {
  @ApiProperty({ example: 'case_123', description: 'The case ID' })
  @IsString()
  @IsNotEmpty()
  case_id: string;

  @ApiProperty({ enum: TrancheType, example: TrancheType.Week, description: 'Tranche type' })
  @IsEnum(TrancheType)
  @IsNotEmpty()
  type: TrancheType;

  @ApiProperty({ example: 1000, description: 'The value amount' })
  @IsNumber()
  @IsNotEmpty()
  value: number;
}
