import { Body, Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';

import { CaseService } from './case.service';
import { QueryCaseDto } from './dto/query.dto';
import { Case } from './model/case.model';

import type { Response, Request } from 'express';

@ApiTags('Case')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/cases')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get cases',
    description: 'Allows users get cases',
  })
  @ApiOkResponse({ description: 'Get cases successful ', type: [Case] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findCase(@Query() query: QueryCaseDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.caseService.find(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
