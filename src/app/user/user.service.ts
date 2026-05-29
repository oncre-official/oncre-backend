import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

import { TokenType } from '@on/enum';
import { getRandomNumber, normalizePhoneNumber } from '@on/helpers';
import { compareResource, hashResource } from '@on/helpers/password';
import { TermiiService } from '@on/services/termii/service';
import { ServiceResponse } from '@on/utils/types';

import { ChangePinDto } from './dto/pin.dto';
import { UserDto } from './dto/user.dto';
import { User } from './model/user.model';
import { TokenRepository } from './repository/token.repository';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly user: UserRepository,
    private readonly termii: TermiiService,
    private readonly token: TokenRepository,
  ) {}

  public async profile(userDoc: User): Promise<ServiceResponse<User>> {
    const { _id } = userDoc;

    const options = {
      populate: [{ path: 'role', populate: { path: 'permissions' } }],
    };

    const user = await this.user.findById(_id, options);

    return { data: user, message: 'Profile fetched successfully.' };
  }

  public async update(userDoc: User, payload: UserDto): Promise<ServiceResponse<null>> {
    const { _id } = userDoc;
    const { phone, ...others } = payload;

    const user = await this.user.findById(_id);

    const updatePayload: any = { ...others };
    let phoneChanged = false;

    if (phone && phone !== user.phone) {
      const existing = await this.user.findOne({ phone, _id: { $ne: _id } });
      if (existing && existing.phoneVerified)
        throw new ConflictException('User with this phone number already exists.');

      updatePayload.phone = phone;
      updatePayload.phoneVerified = false;
      phoneChanged = true;
    }

    await this.user.updateById(_id, updatePayload);

    if (phoneChanged) {
      const updatedUser = await this.user.findById(_id);
      await this.createVerificationOtp(updatedUser);
    }

    return {
      data: null,
      message: phoneChanged ? 'Profile updated. OTP sent for verification.' : 'Profile updated successfully.',
    };
  }

  public async updatePin(userDoc: User, payload: ChangePinDto): Promise<ServiceResponse<User>> {
    const { _id } = userDoc;

    const { oldPin, newPin } = payload;

    const user = await this.user.findById(_id);

    const isEqual = await compareResource(oldPin, user.pin);
    if (!isEqual) throw new BadRequestException('Old pin incorrect');

    const hashPin = await hashResource(newPin);

    await this.user.updateById(userDoc._id, { pin: hashPin });

    return { data: user, message: 'User pin change successfully.' };
  }

  /**
   * UTILITY METHOD
   **/

  public async createVerificationOtp(user: User, type: TokenType = TokenType.PHONE_VERIFICATION) {
    const otpCode = getRandomNumber();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.token.deleteMany({ userId: user._id, type });

    const token = String(otpCode);

    await this.token.create({
      userId: user._id,
      token,
      type,
      expiresAt,
    });

    const message = `Your otp code is ${token} valid for 10 minutes`;
    const to = normalizePhoneNumber(user.phone);

    await this.termii.sendMessage(to, message);

    return token;
  }
}
