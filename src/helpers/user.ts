import { formatPhoneWithCode, parsePhone } from './phone';

export function buildUserLookupQuery(value: string) {
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
