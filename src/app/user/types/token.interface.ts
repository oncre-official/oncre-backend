import { ObjectId } from 'mongodb';

import { TOKEN_TYPE } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IToken extends IBaseType {
  userId: ObjectId;
  type: TOKEN_TYPE;
  token: string;
  expiresAt: Date;
}
