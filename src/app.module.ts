import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { config } from './config';
import { HttpExceptionFilter } from './handlers/exceptions/http-exception.filter';

@Module({
  imports: [MongooseModule.forRoot(config.db.url as string)],
  controllers: [AppController],
  providers: [
    {
      useClass: HttpExceptionFilter,
      provide: APP_FILTER,
    },
  ],
})
export class AppModule {}
