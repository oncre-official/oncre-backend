import { ApiHideProperty, ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminCreateUserDto {
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
