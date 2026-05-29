import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { User } from '@on/decorators/user.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';

import { CreditService } from './credit.service';
import { OfferCreditDto } from './dto/offer.dto';
import { QueryCreditDto } from './dto/query.dto';
import { QueryRepaymentDto, RepaymentDto } from './dto/repay.dto';
import { Credit } from './model/message.model';
import { Repayment } from './model/repayment.model';

import type { UserDocument } from '../user/model/user.model';
import type { Response, Request } from 'express';

@ApiTags('Credit')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/credits')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Offer credit',
    description: 'Allows credit to a customer',
  })
  @ApiOkResponse({ description: 'Offer credits successful ', type: [Credit] })
  @UseGuards(JwtAuthGuard)
  @Post()
  async offerCredit(
    @Body() payload: OfferCreditDto,
    @User() user: UserDocument,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.creditService.offer(user, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get credits',
    description: 'Allows users get credits',
  })
  @ApiOkResponse({ description: 'Get credits successful ', type: [Credit] })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findCredit(@Query() query: QueryCreditDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false });

      const response = await this.creditService.find(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  /**
   * REPAYMENT
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Repay active credit',
    description: 'Allows users to repay credits',
  })
  @ApiOkResponse({ description: 'Repay credits successful ', type: [Credit] })
  @UseGuards(JwtAuthGuard)
  @Post('/:id/repay')
  async repayCredit(
    @Param('id') id: string,
    @Body() payload: RepaymentDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.creditService.repay(id, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get repayments',
    description: 'Allows user get repayments',
  })
  @ApiOkResponse({ description: 'Get repayement successful ', type: [Repayment] })
  @UseGuards(JwtAuthGuard)
  @Get('repayments')
  async findRepayment(
    @Query() query: QueryRepaymentDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query, { convertToRegex: false, dateField: 'date' });

      const response = await this.creditService.findRepayment(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
