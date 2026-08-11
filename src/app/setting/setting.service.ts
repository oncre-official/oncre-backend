import { Injectable } from '@nestjs/common';

import { joinSearchQuery } from '@on/helpers/search';
import { ServiceResponse } from '@on/utils/types';

import { QuerySettingDto } from './dto/query.dto';
import { SettingRepository } from './repository/setting.repository';

@Injectable()
export class SettingService {
  constructor(private readonly setting: SettingRepository) {}

  async find(query: QuerySettingDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [],
    });

    const strategies = {
      search: () => this.setting.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.setting.findAndCount(query, {
          aggregate: { skip, limit },
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'settings successfully fetched' };
  }
}
