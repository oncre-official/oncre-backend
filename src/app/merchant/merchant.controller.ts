import { Body, Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { QueryDto } from '@on/utils/dto/query.dto';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';

import { MerchantService } from './merchant.service';
import { Merchant } from './model/merchant.model';

import type { Response, Request } from 'express';

@ApiTags('Merchant')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get merchants',
    description: 'Allows users get merchants',
  })
  @ApiOkResponse({ description: 'Get merchants successful ', type: [Merchant] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findMerchant(@Query() query: QueryDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.merchantService.find(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
