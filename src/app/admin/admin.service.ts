import { Injectable } from '@nestjs/common';

import { QueryDto } from '@on/utils/dto/query.dto';
import { ServiceResponse } from '@on/utils/types';

import { UserRepository } from '../user/repository/user.repository';

@Injectable()
export class AdminService {
  constructor(private readonly user: UserRepository) {}

  async findUser(query: QueryDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const data = await this.user.findAndCount(query, {
      aggregate: { skip, limit },
      populate: [{ path: 'roles' }],
      sort: { createdAt: -1 },
    });

    return { data, message: `User successfully fetched` };
  }
}
