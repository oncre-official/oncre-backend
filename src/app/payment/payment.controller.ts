import { Body, Controller, Get, HttpCode, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { Roles } from '@on/decorators/roles.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';

import { CreatePlanDto } from './dto/plan.dto';
import { QueryPaymentDto } from './dto/query.dto';
import { Payment } from './model/payment.model';
import { PaymentService } from './payment.service';

import type { Response, Request } from 'express';

@ApiTags('Payment')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payments',
    description: 'Allows users get payments',
  })
  @ApiOkResponse({ description: 'Get payments successful ', type: [Payment] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findPayment(@Query() query: QueryPaymentDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.paymentService.find(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create payment plan',
    description: 'Allows users create payment plan',
  })
  @ApiOkResponse({ description: 'Create plan successful ', type: ApiResponseDTO })
  @Roles('admin', 'super-admin', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/')
  async createCase(@Body() payload: CreatePlanDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.paymentService.createPlan(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiExcludeEndpoint()
  @Post('callback')
  @HttpCode(200)
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      await this.paymentService.handleWebhook(req);

      return res.status(200).send('success');
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
