import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { CreateFiLeadDto } from './dto/create-fi-lead.dto';
import { FiLeadService } from './fi-lead.service';

import type { Request, Response } from 'express';

@ApiTags('FI Lead')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/leads')
export class FiLeadController {
  constructor(private readonly fiLeadService: FiLeadService) {}

  @ApiOperation({
    summary: 'Capture a financial institution lead',
    description: 'Public, unauthenticated endpoint for the landing page enterprise lead-gen form',
  })
  @ApiOkResponse({ description: 'Lead captured', type: ApiResponseDTO })
  @Post('fi')
  async create(@Body() payload: CreateFiLeadDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.fiLeadService.create(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
