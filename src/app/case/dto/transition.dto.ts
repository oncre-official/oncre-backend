import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { TransitionOutcome } from '../types/transition.interface';

export class TransitionCaseDto {
  @ApiProperty({ description: 'The confirmation text' })
  @IsString()
  @IsNotEmpty()
  confirmationText: string;

  @ApiProperty({ enum: TransitionOutcome })
  @IsEnum(TransitionOutcome)
  @IsNotEmpty()
  outcome: TransitionOutcome;

  @ApiProperty({ example: 'Call note', description: 'Call note' })
  @IsString()
  @IsOptional()
  note: string;
}
