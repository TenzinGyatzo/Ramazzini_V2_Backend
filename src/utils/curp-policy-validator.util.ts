import { BadRequestException } from '@nestjs/common';
import { validateCURP } from './curp-validator.util';
import { RegulatoryPolicy } from './regulatory-policy.service';

/**
 * Valida CURP según la política regulatoria del proveedor
 *
 * Reglas:
 * - SIRES_NOM024: CURP es REQUERIDO y debe ser válido
 * - SIN_REGIMEN: CURP es OPCIONAL, pero si se proporciona debe ser válido
 *
 * @param curp - CURP a validar (puede ser undefined)
 * @param policy - Política regulatoria del proveedor
 * @throws BadRequestException si la validación falla
 */
export function validateCurpByPolicy(
  curp: string | undefined,
  policy: RegulatoryPolicy,
): void {
  const isRequired = policy.validation.curpFirmantes === 'required';

  // Si es requerido y falta, lanzar error
  if (isRequired && (!curp || curp.trim() === '')) {
    throw new BadRequestException(
      'CURP es obligatorio para firmantes en régimen SIRES_NOM024',
    );
  }

  // Si CURP está presente (en ambos regímenes), validar formato
  if (curp && curp.trim() !== '') {
    const validation = validateCURP(curp);
    if (!validation.isValid) {
      const errorMessage = isRequired
        ? `NOM-024: ${validation.errors.join(', ')}`
        : validation.errors.join(', ');
      throw new BadRequestException(errorMessage);
    }
  }
}
