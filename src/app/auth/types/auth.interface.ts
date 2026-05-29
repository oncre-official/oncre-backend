import { ObjectId } from 'mongodb';

import { User } from '@on/app/user/model/user.model';

export interface IRegister {
  phone: string;
}

export interface ILogin extends IRegister {
  pin: string;
}

export interface IVerifyPhone extends IRegister {
  otp: string;
}

export interface ISetPin {
  pin: string;
}

export interface IResetPin extends IRegister {
  pin: string;
  otp: string;
}

export interface IRegisterResponse {
  userId: ObjectId;
  phone: string;
  otp: string;
}

export interface IVerifyPhoneResponse {
  user: User;
  token: string;
  isLoggedIn: boolean;
}

export interface ICompleteRegistration {
  businessName: string;
  businessType: string;
  address: string;
  stateId: ObjectId;
  lgaId: ObjectId;
}
