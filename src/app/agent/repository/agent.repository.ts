import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '@on/repository/base.repository';

import { Agent, AgentDocument } from '../model/agent.model';

export class AgentRepository extends BaseRepository<AgentDocument> {
  constructor(@InjectModel(Agent.name) private agentModel: Model<AgentDocument>) {
    super(agentModel);
  }
}
