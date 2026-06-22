import { Injectable } from '@nestjs/common';

import { CallStatus } from '@on/enum';
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
      joins: [],
    });

    const strategies = {
      search: () => this.call.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.call.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'case' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'calls successfully fetched' };
  }

  async findList(query: QueryCallDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const now = new Date();

    const caseFilter = {
      'case.status': 'ACTIVE',
      scheduled_for: { $lte: now },
      status: { $ne: CallStatus.COMPLETED },
    };

    let pipeline: any[] = [];

    if (search) {
      pipeline = joinSearchQuery({
        search,
        fields: [],
        query,
        joins: [{ from: 'cases', localField: 'case_id', foreignField: 'case_id', as: 'case' }],
      });
    } else {
      pipeline = [
        { $lookup: { from: 'cases', localField: 'case_id', foreignField: 'case_id', as: 'case' } },
        { $unwind: '$case' },
      ];
    }

    pipeline.push({ $match: caseFilter });

    const data = await this.call.aggregateAndCount(pipeline, {
      aggregate: { skip, limit },
    });

    return { data, message: 'calls successfully fetched' };
  }
}
