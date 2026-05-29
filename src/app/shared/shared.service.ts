import { Injectable } from '@nestjs/common';

import { ServiceResponse } from '@on/utils/types';

import { LgaQueryDto, StateQueryDto } from './dto/state-local.dto';
import { Lga } from './model/local-govt.model';
import { State } from './model/state.model';
import { LgaRepository } from './repository/local-govt.repository';
import { StateRepository } from './repository/state.repository';

@Injectable()
export class SharedService {
  constructor(
    private readonly lga: LgaRepository,
    private readonly state: StateRepository,
  ) {}

  async findState(query: StateQueryDto): Promise<ServiceResponse<State[]>> {
    const data = await this.state.find(query);

    return { data, message: `State successfully fetched` };
  }

  async findLga(query: LgaQueryDto): Promise<ServiceResponse<Lga[]>> {
    const data = await this.lga.find(query, {
      populate: [{ path: 'state', select: ['name', 'alias'] }],
    });

    return { data, message: `Lga successfully fetched` };
  }
}
