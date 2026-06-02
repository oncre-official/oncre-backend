import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { Roles } from '@on/decorators/roles.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { requestFilter } from '@on/helpers/filter';
import { QueryDto } from '@on/utils/dto/query.dto';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../auth/guard/role.guard';

import { AdminService } from './admin.service';
import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/create-user.dto';

import type { Response, Request } from 'express';

@ApiTags('Admin')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * USER SECTION
   */

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get users',
    description: 'Allow admin get users',
  })
  @ApiOkResponse({ description: 'Get users successful ', type: ApiResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Get('users')
  async findUser(@Query() query: QueryDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const { skip, limit } = query;

      const filter = requestFilter(query);

      const response = await this.adminService.findUser(filter, skip, limit);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create user',
    description: 'Allow admin create users',
  })
  @ApiOkResponse({ description: 'Create user successful ', type: ApiResponseDTO })
  @Roles('admin', 'super-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('user')
  async createUser(
    @Body() payload: AdminCreateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.adminService.createUser(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user',
    description: 'Allow admin update users',
  })
  @ApiOkResponse({ description: 'Update user successful ', type: ApiResponseDTO })
  @Roles('admin', 'super-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() payload: AdminUpdateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.adminService.updateUser(id, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user',
    description: 'Allow admin delete users',
  })
  @ApiOkResponse({ description: 'Delete user successful ', type: ApiResponseDTO })
  @Roles('admin', 'super-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('user/delete/:id')
  async deleteUser(@Param('id') id: string, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.adminService.deleteUser(id);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
