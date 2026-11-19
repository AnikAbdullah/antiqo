import { applyDecorators } from '@nestjs/common';
import { Matches, MaxLength, MinLength } from 'class-validator';

export function StrongPassword() {
  return applyDecorators(
    MinLength(8),
    MaxLength(72),
    Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
      message:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character.',
    }),
  );
}
