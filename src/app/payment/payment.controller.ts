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
import { User } from '@on/decorators/user.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';

import { InitiateActivationDto, RemittanceDto, VerifyActivationDto } from './dto/activation.dto';
import { CreatePlanDto } from './dto/plan.dto';
import { QueryPaymentDto, QueryPaymentPlanDto } from './dto/query.dto';
import { Payment } from './model/payment.model';
import { PaymentService } from './payment.service';

import type { UserDocument } from '../user/model/user.model';
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
  @Roles('admin', 'super-admin', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
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
    summary: 'Get payment installments plan',
    description: 'Allows users get payment installment plan',
  })
  @ApiOkResponse({ description: 'Get payments installment plan successful ', type: [Payment] })
  @Roles('admin', 'super-admin', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('plans')
  async findPaymentPlan(
    @Query() query: QueryPaymentPlanDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.paymentService.findPlan(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get installments for a case',
    description: 'Allows users get payment-plan installments (paid/pending/overdue) for a single case',
  })
  @ApiOkResponse({ description: 'Get installments successful', type: ApiResponseDTO })
  @Roles('admin', 'super-admin', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('installments')
  async findInstallments(
    @Query('case_id') caseId: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.paymentService.listInstallments(caseId);

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
  async createPlan(@Body() payload: CreatePlanDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.paymentService.createPlan(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remit payment',
    description: 'Remit a completed payment',
  })
  @ApiOkResponse({ description: 'Remittance created successfully' })
  @Roles('admin', 'super-admin', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/remit')
  async remit(@Body() payload: RemittanceDto, @Res() res: Response, @Req() req: Request) {
    try {
      const response = await this.paymentService.remit(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiate merchant activation payment',
    description: 'Starts a real Paystack checkout for the ₦5,000 merchant activation fee',
  })
  @ApiOkResponse({ description: 'Activation payment initiated', type: ApiResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Post('activation/initiate')
  async initiateActivation(
    @User() user: UserDocument,
    @Body() payload: InitiateActivationDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.paymentService.initiateActivation(user, payload.callback_url);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify merchant activation payment',
    description: 'Synchronously checks a Paystack transaction and activates the merchant on success',
  })
  @ApiOkResponse({ description: 'Activation payment verified', type: ApiResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Post('activation/verify')
  async verifyActivation(
    @User() user: UserDocument,
    @Body() payload: VerifyActivationDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.paymentService.verifyActivation(user, payload.reference);

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
