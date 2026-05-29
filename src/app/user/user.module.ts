import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TermiiService } from '@on/services/termii/service';

import { Token, TokenSchema } from './model/token.model';
import { User, UserSchema } from './model/user.model';
import { TokenRepository } from './repository/token.repository';
import { UserRepository } from './repository/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserRepository, TokenRepository, UserService, TermiiService],
  exports: [UserRepository, TokenRepository, UserService],
})
export class UserModule {}
