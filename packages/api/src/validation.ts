import { validationErrorSchema } from '@meet/schemas';

import type { ValidationErrorBody } from '@meet/schemas';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readValidationErrorBody(
  error: unknown,
): ValidationErrorBody | undefined {
  if (!isObject(error) || error.status !== 422) {
    return undefined;
  }

  const parsed = validationErrorSchema.safeParse(error.data);
  return parsed.success ? parsed.data : undefined;
}
