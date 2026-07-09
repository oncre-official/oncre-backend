import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { config } from '@on/config';
import { TokenType, UserStatus } from '@on/enum';
import { compareResource, hashResource } from '@on/helpers/password';
import { formatPhoneWithCode, parsePhone } from '@on/helpers/phone';
import { buildUserLookupQuery, buildUserLookupQueryFromPayload } from '@on/helpers/user';
import { ServiceResponse } from '@on/utils/types';

import { MerchantRepository } from '../merchant/repository/merchant.repository';
import { RoleRepository } from '../role/repository/role.repository';
import { SharedService } from '../shared/shared.service';
import { TokenRepository } from '../user/repository/token.repository';
import { UserRepository } from '../user/repository/user.repository';

import { UserService } from './../user/user.service';
import { LoginDto, RegisterDto, ResetPasswordDto, SharedAuthDto, VerifyOtpDto } from './dto/auth.dto';
import { IUserToken } from './types/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly user: UserRepository,
    private readonly token: TokenRepository,
    private readonly userService: UserService,
    private readonly role: RoleRepository,
    private readonly merchant: MerchantRepository,
    private readonly shared: SharedService,
  ) {}

  public async signin(payload: LoginDto): Promise<ServiceResponse<IUserToken>> {
    const { value, password } = payload;

    const userLookup = buildUserLookupQuery(value);
    const conditions = [userLookup];

    const user = await this.user.findOne({ $or: conditions }, { populate: [{ path: 'role' }] });
    if (!user) throw new NotFoundException('User with this phone number or email does not exist.');
    if (!user.password_changed) {
      await this.userService.createVerificationOtp(user, TokenType.PASSWORD_RESET);

      throw new BadRequestException(
        'Your account requires a password change before sign in. A password reset code has been sent',
      );
    }

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
    const { value } = payload;

    const userLookup = buildUserLookupQuery(value);
    const conditions = [userLookup];

    const user = await this.user.findOne({ $or: conditions });
    if (!user) throw new NotFoundException('User with this phone number or email does not exist.');

    const otp = await this.userService.createVerificationOtp(user, TokenType.PASSWORD_RESET);

    const data = {
      user_id: user._id,
      otp,
    };

    return { data, message: 'OTP sent for Password reset.' };
  }

  public async resetPassword(payload: ResetPasswordDto): Promise<ServiceResponse<IUserToken>> {
    const { newPassword, otp, value } = payload;

    const userLookup = buildUserLookupQuery(value);
    const conditions = [userLookup];

    const user = await this.user.findOne({ $or: conditions });
    if (!user) throw new NotFoundException('User with this phone number or email does not exist.');

    const token = await this.token.findOne({ type: TokenType.PASSWORD_RESET, token: otp });
    if (!token) throw new BadRequestException('Invalid OTP code.');

    if (String(token.user_id) !== String(user._id)) throw new BadRequestException('Invalid user OTP.');
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

  /**
   * Self-serve merchant registration. Creates a `User` (role: merchant) and a
   * linked `Merchant` record together, then dispatches a phone-verification
   * OTP via the same mechanism `forgetPassword` already uses.
   */
  public async register(
    payload: RegisterDto,
  ): Promise<ServiceResponse<{ merchant_id: string; user_id: string; dev_otp?: string }>> {
    const { full_name, business_name, business_type, email, phone, password } = payload;

    const normalizedPhone = formatPhoneWithCode(phone);
    const { code, phone: parsedPhone } = parsePhone(normalizedPhone);

    const existing = await this.user.findOne(buildUserLookupQueryFromPayload({ email, phone, country_code: code }));
    if (existing) throw new ConflictException('An account with this email or phone number already exists.');

    const merchantRole = await this.role.findOne({ name: 'merchant' });
    if (!merchantRole) throw new NotFoundException('Merchant role not found.');

    // bcrypt.hash directly (not the shared hashResource helper, which resolves
    // to bcrypt.hash(password, NaN) while JWT_SALT is unset) — matches the
    // same workaround src/app/user/seeder/data.ts already uses.
    const hash = await bcrypt.hash(password, 10);

    const user = await this.user.create({
      country_code: code,
      phone: parsedPhone,
      email: email.toLowerCase().trim(),
      role_id: merchantRole._id,
      password: hash,
      password_changed: true,
      phone_verified: false,
      email_verified: false,
      status: UserStatus.INACTIVE,
    });

    const merchantId = await this.shared.generateSequentialId('merchant_id', 'MER', 5);

    await this.merchant.create({
      merchant_id: merchantId,
      user_id: user._id,
      created_by: user._id,
      merchant_name: full_name,
      merchant_store_name: business_name,
      business_type,
      merchant_phone: normalizedPhone,
      channel: 'self-serve',
      activated: false,
    });

    let devOtp: string | undefined;
    try {
      const otp = await this.userService.createVerificationOtp(user);
      if (!config.app.isProd) devOtp = otp;
    } catch (error) {
      // Account + merchant are already created — an SMS delivery failure
      // shouldn't fail the whole registration. Log and let the caller use
      // "resend OTP" (forgetPassword-style flows already handle this pattern).
      this.logger.error(`OTP dispatch failed for ${String(user._id)}: ${error.message}`);
    }

    const data = { merchant_id: merchantId, user_id: String(user._id), ...(devOtp ? { dev_otp: devOtp } : {}) };

    return { data, message: 'Account created. Verification code sent.' };
  }

  public async verifyRegistrationOtp(payload: VerifyOtpDto): Promise<ServiceResponse<IUserToken>> {
    const { value, otp } = payload;

    const userLookup = buildUserLookupQuery(value);
    const conditions = [userLookup];

    const user = await this.user.findOne({ $or: conditions });
    if (!user) throw new NotFoundException('User with this phone number or email does not exist.');

    const token = await this.token.findOne({ type: TokenType.PHONE_VERIFICATION, token: otp });
    if (!token) throw new BadRequestException('Invalid OTP code.');

    if (String(token.user_id) !== String(user._id)) throw new BadRequestException('Invalid user OTP.');
    if (token.expires_at < new Date()) throw new BadRequestException('OTP has expired. Please request a new one.');

    await this.user.updateById(user._id, {
      phone_verified: true,
      email_verified: true,
      status: UserStatus.ACTIVE,
    });
    await token.deleteOne();

    const updatedUser = await this.user.findById(user._id);
    const jwt = this.jwt.sign({ ...updatedUser.toJSON() });

    const data = {
      user: updatedUser,
      token: jwt,
    };

    return { data, message: 'Account verified successfully.' };
  }
}
