import { Injectable } from '@nestjs/common';

import { joinSearchQuery } from '@on/helpers/search';
import { ServiceResponse } from '@on/utils/types';

import { QueryCallDto } from './dto/query.dto';
import { CallRepository } from './repository/call.repository';

@Injectable()
export class CallService {
  constructor(private readonly call: CallRepository) {}

  async find(query: QueryCallDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [
        {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
          searchFields: ['name', 'phone'],
        },
        { from: 'repayments', localField: '_id', foreignField: 'callId', as: 'repayments', unwind: false },
      ],
    });

    const strategies = {
      search: () => this.call.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.call.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'repayments' }, { path: 'customer' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'calls successfully fetched' };
  }
}
