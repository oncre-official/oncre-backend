import { Injectable } from '@nestjs/common';

import { joinSearchQuery } from '@on/helpers/search';
import { ServiceResponse } from '@on/utils/types';

import { QueryCreditDto } from './dto/query.dto';
import { CreditRepository } from './repository/credit.repository';

@Injectable()
export class CreditService {
  constructor(private readonly credit: CreditRepository) {}

  async find(query: QueryCreditDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [
        {
          from: 'merchants',
          localField: 'merchant_id',
          foreignField: 'merchant_id',
          as: 'merchant',
          searchFields: ['customer_name', 'customer_phone'],
        },
      ],
    });

    const strategies = {
      search: () => this.credit.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.credit.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'merchant' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'credits successfully fetched' };
  }
}
