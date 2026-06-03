import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { ILogin, IResetPassword, ISharedAuth } from '../types/auth.interface';

export class SharedAuthDto implements ISharedAuth {
  @ApiProperty({ description: 'User email or phone number' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class LoginDto extends SharedAuthDto implements ILogin {
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
