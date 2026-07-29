export type DebtAgeBracket = '0-1yr' | '1-2yr' | '3-4yr' | '4yr+';

export interface DebtEvaluation {
  debt_age_years: number;
  bracket: DebtAgeBracket;
  commission_weight: number;
  base_commission_rate: number;
  weighted_commission_estimate: number;
}

/**
 * Placeholder weighting until Settings-module commission configuration ships —
 * per the SOW, brackets/weights become Super-Admin configurable there.
 */
const COMMISSION_WEIGHT_BY_BRACKET: Record<DebtAgeBracket, number> = {
  '0-1yr': 1,
  '1-2yr': 1.25,
  '3-4yr': 1.5,
  '4yr+': 1.75,
};

const BASE_COMMISSION_RATE = 0.1;

export function getDebtAgeBracket(years: number): DebtAgeBracket {
  if (years < 1) return '0-1yr';
  if (years <= 2) return '1-2yr';
  if (years <= 4) return '3-4yr';
  return '4yr+';
}

export function evaluateDebt(dueDate: Date, amount: number): DebtEvaluation {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const debtAgeYears = Math.max(0, (Date.now() - new Date(dueDate).getTime()) / msPerYear);

  const bracket = getDebtAgeBracket(debtAgeYears);
  const commissionWeight = COMMISSION_WEIGHT_BY_BRACKET[bracket];
  const baseCommission = (amount || 0) * BASE_COMMISSION_RATE;

  return {
    debt_age_years: Math.round(debtAgeYears * 100) / 100,
    bracket,
    commission_weight: commissionWeight,
    base_commission_rate: BASE_COMMISSION_RATE,
    weighted_commission_estimate: Math.round(baseCommission * commissionWeight * 100) / 100,
  };
}
