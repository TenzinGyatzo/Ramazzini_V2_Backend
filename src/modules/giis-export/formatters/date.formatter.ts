/**
 * GIIS Date Formatter
 *
 * Converts Date objects to GIIS-required string formats.
 *
 * TIMEZONE HANDLING:
 * - All dates are treated as UTC to avoid local timezone offset surprises.
 * - Uses UTC getters (getUTCFullYear, getUTCMonth, getUTCDate) to ensure
 *   consistent output regardless of server timezone.
 * - This is critical for GIIS compliance where dates must be deterministic.
 */

/**
 * Safely parse a date value to a Date object
 * Returns null if invalid
 */
function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;

  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Format date to YYYYMMDD (GIIS standard for most date fields)
 *
 * @param date - Date object, ISO string, or null/undefined
 * @returns String in format "YYYYMMDD" or empty string if invalid
 *
 * @example
 * toAAAAMMDD(new Date('2024-03-15')) // "20240315"
 * toAAAAMMDD('2024-03-15T10:30:00Z') // "20240315"
 * toAAAAMMDD(null) // ""
 */
export function toAAAAMMDD(date: Date | string | null | undefined): string {
  const parsed = parseDate(date);
  if (!parsed) return '';

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

/**
 * Format date to DD/MM/YYYY (alternative GIIS format)
 *
 * @param date - Date object, ISO string, or null/undefined
 * @returns String in format "DD/MM/YYYY" or empty string if invalid
 *
 * @example
 * toDDMMAAAA(new Date('2024-03-15')) // "15/03/2024"
 * toDDMMAAAA('2024-03-15T10:30:00Z') // "15/03/2024"
 * toDDMMAAAA(null) // ""
 */
export function toDDMMAAAA(date: Date | string | null | undefined): string {
  const parsed = parseDate(date);
  if (!parsed) return '';

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');

  return `${day}/${month}/${year}`;
}

/**
 * Format time to HHMM (GIIS standard for time fields)
 *
 * @param time - Time string in HH:mm format, or null/undefined
 * @returns String in format "HHMM" or empty string if invalid
 *
 * @example
 * toHHMM('14:30') // "1430"
 * toHHMM(null) // ""
 */
export function toHHMM(time: string | null | undefined): string {
  if (!time) return '';

  // Validate HH:mm format
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return '';

  const hoursNum = parseInt(match[1], 10);
  const minutesNum = parseInt(match[2], 10);

  // Validate hour (0-23) and minute (0-59) ranges
  if (hoursNum < 0 || hoursNum > 23 || minutesNum < 0 || minutesNum > 59) {
    return '';
  }

  const hours = String(hoursNum).padStart(2, '0');
  const minutes = String(minutesNum).padStart(2, '0');

  return `${hours}${minutes}`;
}
