import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { Roles } from '@on/decorators/roles.decorator';
import { User } from '@on/decorators/user.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { User as UserDocument } from '../user/model/user.model';

import { CaseService } from './case.service';
import { CreateCaseDto } from './dto/case.dto';
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

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create case',
    description: 'Allows users create case',
  })
  @ApiOkResponse({ description: 'Create case successful ', type: ApiResponseDTO })
  @Roles('admin', 'super-admin', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/')
  async createCase(
    @Body() payload: CreateCaseDto,
    @User() user: UserDocument,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.caseService.create(user, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
