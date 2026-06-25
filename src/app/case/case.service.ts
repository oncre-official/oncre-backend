import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { joinSearchQuery } from '@on/helpers/search';
import { ServiceResponse } from '@on/utils/types';

import { CustomerRepository } from '../customer/repository/customer.repository';
import { ICreateCustomer } from '../customer/types/customer.interface';
import { MerchantRepository } from '../merchant/repository/merchant.repository';
import { SharedService } from '../shared/shared.service';
import { User } from '../user/model/user.model';

import { CreateCaseDto } from './dto/case.dto';
import { QueryCaseDto } from './dto/query.dto';
import { Case } from './model/case.model';
import { Dispute } from './model/dispute.model';
import { CaseRepository } from './repository/case.repository';
import { DisputeRepository } from './repository/dispute.repository';
import { CallService } from './services/call.service';
import { MessageService } from './services/message.service';
import { CaseStatus } from './types/case.interface';
import { DisputeStatus } from './types/dispute.interface';

@Injectable()
export class CaseService {
  constructor(
    private readonly call: CallService,
    private readonly cases: CaseRepository,
    private readonly shared: SharedService,
    private readonly message: MessageService,
    private readonly dispute: DisputeRepository,
    private readonly customer: CustomerRepository,
    private readonly merchant: MerchantRepository,
  ) {}

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
          populate: [{ path: 'merchant' }, { path: 'dispute', match: { status: DisputeStatus.OPEN } }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'cases successfully fetched' };
  }

  async create(creator: User, payload: CreateCaseDto): Promise<ServiceResponse<Case>> {
    const { merchant_name, merchant_phone, debtor_phone, debtor_name, debtor_address, amount, due_date } = payload;

    const creatorId = new ObjectId(String(creator._id));
    const merchant = await this.merchant.findOrCreate({ merchant_name, merchant_phone, created_by: creatorId });

    const cusPayload: ICreateCustomer = {
      customer_key: debtor_phone,
      customer_phone: debtor_phone,
      customer_name: debtor_name,
      customer_address: debtor_address,
      created_by: creatorId,
    };

    await this.customer.find(cusPayload);

    const caseQuery = {
      merchant_id: merchant?._id,
      debtor_phone,
      amount: Number(amount),
      due_date: new Date(due_date),
      status: 'ACTIVE',
    };

    const caseExist = await this.cases.findOne(caseQuery);
    if (caseExist) throw new BadRequestException('A recovery case already active for debtor and merchant');

    const caseId = await this.shared.generateSequentialId('case_id', 'CA', 5);

    const data = await this.cases.create({
      case_id: caseId,
      merchant_id: merchant?._id,
      escalation_level: 1,
      current_day: 0,
      status: 'ACTIVE',
      is_paused: false,
      activated_at: new Date(),
      ...payload,
    });

    await Promise.all([
      this.message.sendActivation(data),
      this.message.schedule(data),
      this.call.schedule(data),
      this.message.process(data),
    ]);

    return { data, message: `Merchant successfully created` };
  }

  async resolveDispute(creator: User, disputeId: string): Promise<ServiceResponse<Dispute>> {
    const dispute = await this.dispute.findById(disputeId, { populate: [{ path: 'case' }] });
    if (!dispute) throw new NotFoundException('Dispute Not found');

    if (dispute.status !== DisputeStatus.OPEN) throw new BadRequestException('Dispute already processed');

    await this.cases.updateOne(
      { case_id: dispute.case_id },
      {
        status: CaseStatus.ACTIVE,
        is_paused: false,
        pause_reason: null,
      },
    );

    await this.dispute.updateOne(
      { _id: disputeId },
      {
        status: DisputeStatus.RESOLVED,
        resolved_by: creator?._id,
        resolved_at: new Date(),
      },
    );

    return { data: dispute, message: `Dispute Resolve successfully` };
  }

  async escalateDispute(creator: User, disputeId: string): Promise<ServiceResponse<Dispute>> {
    const dispute = await this.dispute.findById(disputeId, { populate: [{ path: 'case' }] });
    if (!dispute) throw new NotFoundException('Dispute Not found');

    if (dispute.status !== DisputeStatus.OPEN) throw new BadRequestException('Dispute already processed');

    await this.cases.updateOne(
      { case_id: dispute.case_id },
      {
        status: 'LEGAL',
        is_paused: true,
        pause_reason: 'Escalated to Legal',
      },
    );

    await this.dispute.updateOne(
      { _id: disputeId },
      {
        status: DisputeStatus.ESCALATED,
        escalated_by: creator?._id,
        escalated_at: new Date(),
      },
    );

    return { data: dispute, message: `Dispute Escalated successfully` };
  }
}
