/**
 * GIIS-B019 Detección Transformer
 *
 * Transforms internal Ramazzini Deteccion documents to GIIS-B019 pipe-delimited format.
 *
 * GIIS-B019 VERSION: 2023 (Detección Integrada / Tamizaje)
 * FIELD COUNT: 91+ fields (maintaining full field count even if some are empty)
 *
 * NOTES:
 * - Ramazzini is an Occupational Health SIRES, some fields may not apply
 * - Missing/unknown fields output as empty strings but preserve position
 * - All dates use UTC to ensure consistent formatting
 * - DGIS catalogs (TIPO_PERSONAL, SERVICIOS_DET, etc.) stored as numeric codes
 *
 * FIELD STRUCTURE (B019):
 * Pos 1-10: Identificación del Establecimiento
 * Pos 11-30: Identificación del Paciente
 * Pos 31-45: Datos del Servicio
 * Pos 46-60: Mediciones Antropométricas y Vitales
 * Pos 61-75: Resultados de Detecciones Clínicas
 * Pos 76-91: Detecciones Específicas y Metadatos
 */

import { toAAAAMMDD } from '../formatters/date.formatter';
import { toGIISNumeric } from '../formatters/sexo.formatter';
import {
  toGIISString,
  joinGIISFields,
  formatCURP,
  formatCLUES,
  formatResultEnum,
} from '../formatters/field.formatter';

/**
 * Deteccion document interface (from internal schema)
 */
