import { Injectable, Logger } from '@nestjs/common';

import { CallLog } from '../model/call-log.model';
import { Call } from '../model/call.model';
import { CallLogRepository } from '../repository/call-log.repository';
import { CallRepository } from '../repository/call.repository';
import { IHandleOutcome } from '../types/index.interface';

type OutcomeHandler = (call: Call, note?: string) => Promise<void>;

@Injectable()
export class OutcomeService {
  private readonly logger = new Logger(OutcomeService.name);

  constructor(
    private readonly call: CallRepository,
    private readonly log: CallLogRepository,
  ) {}

  async handleOutcome(payload: IHandleOutcome): Promise<CallLog> {
    const { call, outcome, note = '' } = payload;

    const handler = this.outcomeHandlers[outcome];
    if (!handler) throw new Error(`No handler for outcome: ${outcome}`);

    await handler(call);

    const callLog = await this.log.create({
      call_id: call.call_id,
      case_id: call.case_id,
      called_at: new Date(),
      outcome,
      note,
    });

    await this.call.updateOne(
      { call_id: call.call_id },
      {
        $set: {
          status: 'completed',
          updated_at: new Date(),
        },
      },
    );

    return callLog;
  }

  /**
   * PRIVATE METHODS
   */

  private readonly outcomeHandlers: Record<string, OutcomeHandler> = {
    NO_ANSWER: async (call) => {
      await this.handleNoAnswer(call);
    },

    PROMISED_TO_PAY: async (caseDoc) => {
      await holdEscalation(caseDoc.case_id, 48);
    },

    PAYMENT_PLAN: async (caseDoc) => {
      await handlePaymentPlan(caseDoc);
    },

    PARTIAL_PAYMENT: async (caseDoc) => {
      await handlePartialPayment(caseDoc.case_id);
    },

    FULL_PAYMENT: async (caseDoc) => {
      await handleFullPayment(caseDoc.case_id);
    },

    CALL_BACK_LATER: async (caseDoc, callDoc) => {
      await scheduleCallback(caseDoc, callDoc);
    },

    REFUSED: async (caseDoc) => {
      await pauseEngine(caseDoc.case_id, 'REFUSED');
    },

    DISPUTED: async (caseDoc) => {
      await handleDispute(caseDoc);
    },

    UNREACHABLE: async (caseDoc, callDoc) => {
      await sendUnreachableSMS(caseDoc, callDoc);
    },

    NUMBER_INVALID: async (caseDoc, callDoc) => {
      await scheduleCallback(caseDoc, callDoc);
      await pauseEngine(caseDoc.case_id, 'Invalid Number');
    },
  };

  /**
   * PRIVATE UTILITY METHOD
   */

  private async handleNoAnswer(call: Call) {}
}
