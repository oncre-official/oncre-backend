import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FiLeadController } from './fi-lead.controller';
import { FiLeadService } from './fi-lead.service';
import { FiLead, FiLeadSchema } from './model/fi-lead.model';
import { FiLeadRepository } from './repository/fi-lead.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: FiLead.name, schema: FiLeadSchema }])],
  controllers: [FiLeadController],
  providers: [FiLeadService, FiLeadRepository],
  exports: [FiLeadRepository, FiLeadService],
})
export class FiLeadModule {}
