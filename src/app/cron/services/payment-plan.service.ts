import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CaseRepository } from '@on/app/case/repository/case.repository';
import { MessageRepository } from '@on/app/message/repository/message.repository';
import { buildInstallmentReminderMessage } from '@on/app/payment/helpers/message';
import { PaymentInstallment } from '@on/app/payment/model/payment-installment.model';
import { PaymentService } from '@on/app/payment/payment.service';
import { PaymentInstallmentRepository } from '@on/app/payment/repository/payment-installment.repository';
import { InstallmentPaymentStatus, PaymentGenerationStatus } from '@on/app/payment/types/payment-plan.interface';

@Injectable()
export class PaymentPlanSerice {
  private readonly logger = new Logger(PaymentPlanSerice.name);

  constructor(
    private readonly cases: CaseRepository,
    private readonly message: MessageRepository,
    private readonly paymentService: PaymentService,
    private readonly installment: PaymentInstallmentRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async generateUpcomingPaymentLinks() {
    const now = new Date();

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() + 24);

    const installments = await this.installment.find({
      generation_status: PaymentGenerationStatus.NOT_GENERATED,
      status: InstallmentPaymentStatus.PENDING,
      due_date: { $lte: cutoff, $gte: now },
    });

    this.logger.log(`Found ${installments.length} installments requiring payment links`);

    for (const installment of installments) {
      try {
        await this.processInstallment(installment);
      } catch (error: any) {
        this.logger.error(`Failed processing installment ${installment.installment_id}`, error.stack);
      }
    }
  }

  private async processInstallment(installment: PaymentInstallment) {
    const { case_id } = installment;

    const caseDoc = await this.cases.findOne({ case_id });
    if (!caseDoc) throw new NotFoundException(`Case not found: ${case_id}`);

    const payment = await this.paymentService.createPaymentLink(caseDoc, installment.amount);

    await this.installment.updateOne(
      {
        installment_id: installment.installment_id,
      },
      {
        $set: {
          payment_url: payment.paymentUrl,
          reference: payment.reference,
          generation_status: PaymentGenerationStatus.GENERATED,
        },
      },
    );

    const body = buildInstallmentReminderMessage(installment);

    await this.message.updateOne(
      {
        case_id: installment.case_id,
        message_type: 'payment_plan',
        payment_link_generated: false,
        scheduled_for: installment.due_date,
      },
      {
        $set: {
          message_body: body,
          payment_link_generated: true,
        },
      },
    );
  }
}
