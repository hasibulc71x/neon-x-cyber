/**
 * Programmer Mode Math & Bitwise Logic
 * Handles 64-bit integers with BigInt, word size masking, bit-level inspection,
 * and base conversions between HEX, DEC, OCT, and BIN.
 */

import { ProgrammerWordSize } from '../types/calculator';

export function getWordMask(bits: ProgrammerWordSize): bigint {
  switch (bits) {
    case 8:
      return 0xffn;
    case 16:
      return 0xffffn;
    case 32:
      return 0xffffffffn;
    case 64:
    default:
      return 0xffffffffffffffffn;
  }
}

export function maskValue(val: bigint, bits: ProgrammerWordSize): bigint {
  const mask = getWordMask(bits);
  let masked = val & mask;
  if (masked < 0n) {
    masked = (masked + mask + 1n) & mask;
  }
  return masked;
}

export function toSigned(val: bigint, bits: ProgrammerWordSize): bigint {
  const masked = maskValue(val, bits);
  const signBit = 1n << BigInt(bits - 1);
  if ((masked & signBit) !== 0n) {
    return masked - (1n << BigInt(bits));
  }
  return masked;
}

export function formatBinaryWithSpaces(binStr: string, bits: ProgrammerWordSize): string {
  // Pad to exact word size
  const padded = binStr.padStart(bits, '0');
  // Group into nibbles of 4
  const groups = padded.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

export interface ProgrammerDisplay {
  hex: string;
  dec: string;
  signedDec: string;
  oct: string;
  bin: string;
  rawBigInt: bigint;
}

export function getProgrammerRepresentations(
  value: bigint,
  bits: ProgrammerWordSize = 64
): ProgrammerDisplay {
  const masked = maskValue(value, bits);
  const signed = toSigned(masked, bits);

  const hex = masked.toString(16).toUpperCase();
  const dec = masked.toString(10);
  const signedDec = signed.toString(10);
  const oct = masked.toString(8);
  const bin = masked.toString(2);

  return {
    hex,
    dec,
    signedDec,
    oct,
    bin: formatBinaryWithSpaces(bin, bits),
    rawBigInt: masked,
  };
}

export function toggleBit(val: bigint, bitIndex: number, bits: ProgrammerWordSize): bigint {
  if (bitIndex < 0 || bitIndex >= bits) return val;
  const bitMask = 1n << BigInt(bitIndex);
  const toggled = val ^ bitMask;
  return maskValue(toggled, bits);
}

export function isBitSet(val: bigint, bitIndex: number): boolean {
  return ((val >> BigInt(bitIndex)) & 1n) === 1n;
}

export function rotateLeft(val: bigint, amount: number, bits: ProgrammerWordSize): bigint {
  const masked = maskValue(val, bits);
  const shift = BigInt(amount % bits);
  if (shift === 0n) return masked;
  const left = (masked << shift) & getWordMask(bits);
  const right = masked >> (BigInt(bits) - shift);
  return maskValue(left | right, bits);
}

export function rotateRight(val: bigint, amount: number, bits: ProgrammerWordSize): bigint {
  const masked = maskValue(val, bits);
  const shift = BigInt(amount % bits);
  if (shift === 0n) return masked;
  const right = masked >> shift;
  const left = (masked << (BigInt(bits) - shift)) & getWordMask(bits);
  return maskValue(left | right, bits);
}
