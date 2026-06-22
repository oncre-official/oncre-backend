import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { Roles } from '@on/decorators/roles.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';

import { CallLogService } from './call-log.service';
import { LogCallDto } from './dto/log.dto';

import type { Response, Request } from 'express';

@ApiTags('Call Log')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/call-logs')
export class CallLogController {
  constructor(private readonly logService: CallLogService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log Call',
    description: 'Allows admin log calls',
  })
  @ApiOkResponse({ description: 'Log call outcomes', type: ApiResponseDTO })
  @Roles('admin', 'super-admin', 'recovery')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/log')
  async logCalls(@Body() payload: LogCallDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.logService.log(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
