import { PHONE_MAX_NATIONAL_DIGITS } from '../constants';

export function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function getPhonePlain(value: string): string {
  const digits = getPhoneDigits(value);

  if (digits.startsWith('380')) {
    return digits.slice(3);
  }

  if (digits.startsWith('38') && digits.length > PHONE_MAX_NATIONAL_DIGITS) {
    return digits.slice(2);
  }

  return digits;
}

export function formatPhoneMask(value: string): string {
  const digits = getPhonePlain(value).slice(0, PHONE_MAX_NATIONAL_DIGITS);
  const partCity = digits.slice(0, 3);
  const partPrefix = digits.slice(3, 6);
  const partFirst = digits.slice(6, 8);
  const partLast = digits.slice(8, 10);

  if (digits.length <= 3) {
    return partCity;
  }

  if (digits.length <= 6) {
    return `${partCity} ${partPrefix}`;
  }

  if (digits.length <= 8) {
    return `${partCity} ${partPrefix}-${partFirst}`;
  }

  return `${partCity} ${partPrefix}-${partFirst}-${partLast}`;
}
