import { TrancheType } from '../dto/plan.dto';

export function convertToWeeks(type: TrancheType, value: number): number {
  switch (type) {
    case TrancheType.Week:
      return value;
    case TrancheType.Month:
      return value * 4;
    default:
      throw new Error(`Unsupported tranche type`);
  }
}
