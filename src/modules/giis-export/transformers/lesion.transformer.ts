/**
 * GIIS-B013 Lesion Transformer
 *
 * Transforms internal Ramazzini Lesion documents to GIIS-B013 pipe-delimited format.
 *
 * GIIS-B013 VERSION: 2023 (Lesiones y Causas de Violencia)
 * FIELD COUNT: 78+ fields (maintaining full field count even if some are empty)
 *
 * NOTES:
 * - Some fields are not captured in Ramazzini (occupational health focus)
 * - Missing/unknown fields output as empty strings but preserve position
 * - All dates use UTC to ensure consistent formatting
 * - DGIS catalogs (SITIO_OCURRENCIA, AGENTE_LESION, etc.) are stored as numeric codes
 *
 * FIELD STRUCTURE (B013):
 * Pos 1-10: Identificación del Establecimiento
 * Pos 11-30: Identificación del Paciente
 * Pos 31-50: Información del Evento
 * Pos 51-70: Información de Atención
 * Pos 71-78: Profesional Responsable y Metadatos
 */

import { toAAAAMMDD, toHHMM } from '../formatters/date.formatter';
import { toGIISNumeric } from '../formatters/sexo.formatter';
import {
  toGIISString,
  toGIISMultiValue,
  joinGIISFields,
  formatCURP,
  formatCLUES,
  formatCIE10,
  padNumber,
} from '../formatters/field.formatter';

/**
 * Lesion document interface (from internal schema)
 */