interface DeteccionDoc {
  fechaDeteccion?: Date;
  clues?: string;
  curpPrestador?: string;
  tipoPersonal?: number;
  servicioAtencion?: number;
  primeraVezAnio?: boolean;
  peso?: number;
  talla?: number;
  cintura?: number;
  tensionArterialSistolica?: number;
  tensionArterialDiastolica?: number;
  glucemia?: number;
  tipoMedicionGlucemia?: number;
  depresion?: number;
  ansiedad?: number;
  deterioroMemoria?: number;
  riesgoCaidas?: number;
  alteracionMarcha?: number;
  dependenciaABVD?: number;
  necesitaCuidador?: number;
  riesgoDiabetes?: number;
  riesgoHipertension?: number;
  obesidad?: number;
  dislipidemia?: number;
  consumoAlcohol?: number;
  consumoTabaco?: number;
  consumoDrogas?: number;
  resultadoVIH?: number;
  resultadoSifilis?: number;
  resultadoHepatitisB?: number;
  cancerCervicouterino?: number;
  vph?: number;
  cancerMama?: number;
  hiperplasiaProstatica?: number;
  violenciaMujer?: number;
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
 * Transform a Deteccion document to GIIS-B019 pipe-delimited format
 *
 * @param deteccionDoc - Internal Deteccion document
 * @param trabajadorDoc - Linked Trabajador document
 * @param proveedorDoc - Linked ProveedorSalud document
 * @returns Pipe-delimited string with 91+ fields
 */
export function transformDeteccionToGIIS(
  deteccionDoc: DeteccionDoc,
  trabajadorDoc: TrabajadorDoc | null,
  proveedorDoc: ProveedorDoc | null,
): string {
  // Build fields array with exact positions
  const fields: (string | number | null | undefined)[] = [];

  // ===== SECCIÓN 1: IDENTIFICACIÓN DEL ESTABLECIMIENTO (1-10) =====
  // 1. CLUES del establecimiento
  fields.push(formatCLUES(deteccionDoc.clues || proveedorDoc?.clues));
  // 2. Entidad federativa (derivado de CLUES)
  fields.push(proveedorDoc?.entidadFederativa || '');
  // 3. Jurisdicción sanitaria (no capturado)
  fields.push('');
  // 4. Municipio
  fields.push(proveedorDoc?.municipio || '');
  // 5. Localidad (no capturado)
  fields.push('');
  // 6. Institución (no capturado)
  fields.push('');
  // 7. Tipo de establecimiento (no capturado)
  fields.push('');
  // 8. Nombre del establecimiento
  fields.push(proveedorDoc?.nombre || '');
  // 9. Clave del establecimiento
  fields.push(formatCLUES(deteccionDoc.clues || proveedorDoc?.clues));
  // 10. Fecha de detección (AAAAMMDD)
  fields.push(toAAAAMMDD(deteccionDoc.fechaDeteccion));

  // ===== SECCIÓN 2: IDENTIFICACIÓN DEL PACIENTE (11-30) =====
  // 11. CURP del paciente
  fields.push(formatCURP(trabajadorDoc?.curp));
  // 12. Primer apellido
  fields.push(trabajadorDoc?.primerApellido || '');
  // 13. Segundo apellido
  fields.push(trabajadorDoc?.segundoApellido || '');
  // 14. Nombre(s)
  fields.push(trabajadorDoc?.nombre || '');
  // 15. Fecha de nacimiento (AAAAMMDD)
  fields.push(toAAAAMMDD(trabajadorDoc?.fechaNacimiento));
  // 16. Sexo (1=H, 2=M, 3=Intersexual)
  fields.push(toGIISNumeric(trabajadorDoc?.sexo));
  // 17. Edad en años
  fields.push(
    calculateAge(trabajadorDoc?.fechaNacimiento, deteccionDoc.fechaDeteccion),
  );
  // 18. Entidad de nacimiento
  fields.push(trabajadorDoc?.entidadNacimiento || '');
  // 19. Nacionalidad
  fields.push(trabajadorDoc?.nacionalidad || '');
  // 20. Afiliación/derechohabiencia (no capturado)
  fields.push('');
  // 21. País de residencia (no capturado)
  fields.push('');
  // 22. Entidad de residencia (no capturado)
  fields.push('');
  // 23. Municipio de residencia (no capturado)
  fields.push('');
  // 24. Localidad de residencia (no capturado)
  fields.push('');
  // 25. Calle (no capturado)
  fields.push('');
  // 26. Número exterior (no capturado)
  fields.push('');
  // 27. Número interior (no capturado)
  fields.push('');
  // 28. Colonia (no capturado)
  fields.push('');
  // 29. Código postal (no capturado)
  fields.push('');
  // 30. Teléfono (no capturado)
  fields.push('');

  // ===== SECCIÓN 3: DATOS DEL SERVICIO (31-45) =====
  // 31. Tipo de personal (código DGIS)
  fields.push(toGIISString(deteccionDoc.tipoPersonal));
  // 32. CURP del prestador
  fields.push(formatCURP(deteccionDoc.curpPrestador));
  // 33. Servicio de atención (código DGIS)
  fields.push(toGIISString(deteccionDoc.servicioAtencion));
  // 34. Primera vez en el año
  fields.push(deteccionDoc.primeraVezAnio ? '1' : '0');
  // 35. Motivo de consulta (no capturado - ocupacional)
  fields.push('');
  // 36. Turno (no capturado)
  fields.push('');
  // 37. Consultorio (no capturado)
  fields.push('');
  // 38. Programa (no capturado)
  fields.push('');
  // 39. Estrategia (no capturado)
  fields.push('');
  // 40. Grupo prioritario (no capturado)
  fields.push('');
  // 41. Embarazo actual (no capturado - usar control prenatal)
  fields.push('');
  // 42. Semanas de gestación (no capturado)
  fields.push('');
  // 43. Número de embarazos (no capturado)
  fields.push('');
  // 44. Anticonceptivo usado (no capturado)
  fields.push('');
  // 45. Consentimiento informado (no capturado)
  fields.push('');

  // ===== SECCIÓN 4: MEDICIONES ANTROPOMÉTRICAS Y VITALES (46-60) =====
  // 46. Peso (kg)
  fields.push(formatDecimal(deteccionDoc.peso, 1));
  // 47. Talla (cm)
  fields.push(formatDecimal(deteccionDoc.talla, 1));
  // 48. IMC (calculado)
  fields.push(calculateIMC(deteccionDoc.peso, deteccionDoc.talla));
  // 49. Cintura (cm)
  fields.push(formatDecimal(deteccionDoc.cintura, 1));
  // 50. Tensión arterial sistólica
  fields.push(toGIISString(deteccionDoc.tensionArterialSistolica));
  // 51. Tensión arterial diastólica
  fields.push(toGIISString(deteccionDoc.tensionArterialDiastolica));
  // 52. Glucemia (mg/dL)
  fields.push(toGIISString(deteccionDoc.glucemia));
  // 53. Tipo de medición glucemia (1=Ayuno, 2=Casual)
  fields.push(toGIISString(deteccionDoc.tipoMedicionGlucemia));
  // 54. Colesterol total (no capturado)
  fields.push('');
  // 55. Triglicéridos (no capturado)
  fields.push('');
  // 56. HDL (no capturado)
  fields.push('');
  // 57. LDL (no capturado)
  fields.push('');
  // 58. Hemoglobina glucosilada (no capturado)
  fields.push('');
  // 59. Creatinina (no capturado)
  fields.push('');
  // 60. Frecuencia cardíaca (no capturado)
  fields.push('');

  // ===== SECCIÓN 5: RESULTADOS DE DETECCIONES CLÍNICAS (61-75) =====
  // 61. Detección depresión (0=Positivo, 1=Negativo)
  fields.push(formatResultEnum(deteccionDoc.depresion));
  // 62. Detección ansiedad
  fields.push(formatResultEnum(deteccionDoc.ansiedad));
  // 63. Deterioro de memoria
  fields.push(formatResultEnum(deteccionDoc.deterioroMemoria));
  // 64. Riesgo de caídas
  fields.push(formatResultEnum(deteccionDoc.riesgoCaidas));
  // 65. Alteración de marcha
  fields.push(formatResultEnum(deteccionDoc.alteracionMarcha));
  // 66. Dependencia ABVD
  fields.push(formatResultEnum(deteccionDoc.dependenciaABVD));
  // 67. Necesita cuidador
  fields.push(formatResultEnum(deteccionDoc.necesitaCuidador));
  // 68. Riesgo de diabetes
  fields.push(formatResultEnum(deteccionDoc.riesgoDiabetes));
  // 69. Riesgo de hipertensión
  fields.push(formatResultEnum(deteccionDoc.riesgoHipertension));
  // 70. Obesidad
  fields.push(formatResultEnum(deteccionDoc.obesidad));
  // 71. Dislipidemia
  fields.push(formatResultEnum(deteccionDoc.dislipidemia));
  // 72. Consumo de alcohol
  fields.push(formatResultEnum(deteccionDoc.consumoAlcohol));
  // 73. Consumo de tabaco
  fields.push(formatResultEnum(deteccionDoc.consumoTabaco));
  // 74. Consumo de drogas
  fields.push(formatResultEnum(deteccionDoc.consumoDrogas));
  // 75. Riesgo cardiovascular (no capturado - calculado)
  fields.push('');

  // ===== SECCIÓN 6: DETECCIONES ESPECÍFICAS Y METADATOS (76-91) =====
  // 76. Resultado VIH
  fields.push(toGIISString(deteccionDoc.resultadoVIH));
  // 77. Resultado sífilis
  fields.push(toGIISString(deteccionDoc.resultadoSifilis));
  // 78. Resultado hepatitis B
  fields.push(toGIISString(deteccionDoc.resultadoHepatitisB));
  // 79. Cáncer cervicouterino
  fields.push(formatResultEnum(deteccionDoc.cancerCervicouterino));
  // 80. VPH
  fields.push(formatResultEnum(deteccionDoc.vph));
  // 81. Cáncer de mama
  fields.push(formatResultEnum(deteccionDoc.cancerMama));
  // 82. Cáncer de próstata / hiperplasia
  fields.push(formatResultEnum(deteccionDoc.hiperplasiaProstatica));
  // 83. Violencia mujer
  fields.push(formatResultEnum(deteccionDoc.violenciaMujer));
  // 84. Tuberculosis (no capturado)
  fields.push('');
  // 85. Lepra (no capturado)
  fields.push('');
  // 86. Chagas (no capturado)
  fields.push('');
  // 87. Dengue (no capturado)
  fields.push('');
  // 88. Chikungunya (no capturado)
  fields.push('');
  // 89. Zika (no capturado)
  fields.push('');
  // 90. Fecha de captura
  fields.push(toAAAAMMDD(deteccionDoc.createdAt));
  // 91. Fecha de última actualización
  fields.push(
    toAAAAMMDD(deteccionDoc.updatedAt || deteccionDoc.fechaFinalizacion),
  );

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
 * Calculate IMC (BMI) from weight (kg) and height (cm)
 */
function calculateIMC(
  peso: number | null | undefined,
  talla: number | null | undefined,
): string {
  if (!peso || !talla || talla <= 0) return '';

  // Convert talla from cm to m
  const tallaM = talla / 100;
  const imc = peso / (tallaM * tallaM);

  return imc > 0 && imc < 100 ? imc.toFixed(1) : '';
}

/**
 * Format a decimal number to specified precision
 */
function formatDecimal(
  value: number | null | undefined,
  decimals: number,
): string {
  if (value === null || value === undefined) return '';
  return value.toFixed(decimals);
}

/**
 * Get the expected field count for GIIS-B019
 */
export function getGIISB019FieldCount(): number {
  return 91;
}

/**
 * Validate a GIIS-B019 record has the correct structure
 */
export function validateGIISB019Record(record: string): {
  isValid: boolean;
  fieldCount: number;
  errors: string[];
} {
  const fields = record.split('|');
  const expectedCount = getGIISB019FieldCount();
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
