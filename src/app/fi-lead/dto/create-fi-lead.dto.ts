import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { NplVolumeBracket } from '../types/fi-lead.interface';

export class CreateFiLeadDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ example: 'First City Bank' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  institution_name: string;

  @ApiProperty({ enum: NplVolumeBracket })
  @IsEnum(NplVolumeBracket)
  npl_volume_bracket: NplVolumeBracket;

  @ApiProperty({ example: 'jane@institution.com' })
  @IsEmail()
  work_email: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utm_source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utm_medium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utm_campaign?: string;

  @ApiPropertyOptional({ description: 'Set by the caller when a honeypot field was filled' })
  @IsOptional()
  @IsBoolean()
  bot_suspected?: boolean;
}
