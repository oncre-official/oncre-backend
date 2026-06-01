import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { config } from '@on/config';

import { RoleModule } from '../role/role.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    UserModule,
    RoleModule,
    SharedModule,
    JwtModule.register({
      global: true,
      secret: config.jwt.secret,
      signOptions: { expiresIn: Number(config.jwt.expiresIn) },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
