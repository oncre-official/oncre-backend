import { BadRequestException, Injectable } from '@nestjs/common';

import { ServiceResponse } from '@on/utils/types';

import { CreateFiLeadDto } from './dto/create-fi-lead.dto';
import { FiLead } from './model/fi-lead.model';
import { FiLeadRepository } from './repository/fi-lead.repository';
import { FiLeadStatus } from './types/fi-lead.interface';

const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];

@Injectable()
export class FiLeadService {
  constructor(private readonly fiLead: FiLeadRepository) {}

  async create(payload: CreateFiLeadDto): Promise<ServiceResponse<FiLead>> {
    const work_email = payload.work_email.trim().toLowerCase();
    const domain = work_email.split('@')[1];

    if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
      throw new BadRequestException('Please use your institutional email address.');
    }

    const lead = await this.fiLead.create({
      ...payload,
      work_email,
      full_name: payload.full_name.trim(),
      institution_name: payload.institution_name.trim(),
      status: FiLeadStatus.NEW,
      bot_suspected: payload.bot_suspected ?? false,
    });

    return { data: lead, message: 'Lead captured successfully' };
  }
}
