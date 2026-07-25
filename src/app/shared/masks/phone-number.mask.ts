import { MaskitoOptions } from '@maskito/core';

const GROUP_SIZE = 3;
const MAX_DIGITS = 15; // E.164 max phone number length

const mask: (RegExp | string)[] = [];
for (let i = 0; i < MAX_DIGITS; i++) {
  if (i > 0 && i % GROUP_SIZE === 0) {
    mask.push(' ');
  }
  mask.push(/\d/);
}

// Digits only, auto-grouped in blocks of 3 (e.g. "912 345 678") for readability.
const phoneNumberMask: MaskitoOptions = { mask };

export default phoneNumberMask;
