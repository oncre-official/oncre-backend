import { Injectable } from '@nestjs/common';

import { joinSearchQuery } from '@on/helpers/search';
import { ServiceResponse } from '@on/utils/types';

import { QueryCaseDto } from './dto/query.dto';
import { CaseRepository } from './repository/case.repository';

@Injectable()
export class CaseService {
  constructor(private readonly cases: CaseRepository) {}

  async find(query: QueryCaseDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [],
    });

    const strategies = {
      search: () => this.cases.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.cases.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'merchant' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'cases successfully fetched' };
  }
}
