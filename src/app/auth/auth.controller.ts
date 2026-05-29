import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { User } from '@on/decorators/user.decorator';
import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResetPinDto, SetPinDto, VerifyPhoneDto } from './dto/auth.dto';
import { CompleteRegistrationDto } from './dto/complete-auth.dto';
import { JwtAuthGuard } from './guard/auth.guard';

import type { UserDocument } from '../user/model/user.model';
import type { Response, Request } from 'express';

@ApiTags('Auth')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User Registers',
    description: 'Allows new users to register',
  })
  @ApiOkResponse({ description: 'User successful registration', type: ApiResponseDTO })
  @Post('register')
  async register(@Body() payload: RegisterDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.authService.register(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiOperation({
    summary: 'User Resend Phone Verification',
    description: 'Allows new users to resend phone verification',
  })
  @ApiOkResponse({ description: 'User otp sent', type: ApiResponseDTO })
  @Post('phone/resend')
  async resendOtp(@Body() payload: RegisterDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.authService.resendOtp(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiOperation({
    summary: 'Login User',
    description: 'Allow user to login',
  })
  @ApiOkResponse({ description: 'User successful login', type: ApiResponseDTO })
  @Post('login')
  async signIn(@Body() payload: LoginDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.authService.signin(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiOperation({
    summary: 'Phone OTP Verification',
    description: 'Allow user to verify phone number OTP',
  })
  @ApiOkResponse({ description: 'User successful verification', type: ApiResponseDTO })
  @Post('verify/phone')
  async verifyPhone(@Body() payload: VerifyPhoneDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.authService.verify(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Set PIN',
    description: 'Allow user to set their PIN',
  })
  @ApiOkResponse({ description: 'User pin set successful', type: ApiResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Post('set-pin')
  async setPin(
    @Body() payload: SetPinDto,
    @User() user: UserDocument,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.authService.setPin(user, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiOperation({
    summary: 'User Forget PIN',
    description: 'Allow user to reset their PIN',
  })
  @ApiOkResponse({ description: 'User pin otp sent successful', type: ApiResponseDTO })
  @Post('forget-pin')
  async forgetPin(@Body() payload: RegisterDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.authService.forgetPin(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiOperation({
    summary: 'User Reset their PIN',
    description: 'Allow user to reset their PIN',
  })
  @ApiOkResponse({ description: 'Rest successful', type: ApiResponseDTO })
  @Post('reset-pin')
  async resetPin(@Body() payload: ResetPinDto, @Res() res: Response, @Req() req: Request): Promise<ResponseDTO> {
    try {
      const response = await this.authService.resetPin(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  /**
   * COMPLETE REGISTRATION
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User completes registration',
    description: 'Allow user to complete their registration',
  })
  @ApiOkResponse({ description: 'Registration completed successfully', type: ApiResponseDTO })
  @UseGuards(JwtAuthGuard)
  @Post('register/complete')
  async complete(
    @Body() payload: CompleteRegistrationDto,
    @User() user: UserDocument,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.authService.complete(user, payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
