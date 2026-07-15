/**
 * Native `<input type="date">` values are plain "YYYY-MM-DD" strings. JS's
 * `Date` parser treats a date-only string as UTC midnight, not local midnight
 * — so sending it to the backend as-is silently clips the selected range for
 * any user not in UTC (e.g. "to=2026-07-14" would exclude nearly the whole
 * day for an IST user). These helpers convert a date-input value to the
 * correct *local* start/end-of-day instant, expressed as an unambiguous UTC
 * ISO string safe to send to the backend regardless of server timezone.
 */

function parseDateInput(value: string): [number, number, number] {
  const [y, m, d] = value.split("-").map(Number);
  return [y, m - 1, d];
}

/** Local midnight for a "YYYY-MM-DD" value, as a UTC ISO string. */
export function dateInputToStartOfDayIso(value: string): string {
  const [y, m, d] = parseDateInput(value);
  return new Date(y, m, d, 0, 0, 0, 0).toISOString();
}

/** Local 23:59:59.999 for a "YYYY-MM-DD" value, as a UTC ISO string. */
export function dateInputToEndOfDayIso(value: string): string {
  const [y, m, d] = parseDateInput(value);
  return new Date(y, m, d, 23, 59, 59, 999).toISOString();
}

/** `{from, to}` date-input values → the ISO instants the backend expects, or `undefined` if either is unset. */
export function toApiDateRange(
  from: string,
  to: string
): { from: string; to: string } | undefined {
  if (!from || !to) return undefined;
  return { from: dateInputToStartOfDayIso(from), to: dateInputToEndOfDayIso(to) };
}

/** Local "YYYY-MM-DD" for a Date — matches the native date input's value format. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
