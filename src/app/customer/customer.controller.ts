import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { Roles } from '@on/decorators/roles.decorator';
import { User } from '@on/decorators/user.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { QueryDto } from '@on/utils/dto/query.dto';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';
import { User as UserDocument } from '../user/model/user.model';

import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/customer.dto';
import { Customer } from './model/customer.model';

import type { Response, Request } from 'express';

@ApiTags('Customer')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get customers',
    description: 'Allows users get customers',
  })
  @ApiOkResponse({ description: 'Get customers successful ', type: [Customer] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findCustomer(@Query() query: QueryDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.customerService.find(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create customer',
    description: 'Allows users create customer',
  })
  @ApiOkResponse({ description: 'Create customer successful ', type: ApiResponseDTO })
  @Roles('admin', 'super-admin', 'sales', 'field-agent')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/')
  async createCustomer(
    @Body() payload: CreateCustomerDto,
    @User() user: UserDocument,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.customerService.create(user, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
