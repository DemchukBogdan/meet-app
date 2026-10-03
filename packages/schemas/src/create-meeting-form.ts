import type { ZodError } from 'zod';

import { createMeetingInputSchema } from './meeting';
import { toIsoDateTime } from './date-time';

import type { CreateMeetingInput } from './meeting';

export type CreateMeetingField = keyof CreateMeetingInput;

export type CreateMeetingErrorCode =
  | 'title_required'
  | 'title_too_long'
  | 'starts_at_invalid'
  | 'duration_invalid';

export type CreateMeetingFieldErrors = Partial<
  Record<CreateMeetingField, CreateMeetingErrorCode>
>;

export type CreateMeetingFormValues = {
  title: string;
  startsAtLocal: string;
  durationMin: string;
};

export type CreateMeetingFormResult =
  | { ok: true; data: CreateMeetingInput }
  | { ok: false; fieldErrors: CreateMeetingFieldErrors };

const fieldNames: readonly CreateMeetingField[] = [
  'title',
  'starts_at',
  'duration_min',
];

function isCreateMeetingField(value: unknown): value is CreateMeetingField {
  return fieldNames.some((field) => field === value);
}

function errorCode(
  field: CreateMeetingField,
  issueCode: string,
): CreateMeetingErrorCode {
  if (field === 'title' && issueCode === 'too_big') {
    return 'title_too_long';
  }

  if (field === 'title') {
    return 'title_required';
  }

  if (field === 'starts_at') {
    return 'starts_at_invalid';
  }

  return 'duration_invalid';
}

function mapZodFieldErrors(error: ZodError): CreateMeetingFieldErrors {
  const fieldErrors: CreateMeetingFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (!isCreateMeetingField(key) || fieldErrors[key]) {
      continue;
    }

    fieldErrors[key] = errorCode(key, issue.code);
  }

  return fieldErrors;
}

export class CreateMeetingForm {
  constructor(private readonly values: CreateMeetingFormValues) {}

  validate(): CreateMeetingFormResult {
    const duration = Number(this.values.durationMin);
    const parsed = createMeetingInputSchema.safeParse({
      title: this.values.title.trim(),
      starts_at: toIsoDateTime(this.values.startsAtLocal) ?? '',
      duration_min: duration,
    });

    if (parsed.success) {
      return { ok: true, data: parsed.data };
    }

    return { ok: false, fieldErrors: mapZodFieldErrors(parsed.error) };
  }
}
