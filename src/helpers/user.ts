import { BadRequestException } from '@nestjs/common';

import { formatPhoneWithCode, parsePhone } from './phone';

interface ILookupQuery {
  email?: string;
  country_code?: string;
  phone?: string;
}

export function buildUserLookupQuery(value: string): ILookupQuery {
  const trimmedValue = value.trim();

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);

  if (isEmail) {
    return {
      email: trimmedValue.toLowerCase(),
    };
  }

  const normalizedPhone = formatPhoneWithCode(trimmedValue);
  const { code, phone } = parsePhone(normalizedPhone);

  return { country_code: code, phone };
}

export function buildUserLookupQueryFromPayload(payload: ILookupQuery): { $or: ILookupQuery[] } {
  const conditions: ILookupQuery[] = [];

  if (payload.email) {
    conditions.push({
      email: payload.email.toLowerCase().trim(),
    });
  }

  if (payload.phone) {
    const normalizedPhone = formatPhoneWithCode(payload.phone, payload.country_code);
    const { code, phone } = parsePhone(normalizedPhone);

    conditions.push({
      country_code: code,
      phone,
    });
  }

  if (!conditions.length) throw new BadRequestException('Phone or email is required');

  return { $or: conditions };
}
