import { Injectable } from '@nestjs/common';

import { joinSearchQuery } from '@on/helpers/search';
import { QueryDto } from '@on/utils/dto/query.dto';
import { ServiceResponse } from '@on/utils/types';

import { CustomerRepository } from './repository/customer.repository';

@Injectable()
export class CustomerService {
  constructor(private readonly customer: CustomerRepository) {}

  async find(query: QueryDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [
        {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
          searchFields: ['email', 'phone'],
        },
      ],
    });

    const strategies = {
      search: () => this.customer.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.customer.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'user' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'Customers successfully fetched' };
  }
}
