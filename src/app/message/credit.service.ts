import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { joinSearchQuery, joinSearchQueryNested } from '@on/helpers/search';
import { ServiceResponse } from '@on/utils/types';

import { CustomerRepository } from '../customer/repository/customer.repository';
import { ICustomerCreateNotification } from '../customer/types/customer.interface';
import { CreateUserNotificationDto } from '../notification/dto/user-notification.dto';
import { UserNotificationRepository } from '../notification/repository/user-notification.repository';
import { USER_NOTIFICATION_TYPE } from '../notification/types/notification.interface';
import { User } from '../user/model/user.model';

import { OfferCreditDto } from './dto/offer.dto';
import { QueryCreditDto } from './dto/query.dto';
import { QueryRepaymentDto, RepaymentDto } from './dto/repay.dto';
import { Credit } from './model/message.model';
import { Repayment } from './model/repayment.model';
import { CreditRepository } from './repository/message.repository';
import { RepaymentRepository } from './repository/repayment.repository';
import { CREDIT_STATUS, ICreditNotification } from './types/message.interface';
import { IRepaymentNotification } from './types/repayment.interface';

@Injectable()
export class CreditService {
  constructor(
    private readonly credit: CreditRepository,
    private readonly customer: CustomerRepository,
    private readonly repayment: RepaymentRepository,
    private readonly userNotification: UserNotificationRepository,
  ) {}

  async find(query: QueryCreditDto, skip: number = 0, limit: number = 20): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQuery({
      search,
      fields: [],
      query,
      joins: [
        {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
          searchFields: ['name', 'phone'],
        },
        { from: 'repayments', localField: '_id', foreignField: 'creditId', as: 'repayments', unwind: false },
      ],
    });

