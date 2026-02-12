/**
 * Diagnosis Duplicate Validator
 *
 * Validates that the principal CIE-10 diagnosis code is not duplicated
 * in the complementary diagnosis codes array (Regla B4).
 */

import { extractCIE10Code } from '../../../utils/cie10.util';

/**
 * Validates that the principal CIE-10 code is not duplicated in the complementary codes.
 *
 * @param principal - Principal CIE-10 code (format: "CODE" or "CODE - DESCRIPTION")
 * @param complementarios - Array of complementary CIE-10 codes
 * @returns Object with isValid flag and duplicated code if found
 *
 * @example
 * validateNoDuplicateCIE10PrincipalAndComplementary("A30", ["A30"])
 * => { isValid: false, duplicated: 'A30' }
 *
 * validateNoDuplicateCIE10PrincipalAndComplementary("A30", ["B20"])
 * => { isValid: true }
 */
export function validateNoDuplicateCIE10PrincipalAndComplementary(
  principal: string | undefined,
  complementarios: string[] | undefined,
): { isValid: boolean; duplicated?: string } {
  // Si no hay principal o complementarios, no hay duplicado
  if (!principal || !complementarios || complementarios.length === 0) {
    return { isValid: true };
  }

  const principalCode = extractCIE10Code(principal);
  if (!principalCode) {
    return { isValid: true }; // Principal inválido, no validar duplicado
  }

  // Recorrer complementarios y comparar códigos
  for (const complementario of complementarios) {
    if (!complementario || complementario.trim() === '') {
      continue; // Saltar elementos vacíos
    }

    const complementarioCode = extractCIE10Code(complementario);
    if (complementarioCode && complementarioCode === principalCode) {
      return { isValid: false, duplicated: complementarioCode };
    }
  }

  return { isValid: true };
}
