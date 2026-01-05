import { BadRequestException } from '@nestjs/common';

// Constantes de política
export const AGE_MIN_YEARS = 0;
export const AGE_MAX_YEARS = 120;

/**
 * Normaliza una fecha a objeto Date (date-only, sin hora)
 * Acepta Date o string ISO
 */
function normalizeDate(date: Date | string): Date {
  const fecha = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(fecha.getTime())) {
    throw new BadRequestException('Fecha inválida');
  }
  // Normalizar a medianoche (date-only)
  const normalized = new Date(fecha);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Calcula edad desde fechaNacimiento (precisa, considerando año bisiesto)
 */
function calcularEdadDesdeFecha(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesDiff = hoy.getMonth() - fechaNacimiento.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }
  return edad;
}

/**
 * Valida fechaNacimiento (A2):
 * - No puede ser futura
 * - La edad resultante debe estar entre AGE_MIN_YEARS y AGE_MAX_YEARS
 *
 * @param fechaNacimiento - Fecha de nacimiento (Date o string ISO)
 * @returns void - Lanza BadRequestException si es inválida
 */
export function validateFechaNacimiento(fechaNacimiento: Date | string): void {
  const fecha = normalizeDate(fechaNacimiento);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fecha > hoy) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      ruleId: 'A2',
      message: 'La fecha de nacimiento no puede ser futura',
    });
  }

  const edad = calcularEdadDesdeFecha(fecha);
  if (edad < AGE_MIN_YEARS || edad > AGE_MAX_YEARS) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      ruleId: 'A2',
      message: `La edad calculada (${edad} años) está fuera del rango válido (${AGE_MIN_YEARS}-${AGE_MAX_YEARS} años)`,
    });
  }
}

/**
 * Valida fechaDocumento contra fechaNacimiento y hoy (E1 genérico):
 * - fechaDocumento <= hoy
 * - fechaDocumento >= fechaNacimiento (si se proporciona)
 *
 * @param fechaDocumento - Fecha del documento (Date o string ISO)
 * @param fechaNacimiento - Fecha de nacimiento del trabajador (Date, string ISO, o null)
 * @returns void - Lanza BadRequestException si es inválida
 */
export function validateFechaDocumento(
  fechaDocumento: Date | string,
  fechaNacimiento?: Date | string | null,
): void {
  const fechaDoc = normalizeDate(fechaDocumento);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999); // Permitir hasta fin del día actual

  // Validar que no sea futura
  if (fechaDoc > hoy) {
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      ruleId: 'E1',
      message: 'La fecha del documento no puede ser futura',
    });
  }

  // Validar que no sea anterior a fechaNacimiento (si se proporciona)
  if (fechaNacimiento) {
    const fechaNac = normalizeDate(fechaNacimiento);
    if (fechaDoc < fechaNac) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        ruleId: 'E1',
        message:
          'La fecha del documento no puede ser anterior a la fecha de nacimiento del trabajador',
      });
    }
  }
}

