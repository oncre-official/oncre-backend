import { User } from '@on/app/user/model/user.model';

export interface ISharedAuth {
  phone?: string;
  email?: string;
}

export interface ILogin {
  value: string;
  password: string;
}

export interface IResetPassword extends ISharedAuth {
  otp: string;
  newPassword: string;
}

export interface IUserToken {
  user: User;
  token: string;
}
