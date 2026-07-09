import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { ErrorResponse, JsonResponse } from '@on/handlers/responses';
import { ApiResponseDTO } from '@on/utils/dto/response.dto';
import { ResponseDTO } from '@on/utils/types';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResetPasswordDto, SharedAuthDto, VerifyOtpDto } from './dto/auth.dto';

import type { Response, Request } from 'express';

@ApiTags('Auth')
@ApiUnprocessableEntityResponse({ description: 'Error occurred', type: ApiResponseDTO })
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    summary: 'User Forget Password',
    description: 'Allow user to reset their password by sending an OTP to their phone number or email address',
  })
  @ApiOkResponse({ description: 'User password otp sent successful', type: ApiResponseDTO })
  @Post('forget-password')
  async forgetPassword(
    @Body() payload: SharedAuthDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.authService.forgetPassword(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiOperation({
    summary: 'User Reset their Password',
    description: 'Allow user to reset their password using the OTP received on their phone number or email address',
  })
  @ApiOkResponse({ description: 'Reset successful', type: ApiResponseDTO })
  @Post('reset-password')
  async resetPassword(
    @Body() payload: ResetPasswordDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.authService.resetPassword(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }

  @ApiOperation({
    summary: 'Register a merchant',
    description:
      'Self-serve merchant registration — creates a User and a linked Merchant, dispatches a phone-verification OTP',
  })
  @ApiOkResponse({ description: 'Account created, verification code sent', type: ApiResponseDTO })
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
    summary: 'Verify registration OTP',
    description: 'Confirms the phone-verification OTP sent at registration and logs the merchant in',
  })
  @ApiOkResponse({ description: 'Account verified successfully', type: ApiResponseDTO })
  @Post('verify-registration-otp')
  async verifyRegistrationOtp(
    @Body() payload: VerifyOtpDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<ResponseDTO> {
    try {
      const response = await this.authService.verifyRegistrationOtp(payload);

      return JsonResponse(res, response);
    } catch (error) {
      return ErrorResponse(res, error, req);
    }
  }
}
