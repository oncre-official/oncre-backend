import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ObjectId } from 'mongodb';

import { CommissionPayoutMethod } from '../types/commission.interface';

export class CommissionPayoutDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  user_id: ObjectId;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: CommissionPayoutMethod })
  @IsEnum(CommissionPayoutMethod)
  @IsNotEmpty()
  method: CommissionPayoutMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
