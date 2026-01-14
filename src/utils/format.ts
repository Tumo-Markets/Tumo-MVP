/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormatNumberOptions } from 'src/global.config';
import { isNumeric } from '.';

/**
 *
 * @param address The input address
 * @param first The number of characters will be taken from begin of the address. This value cannot be negative
 * @param last The number of characters will be taken from last of the address. This value cannot be negative
 * @returns
 */
export function formatAddress(address: string, first = 6, last = 4): string {
  if (first < 0 || last <= 0) {
    throw new Error('Invalid parameter(s)');
  }
  return address.slice(0, first) + '...' + address.slice(-last);
}

export function formatMatchTime(time: string): string {
  if (!time) return '';
  const trimmed = time.trim();
  if (!trimmed) return '';
  if (/^live/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.includes("'") || /^\d{1,2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}'`;
}

/**
 * Format an ISO/parsable date string into a short month/day label (e.g. "Nov 15").
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'TBD';
  }
}

/**
 * Format an ISO/parsable date string into a localized time (e.g. "15:00").
 */
export function formatTime(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'TBD';
  }
}

export function numberWithCommas(x: number | string, delimiter = ','): string {
  if (!isNumeric(x)) {
    throw new Error('Must provide a correct number');
  }
  const [naturalPart, decimalPart] = x.toString().split('.');
  let out = naturalPart.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
  if (decimalPart) {
    out += '.' + decimalPart;
  }
  return out;
}

/**
 * Format a number
 * @param {*} number - The number needs to format
 * @param {FormatNumberOptions} options - Includes options to customize the results returned
 * @returns A string representing a number in formatted, `option.fallback` will be returned if `number` is invalid
 */
export function formatNumber(number: any, options?: FormatNumberOptions): string | FormatNumberOptions['fallback'] {
  const { fallback = '0.00', fractionDigits, delimiter, padZero, prefix, suffix, onlyPositive } = options ?? {};

  if (!isNumeric(number)) {
    return fallback;
  }

  let num: number | string = parseFloat(number);
  if (onlyPositive && num < 0) {
    num = 0;
  }
  if (isNumeric(fractionDigits)) {
    num = num.toFixed(fractionDigits);
  }
  if (!padZero) {
    num = Number(num); // remove last zeros
  }
  return (prefix ?? '') + numberWithCommas(num, delimiter) + (suffix ?? '');
}
