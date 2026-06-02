import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ILogin, IResetPassword, ISharedAuth } from '../types/auth.interface';

export class SharedAuthDto implements ISharedAuth {
  @ApiPropertyOptional({ description: 'User phone number' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({ description: 'User email address' })
  @IsString()
  @IsOptional()
  email: string;
}

export class LoginDto implements ILogin {
  @ApiProperty({ description: 'User email or phone number' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'User Password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ResetPasswordDto extends SharedAuthDto implements IResetPassword {
  @ApiProperty({ description: 'New User Password' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ description: 'User OTP code' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
