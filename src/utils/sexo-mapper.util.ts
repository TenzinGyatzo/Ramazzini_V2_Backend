/**
 * Utility functions for mapping sexo values to numeric codes
 * NOM-024 GIIS-B015: Sexo biológico mapping
 * - "Masculino" → 1 (Hombre)
 * - "Femenino" → 2 (Mujer)
 * - Others → null (including intersexual which should be 3, but not in current schema)
 */

/**
 * Maps sexo string to numeric code according to NOM-024 GIIS-B015
 * @param sexo - Sexo string value ("Masculino" or "Femenino")
 * @returns 1 for Masculino, 2 for Femenino, null for others
 */
export function mapSexoToNumeric(sexo: string): 1 | 2 | null {
  if (!sexo) {
    return null;
  }

  const normalizedSexo = sexo.trim().toLowerCase();

  if (
    normalizedSexo === 'masculino' ||
    normalizedSexo === 'hombre' ||
    normalizedSexo === 'm' ||
    normalizedSexo === 'h'
  ) {
    return 1;
  }

  if (
    normalizedSexo === 'femenino' ||
    normalizedSexo === 'mujer' ||
    normalizedSexo === 'f'
  ) {
    return 2;
  }

  // Intersexual would be 3, but current schema doesn't support it
  // Return null for unknown values
  return null;
}

/**
 * Maps numeric code to sexo string (reverse mapping)
 * @param codigo - Numeric code (1, 2, or 3)
 * @returns "Masculino" for 1, "Femenino" for 2, null for others
 */
export function mapNumericToSexo(codigo: number): string | null {
  switch (codigo) {
    case 1:
      return 'Masculino';
    case 2:
      return 'Femenino';
    case 3:
      // Intersexual - not currently in schema but may be added in future
      return null;
    default:
      return null;
  }
}