interface LesionDoc {
  folio?: string;
  curpPaciente?: string;
  fechaNacimiento?: Date;
  sexo?: number;
  fechaEvento?: Date;
  horaEvento?: string;
  sitioOcurrencia?: number;
  intencionalidad?: number;
  agenteLesion?: number;
  tipoViolencia?: number[];
  fechaAtencion?: Date;
  horaAtencion?: string;
  tipoAtencion?: number[];
  areaAnatomica?: number;
  consecuenciaGravedad?: number;
  codigoCIEAfeccionPrincipal?: string;
  codigoCIECausaExterna?: string;
  afeccionesTratadas?: string[];
  responsableAtencion?: number;
  curpResponsable?: string;
  estado?: string;
  fechaFinalizacion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Trabajador document interface (linked)
 */
interface TrabajadorDoc {
  curp?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: Date;
  sexo?: string;
  entidadNacimiento?: string;
  nacionalidad?: string;
}

/**
 * ProveedorSalud document interface (linked)
 */
interface ProveedorDoc {
  clues?: string;
  pais?: string;
  nombre?: string;
  entidadFederativa?: string;
  municipio?: string;
}

/**
 * Transform a Lesion document to GIIS-B013 pipe-delimited format
 *
 * @param lesionDoc - Internal Lesion document
 * @param trabajadorDoc - Linked Trabajador document
 * @param proveedorDoc - Linked ProveedorSalud document
 * @returns Pipe-delimited string with 78+ fields
 */
export function transformLesionToGIIS(
  lesionDoc: LesionDoc,
  trabajadorDoc: TrabajadorDoc | null,
  proveedorDoc: ProveedorDoc | null,
): string {
  // Build fields array with exact positions
  const fields: (string | number | null | undefined)[] = [];

  // ===== SECCIÓN 1: IDENTIFICACIÓN DEL ESTABLECIMIENTO (1-10) =====
  // 1. CLUES del establecimiento (desde ProveedorSalud)
  fields.push(formatCLUES(proveedorDoc?.clues));
  // 2. Folio del registro
  fields.push(padNumber(lesionDoc.folio, 8));
  // 3. Entidad federativa (derivado de CLUES)
  fields.push(proveedorDoc?.entidadFederativa || '');
  // 4. Jurisdicción sanitaria (no capturado)
  fields.push('');
  // 5. Municipio
  fields.push(proveedorDoc?.municipio || '');
  // 6. Localidad (no capturado)
  fields.push('');
  // 7. Institución (no capturado - derivable de CLUES)
  fields.push('');
  // 8. Tipo de establecimiento (no capturado)
  fields.push('');
  // 9. Nombre del establecimiento
  fields.push(proveedorDoc?.nombre || '');
  // 10. Clave del establecimiento (redundante con CLUES)
  fields.push(formatCLUES(proveedorDoc?.clues));

  // ===== SECCIÓN 2: IDENTIFICACIÓN DEL PACIENTE (11-30) =====
  // 11. CURP del paciente
  fields.push(formatCURP(lesionDoc.curpPaciente || trabajadorDoc?.curp));
  // 12. Primer apellido
  fields.push(trabajadorDoc?.primerApellido || '');
  // 13. Segundo apellido
  fields.push(trabajadorDoc?.segundoApellido || '');
  // 14. Nombre(s)
  fields.push(trabajadorDoc?.nombre || '');
  // 15. Fecha de nacimiento (AAAAMMDD)
  fields.push(
    toAAAAMMDD(lesionDoc.fechaNacimiento || trabajadorDoc?.fechaNacimiento),
  );
  // 16. Sexo (1=H, 2=M, 3=Intersexual)
  fields.push(
    lesionDoc.sexo
      ? String(lesionDoc.sexo)
      : toGIISNumeric(trabajadorDoc?.sexo),
  );
  // 17. Entidad de nacimiento (INEGI code)
  fields.push(trabajadorDoc?.entidadNacimiento || '');
  // 18. Nacionalidad (RENAPO code)
  fields.push(trabajadorDoc?.nacionalidad || '');
  // 19. Afiliación/derechohabiencia (no capturado)
  fields.push('');
  // 20. País de residencia (no capturado - asumimos México)
  fields.push('');
  // 21. Entidad de residencia (no capturado)
  fields.push('');
  // 22. Municipio de residencia (no capturado)
  fields.push('');
  // 23. Localidad de residencia (no capturado)
  fields.push('');
  // 24. Calle (no capturado)
  fields.push('');
  // 25. Número exterior (no capturado)
  fields.push('');
  // 26. Número interior (no capturado)
  fields.push('');
  // 27. Colonia (no capturado)
  fields.push('');
  // 28. Código postal (no capturado)
  fields.push('');
  // 29. Teléfono (no capturado)
  fields.push('');
  // 30. Edad en años al momento del evento
  fields.push(
    calculateAge(
      lesionDoc.fechaNacimiento || trabajadorDoc?.fechaNacimiento,
      lesionDoc.fechaEvento,
    ),
  );

  // ===== SECCIÓN 3: INFORMACIÓN DEL EVENTO (31-50) =====
  // 31. Fecha del evento (AAAAMMDD)
  fields.push(toAAAAMMDD(lesionDoc.fechaEvento));
  // 32. Hora del evento (HHMM)
  fields.push(toHHMM(lesionDoc.horaEvento));
  // 33. Sitio de ocurrencia (código DGIS)
  fields.push(toGIISString(lesionDoc.sitioOcurrencia));
  // 34. Intencionalidad (1-4)
  fields.push(toGIISString(lesionDoc.intencionalidad));
  // 35. Agente de lesión (código DGIS)
  fields.push(toGIISString(lesionDoc.agenteLesion));
  // 36. Tipo de violencia (multivalor con &)
  fields.push(toGIISMultiValue(lesionDoc.tipoViolencia));
  // 37. Agresor (no capturado)
  fields.push('');
  // 38. Parentesco del agresor (no capturado)
  fields.push('');
  // 39. Sexo del agresor (no capturado)
  fields.push('');
  // 40. Edad del agresor (no capturado)
  fields.push('');
  // 41. Bajo efectos de alcohol/drogas (no capturado)
  fields.push('');
  // 42. Embarazo (no capturado)
  fields.push('');
  // 43. Condición de embarazo (no capturado)
  fields.push('');
  // 44. Discapacidad previa (no capturado)
  fields.push('');
  // 45. Antecedentes de violencia (no capturado)
  fields.push('');
  // 46. Consecuencias psicológicas (no capturado)
  fields.push('');
  // 47. Denuncia presentada (no capturado)
  fields.push('');
  // 48. Referencia a otra instancia (no capturado)
  fields.push('');
  // 49. Seguimiento (no capturado)
  fields.push('');
  // 50. Observaciones del evento (no capturado)
  fields.push('');

  // ===== SECCIÓN 4: INFORMACIÓN DE ATENCIÓN (51-70) =====
  // 51. Fecha de atención (AAAAMMDD)
  fields.push(toAAAAMMDD(lesionDoc.fechaAtencion));
  // 52. Hora de atención (HHMM)
  fields.push(toHHMM(lesionDoc.horaAtencion));
  // 53. Tipo de atención (multivalor con &)
  fields.push(toGIISMultiValue(lesionDoc.tipoAtencion));
  // 54. Área anatómica afectada (código DGIS)
  fields.push(toGIISString(lesionDoc.areaAnatomica));
  // 55. Consecuencia/gravedad (código DGIS)
  fields.push(toGIISString(lesionDoc.consecuenciaGravedad));
  // 56. Código CIE-10 afección principal
  fields.push(formatCIE10(lesionDoc.codigoCIEAfeccionPrincipal));
  // 57. Descripción afección principal (no capturado - derivable de CIE)
  fields.push('');
  // 58. Código CIE-10 causa externa
  fields.push(formatCIE10(lesionDoc.codigoCIECausaExterna));
  // 59. Descripción causa externa (no capturado)
  fields.push('');
  // 60. Afecciones tratadas / diagnósticos secundarios
  fields.push(toGIISMultiValue(lesionDoc.afeccionesTratadas));
  // 61. Destino del paciente (no capturado)
  fields.push('');
  // 62. Motivo de egreso (no capturado)
  fields.push('');
  // 63. Días de incapacidad (no capturado)
  fields.push('');
  // 64. Pronóstico (no capturado)
  fields.push('');
  // 65. Plan de tratamiento (no capturado)
  fields.push('');
  // 66. Medicamentos prescritos (no capturado)
  fields.push('');
  // 67. Referencia a especialidad (no capturado)
  fields.push('');
  // 68. Cita de seguimiento (no capturado)
  fields.push('');
  // 69. Notas de evolución (no capturado)
  fields.push('');
  // 70. Observaciones de atención (no capturado)
  fields.push('');

  // ===== SECCIÓN 5: PROFESIONAL RESPONSABLE Y METADATOS (71-78) =====
  // 71. Responsable de atención (1=Médico, 2=Psicólogo, 3=TS)
  fields.push(toGIISString(lesionDoc.responsableAtencion));
  // 72. CURP del responsable
  fields.push(formatCURP(lesionDoc.curpResponsable));
  // 73. Nombre del responsable (no capturado)
  fields.push('');
  // 74. Cédula profesional (no capturado)
  fields.push('');
  // 75. Especialidad (no capturado)
  fields.push('');
  // 76. Firma electrónica (no implementado)
  fields.push('');
  // 77. Fecha de captura (createdAt)
  fields.push(toAAAAMMDD(lesionDoc.createdAt));
  // 78. Fecha de última actualización
  fields.push(toAAAAMMDD(lesionDoc.updatedAt || lesionDoc.fechaFinalizacion));

  return joinGIISFields(fields);
}

/**
 * Calculate age in years from birth date to reference date
 */
function calculateAge(
  birthDate: Date | null | undefined,
  referenceDate: Date | null | undefined,
): string {
  if (!birthDate || !referenceDate) return '';

  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);

  if (isNaN(birth.getTime()) || isNaN(reference.getTime())) return '';

  let age = reference.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = reference.getUTCMonth() - birth.getUTCMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && reference.getUTCDate() < birth.getUTCDate())
  ) {
    age--;
  }

  return age >= 0 && age < 150 ? String(age) : '';
}

/**
 * Get the expected field count for GIIS-B013
 */
export function getGIISB013FieldCount(): number {
  return 78;
}

/**
 * Validate a GIIS-B013 record has the correct structure
 */
export function validateGIISB013Record(record: string): {
  isValid: boolean;
  fieldCount: number;
  errors: string[];
} {
  const fields = record.split('|');
  const expectedCount = getGIISB013FieldCount();
  const errors: string[] = [];

  if (fields.length !== expectedCount) {
    errors.push(`Expected ${expectedCount} fields, got ${fields.length}`);
  }

  return {
    isValid: errors.length === 0,
    fieldCount: fields.length,
    errors,
  };
}
