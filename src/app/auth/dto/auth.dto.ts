import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

import { ILogin, IRegister, IResetPin, ISetPin, IVerifyPhone } from '../types/auth.interface';

export class RegisterDto implements IRegister {
  @ApiProperty({ description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class LoginDto extends RegisterDto implements ILogin {
  @ApiProperty({ description: 'User Pin' })
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  @IsNotEmpty()
  pin: string;
}

export class VerifyPhoneDto extends RegisterDto implements IVerifyPhone {
  @ApiProperty({ description: 'User OTP code' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SetPinDto implements ISetPin {
  @ApiProperty({ description: 'User Pin' })
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  @IsNotEmpty()
  pin: string;
}

export class ResetPinDto extends RegisterDto implements IResetPin {
  @ApiProperty({ description: 'User Pin' })
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ description: 'User OTP code' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
