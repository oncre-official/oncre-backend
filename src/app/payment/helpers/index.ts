import { TrancheType } from '../dto/plan.dto';

/** Number of installments a plan should be split into — `value` weekly payments, or `value` monthly payments. */
export function getInstallmentCount(type: TrancheType, value: number): number {
  switch (type) {
    case TrancheType.Week:
    case TrancheType.Month:
      return value;
    default:
      throw new Error(`Unsupported tranche type`);
  }
}

/** Due date for the `index`-th (0-based) installment, spaced weekly or by calendar month from `from`. */
export function getInstallmentDueDate(type: TrancheType, index: number, from: Date = new Date()): Date {
  const dueDate = new Date(from);

  switch (type) {
    case TrancheType.Week:
      dueDate.setDate(dueDate.getDate() + (index + 1) * 7);
      return dueDate;
    case TrancheType.Month:
      dueDate.setMonth(dueDate.getMonth() + (index + 1));
      return dueDate;
    default:
      throw new Error(`Unsupported tranche type`);
  }
}
