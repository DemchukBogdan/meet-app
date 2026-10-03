export function toIsoDateTime(localValue: string): string | undefined {
  if (!localValue) {
    return undefined;
  }

  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}
