import { describe, expect, it } from 'vitest';

import { CreateMeetingForm } from './create-meeting-form';

describe('CreateMeetingForm', () => {
  it('returns parsed input for a valid draft', () => {
    const result = new CreateMeetingForm({
      title: 'Algebra',
      startsAtLocal: '2026-10-10T12:00',
      durationMin: '45',
    }).validate();

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.title).toBe('Algebra');
    expect(result.data.duration_min).toBe(45);
    expect(result.data.starts_at.endsWith('Z')).toBe(true);
  });

  it('maps invalid fields to error codes', () => {
    const result = new CreateMeetingForm({
      title: '',
      startsAtLocal: '',
      durationMin: '0',
    }).validate();

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }

    expect(result.fieldErrors.title).toBe('title_required');
    expect(result.fieldErrors.starts_at).toBe('starts_at_invalid');
    expect(result.fieldErrors.duration_min).toBe('duration_invalid');
  });
});
