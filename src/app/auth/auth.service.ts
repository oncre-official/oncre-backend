import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenType } from '@on/enum';
import { compareResource, hashResource } from '@on/helpers/password';
import { formatPhoneWithCode, parsePhone } from '@on/helpers/phone';
import { ServiceResponse } from '@on/utils/types';

import { TokenRepository } from '../user/repository/token.repository';
import { UserRepository } from '../user/repository/user.repository';

import { UserService } from './../user/user.service';
import { LoginDto, ResetPasswordDto, SharedAuthDto } from './dto/auth.dto';
import { IUserToken } from './types/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly user: UserRepository,
    private readonly token: TokenRepository,
    private readonly userService: UserService,
  ) {}

  public async signin(payload: LoginDto): Promise<ServiceResponse<IUserToken>> {
    const { phone, password, email } = payload;

    const conditions: any[] = [];

    if (phone) {
      const normalizedPhone = formatPhoneWithCode(phone);
      const { code, phone: number } = parsePhone(normalizedPhone);

      conditions.push({ country_code: code, phone: number });
    }

    if (email) conditions.push({ email: email.toLowerCase().trim() });
    if (!conditions.length) throw new BadRequestException('Email or phone number is required.');

    const user = await this.user.findOne({ $or: conditions });
    if (!user) throw new NotFoundException('User with this phone number or email does not exist.');

    const isValidPassword: boolean = await compareResource(password, user.password);
    if (!isValidPassword) throw new BadRequestException('Incorrect password provided');

    const jwt = this.jwt.sign({ ...user.toJSON() });

    const data = {
      user,
      token: jwt,
    };

    return { data, message: 'User login successfully.' };
  }

  public async forgetPassword(payload: SharedAuthDto): Promise<ServiceResponse<any>> {
    const { phone, email } = payload;

    const user = await this.user.findOne({ $or: [{ phone }, { email }] });
    if (!user) throw new NotFoundException('User with this phone number or email does not exist.');

    const otp = await this.userService.createVerificationOtp(user, TokenType.PIN_RESET);

    const data = {
      phone,
      userId: user._id,
      otp,
    };

    return { data, message: 'OTP sent for PIN reset.' };
  }

  public async resetPassword(payload: ResetPasswordDto): Promise<ServiceResponse<IUserToken>> {
    const { newPassword, otp, phone, email } = payload;

    const user = await this.user.findOne({ $or: [{ phone }, { email }] });
    if (!user) throw new NotFoundException('User with this phone number or email does not exist.');

    const token = await this.token.findOne({ type: TokenType.PIN_RESET, token: otp });
    if (!token) throw new BadRequestException('Invalid OTP code.');

    if (token.user_id.toString() !== user._id.toString()) throw new BadRequestException('Invalid user OTP.');
    if (token.expires_at < new Date()) throw new BadRequestException('OTP has expired. Please request a new one.');

    const hash = await hashResource(newPassword);

    await this.user.updateById(user._id, { password: hash, password_changed: true });
    await token.deleteOne();

    const jwt = this.jwt.sign(user.toJSON());

    const data = {
      user,
      token: jwt,
    };

    return { data, message: 'Password reset successfully.' };
  }
}
