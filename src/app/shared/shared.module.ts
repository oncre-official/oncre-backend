import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Lga, LgaSchema } from './model/local-govt.model';
import { State, StateSchema } from './model/state.model';
import { LgaRepository } from './repository/local-govt.repository';
import { StateRepository } from './repository/state.repository';
import { SharedController } from './shared.controller';
import { SharedService } from './shared.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: State.name, schema: StateSchema },
      { name: Lga.name, schema: LgaSchema },
    ]),
  ],
  controllers: [SharedController],
  providers: [StateRepository, LgaRepository, SharedService],
  exports: [StateRepository, LgaRepository, SharedService],
})
export class SharedModule {}
