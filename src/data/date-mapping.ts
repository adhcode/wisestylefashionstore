// The domain layer works entirely in ISO date strings ("yyyy-mm-dd"); Prisma
// stores DateTime columns. These helpers are the only place that conversion
// happens, so it never leaks into services or components.

export function toISODate(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

export function fromISODate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value + "T00:00:00.000Z");
  return Number.isNaN(d.getTime()) ? null : d;
}
