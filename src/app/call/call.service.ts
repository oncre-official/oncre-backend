import { Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { CallOutcomeStatus } from '@on/enum';
import { joinSearchQuery } from '@on/helpers/search';
import { ServiceResponse } from '@on/utils/types';

import { LogCallDto } from './dto/log.dto';
import { QueryCallDto } from './dto/query.dto';
import { CallLog } from './model/call-log.model';
import { CallRepository } from './repository/call.repository';
import { OutcomeService } from './service/outcome.service';

@Injectable()
export class CallService {
  constructor(
    private readonly call: CallRepository,
    private readonly outcome: OutcomeService,
  ) {}

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

  async findList(query: QueryCallDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const now = new Date();

    const caseFilter = {
      'case.status': 'ACTIVE',
      scheduled_for: { $lte: now },
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

  async log(payload: LogCallDto): Promise<ServiceResponse<CallLog>> {
    const { call_id, outcome, note } = payload;

    const callId = new ObjectId(String(call_id));

    const call = await this.call.findById(callId, { populate: [{ path: 'case', populate: { path: 'merchant' } }] });
    if (!call) throw new BadRequestException('Call with id not found');

    if (call.status === CallOutcomeStatus.COMPLETED) throw new BadRequestException('Call with id not found');

    const data = await this.outcome.handleOutcome({ call, outcome, note });

    return { data, message: `Merchant successfully created` };
  }
}
