import { Injectable } from '@nestjs/common';

import { joinSearchQuery } from '@on/helpers/search';
import { ServiceResponse } from '@on/utils/types';

import { QueryPaymentDto } from './dto/query.dto';
import { PaymentRepository } from './repository/payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly payment: PaymentRepository) {}

  async find(query: QueryPaymentDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [],
    });

    const strategies = {
      search: () => this.payment.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.payment.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'repayments' }, { path: 'customer' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'payments successfully fetched' };
  }
}
