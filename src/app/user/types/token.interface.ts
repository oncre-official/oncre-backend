import { ObjectId } from 'mongodb';

import { TOKEN_TYPE } from '@on/enum';
import { IBaseType } from '@on/utils/types';

export interface IToken extends IBaseType {
  user_id: ObjectId;
  type: TOKEN_TYPE;
  token: string;
  expires_at: Date;
}
