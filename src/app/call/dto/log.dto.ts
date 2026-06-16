import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CALL_OUTCOMES } from '../helpers/enum';

export class LogCallDto {
  @ApiProperty({ example: 'The call id', description: 'The call id' })
  @IsString()
  @IsNotEmpty()
  call_id: string;

  @ApiProperty({ example: 'The outcome of the call', enum: CALL_OUTCOMES })
  @IsEnum(CALL_OUTCOMES)
  @IsNotEmpty()
  outcome: string;

  @ApiProperty({ example: 'Call note', description: 'Call note' })
  @IsString()
  @IsOptional()
  note: string;
}
