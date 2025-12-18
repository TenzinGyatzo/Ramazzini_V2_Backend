/**
 * GIIS Field Formatter
 *
 * Utility functions for formatting individual fields in GIIS export records.
 * Handles null/undefined values, arrays, and special characters.
 */

/**
 * Safely convert any value to a GIIS-safe string
 *
 * Rules:
 * - null/undefined -> empty string
 * - Arrays -> joined with '&'
 * - Numbers -> string representation
 * - Strings -> trimmed
 * - Objects -> empty string (not supported)
 *
 * @param value - Any value to convert
 * @returns GIIS-safe string
 *
 * @example
 * toGIISString(null) // ''
 * toGIISString(123) // '123'
 * toGIISString('test') // 'test'
 * toGIISString([1,2,3]) // '1&2&3'
 */
export function toGIISString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return toGIISMultiValue(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  // Objects and other types are not supported
  return '';
}

/**
 * Convert an array to GIIS multi-value format (joined by '&')
 *
 * @param values - Array of values
 * @returns String with values joined by '&', or empty string if empty/null
 *
 * @example
 * toGIISMultiValue([1, 2, 3]) // '1&2&3'
 * toGIISMultiValue(['a', 'b']) // 'a&b'
 * toGIISMultiValue([]) // ''
 * toGIISMultiValue(null) // ''
 */
export function toGIISMultiValue(values: any[] | null | undefined): string {
  if (!values || !Array.isArray(values) || values.length === 0) {
    return '';
  }

  return values
    .filter((v) => v !== null && v !== undefined)
    .map((v) => String(v).trim())
    .filter((v) => v !== '')
    .join('&');
}

/**
 * Join multiple fields into a GIIS pipe-delimited record
 *
 * @param fields - Array of field values
 * @returns Pipe-delimited string
 *
 * @example
 * joinGIISFields(['A', 'B', '', 'D']) // 'A|B||D'
 * joinGIISFields([null, 'X', undefined]) // '|X|'
 */
export function joinGIISFields(fields: any[]): string {
  return fields.map((f) => toGIISString(f)).join('|');
}

/**
 * Pad a numeric value to a specific length with leading zeros
 *
 * @param value - Numeric value
 * @param length - Desired length
 * @returns Padded string or empty string if null/undefined
 *
 * @example
 * padNumber(5, 2) // '05'
 * padNumber(123, 5) // '00123'
 * padNumber(null, 2) // ''
 */
export function padNumber(
  value: number | string | null | undefined,
  length: number,
): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return String(value).padStart(length, '0');
}

/**
 * Format a CURP value (uppercase, 18 chars)
 *
 * @param curp - CURP string
 * @returns Formatted CURP or empty string
 */
export function formatCURP(curp: string | null | undefined): string {
  if (!curp) return '';
  const cleaned = curp.trim().toUpperCase();
  // CURP should be exactly 18 characters
  return cleaned.length === 18 ? cleaned : '';
}

/**
 * Format a CLUES value (uppercase, 11 chars)
 *
 * @param clues - CLUES string
 * @returns Formatted CLUES or empty string
 */
export function formatCLUES(clues: string | null | undefined): string {
  if (!clues) return '';
  const cleaned = clues.trim().toUpperCase();
  // CLUES should be exactly 11 characters
  return cleaned.length === 11 ? cleaned : '';
}

/**
 * Format a CIE-10 code (uppercase)
 *
 * @param code - CIE-10 code
 * @returns Formatted code or empty string
 */
export function formatCIE10(code: string | null | undefined): string {
  if (!code) return '';
  return code.trim().toUpperCase();
}

/**
 * Convert a result enum (0=Positivo, 1=Negativo, -1=NA) to GIIS format
 *
 * @param value - Result value
 * @returns String representation or empty string
 */
export function formatResultEnum(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (value === -1) return ''; // NA -> empty
  return String(value);
}
