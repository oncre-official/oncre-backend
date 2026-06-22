import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Call } from '@on/app/call/model/call.model';
import { CallRepository } from '@on/app/call/repository/call.repository';
import { isCaseOnHold } from '@on/app/case/helper/indexx';
import { MessageRepository } from '@on/app/message/repository/message.repository';
import { TrancheType } from '@on/app/payment/dto/plan.dto';
import { PaymentService } from '@on/app/payment/payment.service';
import { SharedService } from '@on/app/shared/shared.service';
import { normalizePhone } from '@on/helpers/phone';
import { TermiiService } from '@on/services/termii/service';

import { buildMissedCallMessage } from '../helpers/missed';
import { CallLog } from '../model/call-log.model';
import { CallLogRepository } from '../repository/call-log.repository';
import { IHandleOutcome } from '../types/index.interface';

type OutcomeHandler = (call: Call, note?: string) => Promise<void>;

@Injectable()
export class OutcomeService {
  private readonly logger = new Logger(OutcomeService.name);

  constructor(
    private readonly call: CallRepository,
    private readonly shared: SharedService,
    private readonly termii: TermiiService,
    private readonly log: CallLogRepository,
    private readonly payment: PaymentService,
    private readonly message: MessageRepository,
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

    this.logger.log('Outcome handled successfully');

    return callLog;
  }

  /**
   * PRIVATE METHODS
   */

  private readonly outcomeHandlers: Record<string, OutcomeHandler> = {
    NO_ANSWER: async (call) => {
      await this.handleNoAnswer(call);
    },

    PROMISED_TO_PAY: async (call) => {
      await this.holdEscalation(call, 48);
    },

    PAYMENT_PLAN: async (call) => {
      await this.handlePaymentPlan(call);
    },

    PARTIAL_PAYMENT: async (call) => {
      await this.handlePartialPayment(call);
    },

    FULL_PAYMENT: async (call) => {
      await this.handleFullPayment(call);
    },

    CALL_BACK_LATER: async (call) => {
      await this.scheduleCallback(call);
    },

    REFUSED: async (call) => {
      await this.pauseEngine(call, 'REFUSED');
    },

    DISPUTED: async (call) => {
      await this.handleDispute(call);

      await this.pauseEngine(call, 'Case Disputed');
    },

    UNREACHABLE: async (call) => {
      await this.sendUnreachableSMS(call);
    },

    NUMBER_INVALID: async (call) => {
      await this.scheduleCallback(call);

      await this.pauseEngine(call, 'Invalid Number');
    },
  };

  /**
   * PRIVATE UTILITY METHOD
   */

  private async handleNoAnswer(call: Call) {
    if (isCaseOnHold(call.case)) return;

    const { debtor_phone, case_id, merchant_id } = call.case;

    const phone = normalizePhone(debtor_phone);
    const messageBody = buildMissedCallMessage(call);

    const result = await this.termii.sendSMS(phone, messageBody);

    await this.message.create({
      case_id,
      merchant_id,
      debtor_phone,
      message_type: 'missed_call',
      message_index: call.day || 0,
      action_type: 'sms',
      message_body: messageBody,
      scheduled_for: new Date(),
      delivery_status: result.success ? 'sent' : 'failed',
      message_tier: null,
      sent_at: new Date(),
      termii_message_id: result?.message_id ?? null,
      error_details: result.success ? null : (result.error ?? 'Failed to send'),
      cancelled_reason: null,
      credit_id: '',
      customer_key: 'debtor',
      customer_phone: phone,
    });
  }

  private async holdEscalation(call: Call, hours: number) {
    const holdUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

    if (!call.case) await call.populate('case');
    if (!call.case) throw new NotFoundException(`Case not found for call ${call.call_id}`);

    await call.case.updateOne({ hold: true, hold_until: holdUntil });
  }

  private async handlePaymentPlan(call: Call) {
    const { case_id } = call;

    const planPayload = {
      case_id,
      type: TrancheType.Week,
      value: 4,
    };

    await this.payment.createPlan(planPayload);
  }

  private async handlePartialPayment(call: Call) {
    if (!call.case) await call.populate('case');
    if (!call.case) throw new NotFoundException(`Case not found for call ${call.call_id}`);

    await call.case.updateOne({ status: 'CLOSURE_REVIEW' });
  }

  private async handleFullPayment(call: Call) {
    const { case_id } = call;

    if (!call.case) await call.populate('case');
    if (!call.case) throw new NotFoundException(`Case not found for call ${call.call_id}`);

    await call.case.updateOne({
      status: 'COMPLETED',
      recovery_mode: 'ESCALATION',
      is_paused: true,
      completed_at: new Date(),
    });

    await this.message.updateMany(
      {
        case_id,
        delivery_status: 'scheduled',
      },
      {
        $set: {
          delivery_status: 'cancelled',
          cancelled_reason: 'Payment completed',
          updated_at: new Date(),
        },
      },
    );
  }

  private async scheduleCallback(call: Call) {
    const { merchant_id, case_id, debtor_phone } = call.case;

    const now = new Date();

    const nextCallDate = new Date();
    nextCallDate.setDate(now.getDate() + 1);

    const callId = await this.shared.generateSequentialId('call_id', 'CL', 5);

    await this.call.create({
      case_id,
      call_id: callId,
      merchant_id,
      debtor_phone,
      day: (call.day || 0) + 1,
      call_type: 'case',
      status: 'scheduled',
      scheduled_for: nextCallDate,
    });
  }

  private async pauseEngine(call: Call, reason: string) {
    if (!call.case) await call.populate('case');
    if (!call.case) throw new NotFoundException(`Case not found for call ${call.call_id}`);

    await call.case.updateOne({
      is_paused: true,
      pause_reason: reason,
    });
  }

  private async handleDispute(call: Call) {
    if (!call.case) await call.populate('case');
    if (!call.case) throw new NotFoundException(`Case not found for call ${call.call_id}`);

    await call.case.updateOne({
      status: 'DISPUTED',
      is_paused: true,
    });
  }

  private async sendUnreachableSMS(call: Call) {
    const { debtor_phone } = call.case;

    const phone = normalizePhone(debtor_phone);

    const message = 'We were unable to reach you. We will try again shortly.';

    await this.termii.sendSMS(phone, message);
  }
}
