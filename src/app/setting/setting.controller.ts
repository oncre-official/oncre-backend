import { Body, Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';

import { QuerySettingDto } from './dto/query.dto';
import { Setting } from './model/setting.model';
import { SettingService } from './setting.service';

import type { Response, Request } from 'express';

@ApiTags('Setting')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get settings',
    description: 'Allows users get settings',
  })
  @ApiOkResponse({ description: 'Get settings successful ', type: [Setting] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findSetting(@Query() query: QuerySettingDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.settingService.find(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
