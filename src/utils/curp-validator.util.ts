/**
 * CURP Validator Utility
 *
 * Validates CURP (Clave Única de Registro de Población) according to RENAPO format
 * and checksum algorithm. Used for NOM-024 compliance for Mexican providers.
 */

/**
 * Validates CURP format according to RENAPO specification
 * Format: [A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d (18 characters)
 *
 * @param curp - CURP string to validate
 * @returns true if format is valid, false otherwise
 */
export function validateCURPFormat(curp: string): boolean {
  if (!curp || typeof curp !== 'string') {
    return false;
  }

  // Remove whitespace and convert to uppercase
  const normalizedCurp = curp.trim().toUpperCase();

  // Must be exactly 18 characters
  if (normalizedCurp.length !== 18) {
    return false;
  }

  // RENAPO format: [A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d
  const renapoPattern = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;

  return renapoPattern.test(normalizedCurp);
}

/**
 * Validates CURP checksum using RENAPO algorithm
 *
 * The checksum algorithm:
 * 1. Takes first 17 characters
 * 2. Assigns values to each character according to RENAPO table
 * 3. Multiplies each value by its position weight
 * 4. Sums all results
 * 5. Calculates modulo 10
 * 6. If result is 0, check digit is 0, otherwise it's 10 - result
 *
 * @param curp - CURP string to validate
 * @returns true if checksum is valid, false otherwise
 */
export function validateCURPChecksum(curp: string): boolean {
  if (!curp || typeof curp !== 'string' || curp.length !== 18) {
    return false;
  }

  const normalizedCurp = curp.trim().toUpperCase();

  // Get first 17 characters and check digit (last character)
  const baseString = normalizedCurp.substring(0, 17);
  const providedCheckDigit = normalizedCurp.charAt(17);

  // RENAPO character value mapping
  // Letters: A=10, B=11, ..., Z=35
  // Numbers: 0=0, 1=1, ..., 9=9
  const getCharValue = (char: string): number => {
    if (/[0-9]/.test(char)) {
      return parseInt(char, 10);
    }
    if (/[A-Z]/.test(char)) {
      return char.charCodeAt(0) - 55; // A=10, B=11, etc.
    }
    return 0;
  };

  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const charValue = getCharValue(baseString[i]);
    // Position weight: 18-i (18 for first char, 17 for second, ..., 2 for last)
    const weight = 18 - i;
    sum += charValue * weight;
  }

  // Calculate check digit
  const modulo = sum % 10;
  const calculatedCheckDigit = modulo === 0 ? '0' : String(10 - modulo);

  return calculatedCheckDigit === providedCheckDigit;
}

/**
 * Detects if CURP is a generic/placeholder CURP
 * Generic CURP pattern: XXXX999999XXXXXX99 (all X's for letters, all 9's for numbers)
 *
 * @param curp - CURP string to check
 * @returns true if CURP appears to be generic/placeholder
 */
export function isGenericCURP(curp: string): boolean {
  if (!curp || typeof curp !== 'string') {
    return false;
  }

  const normalizedCurp = curp.trim().toUpperCase();

  // Generic pattern detection: XXXX999999[HM]XXXX[0-9A-Z]9
  // Check if first 4 are X, next 6 are 9, then H or M
  if (
    normalizedCurp.substring(0, 4) === 'XXXX' &&
    normalizedCurp.substring(4, 10) === '999999' &&
    /^[HM]$/.test(normalizedCurp[10])
  ) {
    // Check if most of the remaining characters (positions 11-16) are X's
    const remaining = normalizedCurp.substring(11, 17); // 6 chars before last digit
    const xCount = (remaining.match(/X/g) || []).length;
    // If 4 or more X's out of 6, consider it generic
    if (xCount >= 4) {
      return true;
    }
  }

  return false;
}

/**
 * Validates complete CURP (format + checksum)
 *
 * @param curp - CURP string to validate
 * @returns object with validation results
 */
export function validateCURP(curp: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!curp || typeof curp !== 'string' || curp.trim() === '') {
    return {
      isValid: false,
      errors: ['CURP no puede estar vacío'],
    };
  }

  const normalizedCurp = curp.trim().toUpperCase();

  // Validate format first
  if (!validateCURPFormat(normalizedCurp)) {
    errors.push(
      'CURP debe tener exactamente 18 caracteres con el formato: 4 letras, 6 dígitos, 1 letra (H/M), 5 letras, 1 alfanumérico, 1 dígito',
    );
    return {
      isValid: false,
      errors,
    };
  }

  // Check for generic CURP (before checksum validation)
  if (isGenericCURP(normalizedCurp)) {
    errors.push('CURP genérico no permitido (formato XXXX999999XXXXXX99)');
    return {
      isValid: false,
      errors,
    };
  }

  // Validate checksum (only if format is valid and not generic)
  if (!validateCURPChecksum(normalizedCurp)) {
    errors.push('CURP con dígito verificador inválido');
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}
