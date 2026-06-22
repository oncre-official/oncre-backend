import { Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { CallStatus } from '@on/enum';
import { ServiceResponse } from '@on/utils/types';

import { CallRepository } from '../call/repository/call.repository';

import { LogCallDto } from './dto/log.dto';
import { CallLog } from './model/call-log.model';
import { OutcomeService } from './service/outcome.service';

@Injectable()
export class CallLogService {
  constructor(
    private readonly call: CallRepository,
    private readonly outcome: OutcomeService,
  ) {}

  async log(payload: LogCallDto): Promise<ServiceResponse<CallLog>> {
    const { call_id, outcome, note } = payload;

    const callId = new ObjectId(String(call_id));

    const call = await this.call.findById(callId, { populate: [{ path: 'case', populate: { path: 'merchant' } }] });
    if (!call) throw new BadRequestException('Call with id not found');

    if (call.status === CallStatus.COMPLETED) throw new BadRequestException('Call has already been logged');

    const data = await this.outcome.handleOutcome({ call, outcome, note });

    return { data, message: `Call logged successfully` };
  }
}
