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

// ─── Phone Normalization ─────────────────────────────────────
export function normalizePhone(phone: string | number | null | undefined): string {
  if (!phone && phone !== 0) return '';
  let cleaned = String(phone)
    .replace(/[\s().-]/g, '')
    .trim();

  if (cleaned.startsWith('+234')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('234') && cleaned.length >= 13) {
    cleaned = '0' + cleaned.slice(3);
  }

  // Excel stores Nigerian numbers without leading 0: 7065889594 → 07065889594
  if (/^\d{10}$/.test(cleaned) && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

export function sanitizePhoneNumber(phone: string, countryCode: string = '+234'): string {
  if (!phone) throw new Error('Phone number is required');

  let cleaned = phone.trim().replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  cleaned = cleaned.replace(/^0+/, '');

  return `${countryCode}${cleaned}`;
}

export function toInternationalPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.startsWith('0')) {
    return '234' + normalized.slice(1);
  }
  if (normalized.startsWith('+234')) {
    return normalized.slice(1);
  }
  return normalized;
}
