import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { Roles } from '@on/decorators/roles.decorator';
import { User } from '@on/decorators/user.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { QueryRemittanceOverviewDto } from '../payment/dto/remittance.dto';
import { User as UserDocument } from '../user/model/user.model';

import { DashboardService } from './dashboard.service';

import type { Response, Request } from 'express';

@ApiTags('Dashboard')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get dashboard summary',
    description:
      'Returns KPI counts for all staff roles; payment_pipeline/upcoming_payments are only computed (and only present) for admin/super-admin.',
  })
  @ApiOkResponse({ description: 'Get dashboard summary successful', type: ApiResponseDTO })
  @Roles('admin', 'super-admin', 'sales', 'field-agent', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('/summary')
  async summary(@User() user: UserDocument, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.dashboardService.summary(user);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  /**
   * REMITTANCE OVERVIEW
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get remittance overview',
    description: 'Returns aggregated remittance totals and status breakdown',
  })
  @ApiOkResponse({ description: 'Remittance overview retrieved successfully', type: ApiResponseDTO })
  @Roles('admin', 'super-admin', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('/remittance/overview')
  async remittanceOverview(@Query() query: QueryRemittanceOverviewDto, @Res() res: Response, @Req() req: Request) {
    try {
      const response = await this.dashboardService.remittanceOverview(query);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
