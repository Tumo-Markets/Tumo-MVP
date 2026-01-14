/* eslint-disable @typescript-eslint/no-explicit-any */

import BigNumber from 'bignumber.js';

export function isNumeric(num: any) {
  return !isNaN(num) && !isNaN(parseFloat(num));
}

export function BN(value: any): BigNumber {
  return new BigNumber(value);
}

export function DEC(value: string | number): BigNumber {
  return BN(10).pow(value);
}
