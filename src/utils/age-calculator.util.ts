/**
 * Utility functions for calculating age from dates
 * NOM-024 GIIS-B015: Age calculation for diagnosis validation
 */

/**
 * Calculates age in years from fechaNacimiento to fechaConsulta
 * @param fechaNacimiento - Birth date
 * @param fechaConsulta - Consultation/visit date
 * @returns Age in years (integer)
 */
export function calculateAge(
  fechaNacimiento: Date,
  fechaConsulta: Date,
): number {
  if (!fechaNacimiento || !fechaConsulta) {
    throw new Error('Both fechaNacimiento and fechaConsulta are required');
  }

  const birthDate = new Date(fechaNacimiento);
  const consultDate = new Date(fechaConsulta);

  if (isNaN(birthDate.getTime()) || isNaN(consultDate.getTime())) {
    throw new Error('Invalid date provided');
  }

  if (consultDate < birthDate) {
    throw new Error('fechaConsulta cannot be before fechaNacimiento');
  }

  let age = consultDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = consultDate.getMonth() - birthDate.getMonth();
  const dayDiff = consultDate.getDate() - birthDate.getDate();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Calculates age in years from fechaNacimiento to today
 * @param fechaNacimiento - Birth date
 * @returns Age in years (integer)
 */
export function calculateAgeToToday(fechaNacimiento: Date): number {
  return calculateAge(fechaNacimiento, new Date());
}
