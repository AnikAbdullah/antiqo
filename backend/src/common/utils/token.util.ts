import { randomBytes } from 'crypto';

export function createToken(bytes = 24): string {
  return randomBytes(bytes).toString('hex');
}
