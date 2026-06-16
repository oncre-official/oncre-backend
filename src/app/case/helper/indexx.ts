import { Case } from '../model/case.model';

export function isCaseOnHold(newCase: Case) {
  if (!newCase.hold) return false;
  if (!newCase.hold_until) return false;

  return new Date(newCase.hold_until) > new Date();
}

export function getEscalationLevel(day: number): number {
  if (day <= 3) return 1;
  if (day <= 7) return 2;
  if (day <= 14) return 3;
  return 4;
}
