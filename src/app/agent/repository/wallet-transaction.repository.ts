import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { WalletTransaction, WalletTransactionDocument } from '../model/wallet-transaction.model';

export class WalletTransactionRepository extends BaseRepository<WalletTransactionDocument> {
  constructor(@InjectModel(WalletTransaction.name) private walletTransactionModel: Model<WalletTransactionDocument>) {
    super(walletTransactionModel);
  }
}
