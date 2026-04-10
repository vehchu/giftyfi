const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Encode a positive integer to a base62 string.
 * 1 billion → 6 characters. Guarantees short, unique codes.
 */
function toBase62(num) {
  if (num === 0) return '0';
  let result = '';
  while (num > 0) {
    result = CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

export { toBase62 };
