/**
 * CIE-10 Age Limit Parser Utility
 * 
 * Parses age limit values from the CIE-10 catalog (LINF/LSUP columns)
 * Format: 3 digits + unit code (A/D/M/Y)
 * Examples: "010A" (10 years), "028D" (28 days), "120A" (120 years), "NO" (no limit)
 */

/**
 * Parses an age limit value from the catalog format to years (number)
 * 
 * Format examples:
 * - "010A" → 10 (years)
 * - "028D" → ~0.0766 (28 days / 365.25)
 * - "120A" → 120 (years)
 * - "NO" → null (no limit)
 * - "020A" → 20 (years)
 * 
 * @param value - Age limit string from catalog (LINF/LSUP)
 * @returns Age in years (number) or null if no limit
 */
export function parseAgeLimit(value: string | null | undefined): number | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim().toUpperCase();

  // "NO" means no limit
  if (trimmed === 'NO' || trimmed === '') {
    return null;
  }

  // Format: 3 digits + unit code (A/D/M/Y)
  // Examples: "010A", "028D", "120A"
  const match = trimmed.match(/^(\d{3})([ADMY])$/);
  
  if (!match) {
    // If format doesn't match, try to parse as plain number (fallback)
    const numValue = parseInt(trimmed, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      return numValue;
    }
    return null;
  }

  const numericValue = parseInt(match[1], 10);
  const unit = match[2];

  if (isNaN(numericValue) || numericValue < 0) {
    return null;
  }

  // Convert to years based on unit
  switch (unit) {
    case 'A': // Years (Años)
    case 'Y': // Years (alternative)
      return numericValue;

    case 'D': // Days (Días)
      // Convert days to years: days / 365.25 (accounting for leap years)
      return numericValue / 365.25;

    case 'M': // Months (Meses)
      // Convert months to years: months / 12
      return numericValue / 12;

    default:
      // Unknown unit, assume years as fallback
      return numericValue;
  }
}

