import { ObjectId } from 'mongodb';

import { TokenType } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IToken extends IBaseType {
  user_id: ObjectId;
  type: TokenType;
  token: string;
  expires_at: Date;
}
