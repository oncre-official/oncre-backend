import { Injectable } from '@nestjs/common';

import { CallRepository } from '@on/app/call/repository/call.repository';
import { SharedService } from '@on/app/shared/shared.service';
import { ActionType } from '@on/enum';
import { addDaysUTC } from '@on/helpers/date';

import { CASE_ESCALATION_MESSAGES } from '../helper/activation';
import { Case } from '../model/case.model';

@Injectable()
export class CallService {
  constructor(
    private readonly call: CallRepository,
    private readonly shared: SharedService,
  ) {}

  async schedule(newCase: Case) {
    const { merchant_id, case_id, debtor_phone, activated_at } = newCase;

    let scheduled = 0;

    for (const tmpl of CASE_ESCALATION_MESSAGES) {
      if (tmpl.action_type !== ActionType.CALL) continue;

      const day = tmpl.day ?? 1;
      const scheduledFor = addDaysUTC(activated_at, day - 1);

      const existing = await this.call.findOne({ case_id, day, call_type: ActionType.CALL });
      if (existing) continue;

      const callId = await this.shared.generateSequentialId('call_id', 'CL', 5);

      await this.call.create({
        case_id,
        call_id: callId,
        merchant_id,
        debtor_phone,
        day,
        call_type: 'case',
        status: 'scheduled',
        scheduled_for: scheduledFor,
      });

      scheduled++;
    }

    return scheduled;
  }
}
