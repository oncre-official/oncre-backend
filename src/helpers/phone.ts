interface ParsedPhone {
  code: string;
  phone: string;
}

const DEFAULT_COUNTRY_CODE = '234';
const COUNTRY_CODE_LENGTHS = [1, 2, 3, 4];

export function formatFullPhone(code: string, phone: string): string {
  return `${code}${phone}`;
}

export function formatDisplayPhone(code: string, phone: string): string {
  return `+${code} ${phone}`;
}

export function parsePhone(fullPhone: string): ParsedPhone {
  let cleaned = fullPhone.replace(/\D/g, '');

  const hasLeadingZero = cleaned.startsWith('0');
  if (hasLeadingZero) cleaned = cleaned.replace(/^0+/, '');

  for (const length of COUNTRY_CODE_LENGTHS) {
    if (cleaned.length > length) {
      const potentialCode = cleaned.substring(0, length);
      const remainingPhone = cleaned.substring(length);

      if (remainingPhone.length >= 7) {
        return {
          code: potentialCode,
          phone: remainingPhone,
        };
      }
    }
  }

  return { code: DEFAULT_COUNTRY_CODE, phone: cleaned };
}
