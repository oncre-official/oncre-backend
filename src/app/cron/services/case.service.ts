import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CaseRepository } from '@on/app/case/repository/case.repository';
import { CaseStatus } from '@on/app/case/types/case.interface';

@Injectable()
export class CaseSerice {
  private readonly logger = new Logger(CaseSerice.name);

  constructor(private readonly cases: CaseRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processDay21Cases() {
    this.logger.log('Processing cases that has been active for 21 days');

    const twentyOneDaysAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);

    const cases = await this.cases.find({ status: CaseStatus.ACTIVE, activated_at: { $lte: twentyOneDaysAgo } });

    for (const item of cases) {
      await this.cases.updateOne(
        { case_id: item.case_id },
        {
          status: CaseStatus.PENDING_TRANSITION,
          transition_required: true,
          transition_due_at: new Date(),
        },
      );
    }

    this.logger.log('Processed case successfully');
  }
}
