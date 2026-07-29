import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CaseRepository } from '@on/app/case/repository/case.repository';
import { MessageService } from '@on/app/case/services/message.service';
import { CaseStatus } from '@on/app/case/types/case.interface';

@Injectable()
export class CaseSerice {
  private readonly logger = new Logger(CaseSerice.name);

  constructor(
    private readonly cases: CaseRepository,
    private readonly message: MessageService,
  ) {}

  /**
   * Advances `current_day`/`escalation_level` (L1-L4) for every active case
   * and fires any escalation SMS due today. Without this, `MessageService#process`
   * only ever ran once — at case creation — so cases were permanently frozen
   * at Day 1/L1 regardless of how much time had actually passed.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processDailyEscalation() {
    this.logger.log('Advancing daily escalation for active cases');

    const cases = await this.cases.find({ status: CaseStatus.ACTIVE });

    for (const caze of cases) {
      try {
        await this.message.process(caze);
      } catch (error) {
        this.logger.error(`Failed to advance escalation for case ${caze.case_id}`, error);
      }
    }

    this.logger.log(`Advanced daily escalation for ${cases.length} case(s)`);
  }

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
