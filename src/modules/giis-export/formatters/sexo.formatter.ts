/**
 * GIIS Sexo Formatter
 *
 * Maps internal Ramazzini sexo values to GIIS export formats.
 *
 * INTERNAL VALUES (Ramazzini):
 * - "Masculino"
 * - "Femenino"
 * - (potentially other variants like "Intersexual" for GIIS-B013)
 *
 * GIIS OUTPUT FORMATS:
 * - H/M format: Used in some GIIS forms (H=Hombre, M=Mujer)
 * - Numeric format: 1=Hombre, 2=Mujer, 3=Intersexual (GIIS-B013 spec)
 *
 * DEFAULT: We use the NUMERIC format as the primary export format
 * because GIIS-B013 and GIIS-B019 specs reference numeric codes.
 */

/**
 * Internal sexo values recognized by Ramazzini
 */
type InternalSexo = 'Masculino' | 'Femenino' | string;

/**
 * Convert internal sexo value to GIIS H/M format
 *
 * @param sexo - Internal sexo value
 * @returns 'H' for Masculino, 'M' for Femenino, '' for unknown
 *
 * @example
 * toGIISHM('Masculino') // 'H'
 * toGIISHM('Femenino') // 'M'
 * toGIISHM(null) // ''
 */
export function toGIISHM(
  sexo: InternalSexo | null | undefined,
): 'H' | 'M' | '' {
  if (!sexo) return '';

  const normalized = sexo.trim().toLowerCase();

  switch (normalized) {
    case 'masculino':
    case 'hombre':
    case 'male':
    case 'm':
    case 'h':
      return 'H';
    case 'femenino':
    case 'mujer':
    case 'female':
    case 'f':
      return 'M';
    default:
      return '';
  }
}

/**
 * Convert internal sexo value to GIIS numeric format
 *
 * GIIS Codes:
 * - 1 = Hombre/Masculino
 * - 2 = Mujer/Femenino
 * - 3 = Intersexual/Otro
 *
 * @param sexo - Internal sexo value
 * @returns '1', '2', '3', or '' for unknown
 *
 * @example
 * toGIISNumeric('Masculino') // '1'
 * toGIISNumeric('Femenino') // '2'
 * toGIISNumeric('Intersexual') // '3'
 * toGIISNumeric(null) // ''
 */
export function toGIISNumeric(
  sexo: InternalSexo | null | undefined,
): '1' | '2' | '3' | '' {
  if (!sexo) return '';

  const normalized = sexo.trim().toLowerCase();

  switch (normalized) {
    case 'masculino':
    case 'hombre':
    case 'male':
    case 'm':
    case 'h':
    case '1':
      return '1';
    case 'femenino':
    case 'mujer':
    case 'female':
    case 'f':
    case '2':
      return '2';
    case 'intersexual':
    case 'otro':
    case 'other':
    case '3':
      return '3';
    default:
      return '';
  }
}

/**
 * Default GIIS sexo formatter
 * Uses numeric format as per GIIS-B013/B019 specs
 */
export const toGIISSexo = toGIISNumeric;