    const strategies = {
      search: () => this.credit.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.credit.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'repayments' }, { path: 'customer' }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'credits successfully fetched' };
  }

  async offer(user: User, payload: OfferCreditDto): Promise<ServiceResponse<Credit>> {
    const ownerId = user._id;

    const { phone, name } = payload;

    let isNewCustomer = false;

    let customer = await this.customer.findOne({ ownerId, phone });
    if (!customer) {
      customer = await this.customer.create({ ownerId, name, phone });
      isNewCustomer = true;
    }

    const creditPayload = {
      ownerId,
      customerId: customer._id,
      ...payload,
    };

    const credit = await this.credit.create(creditPayload);

    const notPayload: ICreditNotification = {
      ownerId,
      creditId: credit._id,
      customerId: customer._id,
      name: customer.name,
      phone: customer.phone,
      amount: credit.totalAmount,
    };

    const newCustPayload: ICustomerCreateNotification = {
      ownerId,
      customerId: customer._id,
      name: customer.name,
      phone: customer.phone,
    };

    await this.creditOfferedNotification(notPayload);
    if (isNewCustomer) await this.customerCreatedNotification(newCustPayload);

    return { data: credit, message: `Credit successfully created` };
  }

  /**
   * REPAYMENT
   */
  async repay(id: string, payload: RepaymentDto): Promise<ServiceResponse<Repayment>> {
    const { amount, date } = payload;

    const credit: any = await this.credit.findById(id, { populate: [{ path: 'customer' }] });
    if (!credit) throw new NotFoundException('Credit not found');
    if (credit.status === CREDIT_STATUS.PAID) throw new BadRequestException('Credit already paid');

    const customer = credit?.customer;
    const balance = credit.totalAmount - credit.amountPaid;

    if (amount <= 0) throw new BadRequestException('Invalid repayment amount');
    if (amount > balance) throw new BadRequestException('Amount exceeds balance');

    const repayment = await this.repayment.create({
      creditId: credit._id,
      amount,
      date: date ?? new Date(),
    });

    const newAmountPaid = credit.amountPaid + amount;
    const isFullyPaid = newAmountPaid >= credit.totalAmount;

    await this.credit.updateOne(
      { _id: credit._id },
      {
        $set: {
          amountPaid: newAmountPaid,
          status: newAmountPaid >= credit.totalAmount ? CREDIT_STATUS.PAID : CREDIT_STATUS.ACTIVE,
        },
      },
    );

    const notPayload: IRepaymentNotification = {
      ownerId: credit.ownerId,
      creditId: credit._id,
      customerId: customer._id,
      name: customer.name,
      phone: customer.phone,
      amount,
      totalPaid: newAmountPaid,
      totalAmount: credit.totalAmount,
      isFullyPaid,
    };

    await this.repaymentNotification(notPayload);

    return { data: repayment, message: `Credit successfully repayed` };
  }

  async findRepayment(query: QueryRepaymentDto, skip: number, limit: number): Promise<ServiceResponse<any>> {
    const { search } = query;

    const joinQuery = joinSearchQueryNested({
      search,
      fields: [],
      joins: [
        {
          from: 'credits',
          localField: 'creditId',
          foreignField: '_id',
          as: 'credit',
          unwind: true,
          nestedJoins: [
            {
              from: 'customers',
              localField: 'customerId',
              foreignField: '_id',
              as: 'customer',
              unwind: true,
              searchFields: ['name', 'phone'],
            },
          ],
        },
      ],
    });

    const strategies = {
      search: () => this.repayment.aggregateAndCount(joinQuery, { aggregate: { skip, limit } }),
      normal: () =>
        this.repayment.findAndCount(query, {
          aggregate: { skip, limit },
          populate: [{ path: 'credit', populate: [{ path: 'customer' }] }],
          sort: { createdAt: -1 },
        }),
    };

    const data = search ? await strategies.search() : await strategies.normal();

    return { data, message: 'credits successfully fetched' };
  }

  /**
   * USER NOTIFICATION METHOD
   */
  private async creditOfferedNotification(payload: ICreditNotification): Promise<void> {
    const { ownerId, creditId, customerId, name, amount, phone } = payload;

    const userNotificationPayload: CreateUserNotificationDto = {
      userId: ownerId,
      type: USER_NOTIFICATION_TYPE.CREDIT,
      title: 'Credit Offered',
      body: `You offered a credit of ₦${amount} to ${name} with phone number ${phone}.`,
      route: `/credits/${String(creditId)}`,
      meta: {
        creditId,
        customerId,
        amount,
      },
    };

    await this.userNotification.create(userNotificationPayload);
  }

  /**
   * CREDIT REPAYMENT NOTIFICATION
   */
  private async repaymentNotification(payload: IRepaymentNotification): Promise<void> {
    const { ownerId, creditId, customerId, name, phone, amount, totalPaid, totalAmount, isFullyPaid } = payload;

    const userNotificationPayload: CreateUserNotificationDto = {
      userId: ownerId,
      type: USER_NOTIFICATION_TYPE.REPAYMENT,
      title: isFullyPaid ? 'Credit Fully Repaid' : 'Credit Repayment Received',
      body: isFullyPaid
        ? `${name} (${phone}) has fully repaid their credit. Last payment: ₦${amount}.`
        : `${name} (${phone}) made a repayment of ₦${amount}. Total paid: ₦${totalPaid} of ₦${totalAmount}.`,
      route: `/credits/${String(creditId)}`,
      meta: {
        creditId,
        customerId,
        name,
        phone,
        amount,
        totalPaid,
        totalAmount,
        isFullyPaid,
      },
    };

    await this.userNotification.create(userNotificationPayload);
  }

  private async customerCreatedNotification(payload: ICustomerCreateNotification): Promise<void> {
    const { ownerId, customerId, name, phone } = payload;

    const userNotificationPayload: CreateUserNotificationDto = {
      userId: ownerId,
      type: USER_NOTIFICATION_TYPE.CUSTOMER,
      title: 'New Customer Added',
      body: `You added a new customer ${name} with phone number ${phone}.`,
      route: `/customers/${String(customerId)}`,
      meta: {
        customerId,
        name,
        phone,
      },
    };

    await this.userNotification.create(userNotificationPayload);
  }
}
