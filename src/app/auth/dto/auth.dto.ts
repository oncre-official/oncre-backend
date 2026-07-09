import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ILogin, IRegister, IResetPassword, ISharedAuth, IVerifyOtp } from '../types/auth.interface';

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

export class VerifyOtpDto extends SharedAuthDto implements IVerifyOtp {
  @ApiProperty({ description: 'OTP code sent to the registering phone number' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class RegisterDto implements IRegister {
  @ApiProperty({ description: "The registering merchant's own name", example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ description: 'The name of the business', example: "John's Store" })
  @IsString()
  @IsNotEmpty()
  business_name: string;

  @ApiPropertyOptional({ description: 'The type of business', example: 'Retail' })
  @IsOptional()
  @IsString()
  business_type?: string;

  @ApiProperty({ description: 'Business email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Nigerian phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Account password, chosen by the merchant' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
