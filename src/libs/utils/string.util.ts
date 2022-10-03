import { createHash } from 'crypto';
export function hashInformation(input: string): string {
  return createHash('SHA256').update(input).digest('hex');
}
