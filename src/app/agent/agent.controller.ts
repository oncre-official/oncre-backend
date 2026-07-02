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

import { AgentService } from './agent.service';
import { ActivationPaymentDto, ConfirmActivationPaymentDto } from './dto/activation.dto';
import { CommissionPayoutDto } from './dto/payout.dto';
import { QueryAgentDto, QueryCommissionDto } from './dto/query.dto';

import type { UserDocument } from '../user/model/user.model';
import type { Response, Request } from 'express';

@ApiTags('Agent')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Agents',
    description: 'Allows users get agents',
  })
  @ApiOkResponse({ description: 'Get agents successful ', type: ApiResponseDTO })
  @Roles('admin', 'super-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  async findAgents(@Query() query: QueryAgentDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.agentService.find(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Agent commission payout',
    description: 'Allows admin get agent commission payouts',
  })
  @ApiOkResponse({ description: 'Get agent commission payouts successful ', type: ApiResponseDTO })
  @Roles('admin', 'super-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('/commission/summary')
  async findCommissionPayouts(
    @Query() query: QueryCommissionDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.agentService.commissionSummary(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload merchant activation payment',
    description: 'Allows an agent upload activation payment receipt for a merchant',
  })
  @ApiOkResponse({ description: 'Merchant payment uploaded successfully', type: ApiResponseDTO })
  @Roles('admin', 'super-admin', 'sales', 'field-agent')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/activation-fee')
  async uploadActivation(
    @Body() payload: ActivationPaymentDto,
    @User() user: UserDocument,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.agentService.activationFee(user, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirm merchant activation payment',
    description: 'Allows admin confirm or reject merchant activation payment',
  })
  @ApiOkResponse({ description: 'Merchant payment confirmation successful', type: ApiResponseDTO })
  @Roles('admin', 'super-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/activation-fee/confirm')
  async confirmActivation(
    @Body() payload: ConfirmActivationPaymentDto,
    @User() user: UserDocument,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.agentService.confirmActivation(user, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log commission payout',
    description: 'Allows admin record a commission payout made to an agent',
  })
  @ApiOkResponse({ description: 'Commission payout logged successfully', type: ApiResponseDTO })
  @Roles('admin', 'super-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/commission-payout')
  async commissionPayout(
    @Body() payload: CommissionPayoutDto,
    @User() user: UserDocument,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.agentService.commissionPayout(user, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
