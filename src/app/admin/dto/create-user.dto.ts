import { ApiHideProperty, ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AgentUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zone: string;
}

export class AdminCreateUserDto extends AgentUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  country_code: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  role_id: string;

  @ApiHideProperty()
  password: string;
}

export class AdminUpdateUserDto extends PartialType(AdminCreateUserDto) {}
