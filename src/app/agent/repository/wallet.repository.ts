import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Wallet, WalletDocument } from '../model/wallet.model';

export class WalletRepository extends BaseRepository<WalletDocument> {
  constructor(@InjectModel(Wallet.name) private walletModel: Model<WalletDocument>) {
    super(walletModel);
  }
}
