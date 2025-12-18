/**
 * NOM-024 / GIIS Vital Signs Validator Utility
 *
 * Validates vital signs ranges and physiological consistency.
 * Enforces NOM-024 compliant ranges for Mexican providers.
 */

/**
 * NOM-024 / GIIS aligned vital signs ranges
 * These ranges represent physiologically plausible values for adults
 */
export const VITAL_SIGNS_RANGES = {
  // Blood Pressure (mmHg)
  tensionArterialSistolica: { min: 60, max: 250, unit: 'mmHg' },
  tensionArterialDiastolica: { min: 30, max: 150, unit: 'mmHg' },

  // Heart Rate (bpm)
  frecuenciaCardiaca: { min: 30, max: 220, unit: 'lpm' },
  pulso: { min: 30, max: 220, unit: 'lpm' },

  // Respiratory Rate (rpm)
  frecuenciaRespiratoria: { min: 8, max: 60, unit: 'rpm' },

  // Temperature (°C)
  temperatura: { min: 34.0, max: 42.0, unit: '°C' },
  temperaturaCorporal: { min: 34.0, max: 42.0, unit: '°C' },

  // Oxygen Saturation (%)
  saturacionOxigeno: { min: 70, max: 100, unit: '%' },

  // Weight (kg)
  peso: { min: 20, max: 300, unit: 'kg' },

  // Height (m)
  altura: { min: 0.5, max: 2.5, unit: 'm' },

  // IMC / BMI (kg/m²)
  imc: { min: 10, max: 70, unit: 'kg/m²' },
};

export interface VitalSignsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a single vital sign value against NOM-024 ranges
 *
 * @param fieldName - Name of the vital sign field
 * @param value - Value to validate
 * @returns Validation result with errors/warnings
 */
export function validateVitalSignRange(
  fieldName: string,
  value: number | undefined | null,
): VitalSignsValidationResult {
  const result: VitalSignsValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Skip if no value provided (optional fields)
  if (value === undefined || value === null) {
    return result;
  }

  // Get range configuration for this field
  const range = VITAL_SIGNS_RANGES[fieldName];
  if (!range) {
    // Unknown field - skip validation
    return result;
  }

  // Validate against range
  if (typeof value !== 'number' || isNaN(value)) {
    result.isValid = false;
    result.errors.push(`${fieldName} debe ser un número válido`);
    return result;
  }

  if (value < range.min) {
    result.isValid = false;
    result.errors.push(
      `${fieldName} (${value} ${range.unit}) está por debajo del rango mínimo permitido (${range.min} ${range.unit})`,
    );
  }

  if (value > range.max) {
    result.isValid = false;
    result.errors.push(
      `${fieldName} (${value} ${range.unit}) excede el rango máximo permitido (${range.max} ${range.unit})`,
    );
  }

  return result;
}

/**
 * Validates blood pressure consistency
 * Systolic must be greater than diastolic
 *
 * @param sistolica - Systolic blood pressure
 * @param diastolica - Diastolic blood pressure
 * @returns Validation result
 */
export function validateBloodPressureConsistency(
  sistolica: number | undefined | null,
  diastolica: number | undefined | null,
): VitalSignsValidationResult {
  const result: VitalSignsValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Skip if either value is missing
  if (
    sistolica === undefined ||
    sistolica === null ||
    diastolica === undefined ||
    diastolica === null
  ) {
    return result;
  }

  // Systolic must be greater than diastolic
  if (sistolica <= diastolica) {
    result.isValid = false;
    result.errors.push(
      `Tensión arterial inconsistente: sistólica (${sistolica}) debe ser mayor que diastólica (${diastolica})`,
    );
  }

  // Typical pulse pressure check (warning only)
  const pulsePressure = sistolica - diastolica;
  if (pulsePressure < 20) {
    result.warnings.push(
      `Presión de pulso muy baja (${pulsePressure} mmHg). Verifique los valores de tensión arterial.`,
    );
  } else if (pulsePressure > 100) {
    result.warnings.push(
      `Presión de pulso muy alta (${pulsePressure} mmHg). Verifique los valores de tensión arterial.`,
    );
  }

  return result;
}

/**
 * Validates weight/height/IMC consistency
 * If all three are provided, validates IMC calculation
 *
 * @param peso - Weight in kg
 * @param altura - Height in meters
 * @param imc - Body Mass Index
 * @returns Validation result
 */
export function validateAnthropometricConsistency(
  peso: number | undefined | null,
  altura: number | undefined | null,
  imc: number | undefined | null,
): VitalSignsValidationResult {
  const result: VitalSignsValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Validate individual ranges
  const pesoValidation = validateVitalSignRange('peso', peso);
  const alturaValidation = validateVitalSignRange('altura', altura);
  const imcValidation = validateVitalSignRange('imc', imc);

  result.errors.push(
    ...pesoValidation.errors,
    ...alturaValidation.errors,
    ...imcValidation.errors,
  );
  result.warnings.push(
    ...pesoValidation.warnings,
    ...alturaValidation.warnings,
    ...imcValidation.warnings,
  );

  if (
    pesoValidation.errors.length > 0 ||
    alturaValidation.errors.length > 0 ||
    imcValidation.errors.length > 0
  ) {
    result.isValid = false;
  }

  // Cross-validate IMC if all values are provided
  if (
    peso !== undefined &&
    peso !== null &&
    altura !== undefined &&
    altura !== null &&
    imc !== undefined &&
    imc !== null
  ) {
    const calculatedIMC = peso / (altura * altura);
    const tolerance = 0.5; // Allow small rounding differences

    if (Math.abs(calculatedIMC - imc) > tolerance) {
      result.warnings.push(
        `IMC proporcionado (${imc}) difiere del calculado (${calculatedIMC.toFixed(1)}). ` +
          `Verifique los valores de peso (${peso} kg) y altura (${altura} m).`,
      );
    }
  }

  return result;
}

/**
 * Complete vital signs validation for medical documents
 *
 * @param vitalSigns - Object containing vital sign values
 * @returns Combined validation result
 */
export function validateVitalSigns(vitalSigns: {
  tensionArterialSistolica?: number;
  tensionArterialDiastolica?: number;
  frecuenciaCardiaca?: number;
  pulso?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  temperaturaCorporal?: number;
  saturacionOxigeno?: number;
  peso?: number;
  altura?: number;
  imc?: number;
}): VitalSignsValidationResult {
  const result: VitalSignsValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Validate individual vital signs ranges
  const fieldsToValidate = [
    'tensionArterialSistolica',
    'tensionArterialDiastolica',
    'frecuenciaCardiaca',
    'pulso',
    'frecuenciaRespiratoria',
    'temperatura',
    'temperaturaCorporal',
    'saturacionOxigeno',
  ];

  for (const field of fieldsToValidate) {
    const fieldValidation = validateVitalSignRange(field, vitalSigns[field]);
    result.errors.push(...fieldValidation.errors);
    result.warnings.push(...fieldValidation.warnings);
    if (!fieldValidation.isValid) {
      result.isValid = false;
    }
  }

  // Validate blood pressure consistency
  const bpValidation = validateBloodPressureConsistency(
    vitalSigns.tensionArterialSistolica,
    vitalSigns.tensionArterialDiastolica,
  );
  result.errors.push(...bpValidation.errors);
  result.warnings.push(...bpValidation.warnings);
  if (!bpValidation.isValid) {
    result.isValid = false;
  }

  // Validate anthropometric data if present
  const anthropometricValidation = validateAnthropometricConsistency(
    vitalSigns.peso,
    vitalSigns.altura,
    vitalSigns.imc,
  );
  result.errors.push(...anthropometricValidation.errors);
  result.warnings.push(...anthropometricValidation.warnings);
  if (!anthropometricValidation.isValid) {
    result.isValid = false;
  }

  return result;
}

/**
 * Extract vital signs from a DTO for validation
 * Works with NotaMedica, CertificadoExpedito, and similar DTOs
 *
 * @param dto - DTO object containing vital signs fields
 * @returns Object with extracted vital signs
 */
export function extractVitalSignsFromDTO(dto: any): {
  tensionArterialSistolica?: number;
  tensionArterialDiastolica?: number;
  frecuenciaCardiaca?: number;
  pulso?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  temperaturaCorporal?: number;
  saturacionOxigeno?: number;
  peso?: number;
  altura?: number;
  imc?: number;
} {
  return {
    tensionArterialSistolica: dto.tensionArterialSistolica,
    tensionArterialDiastolica: dto.tensionArterialDiastolica,
    frecuenciaCardiaca: dto.frecuenciaCardiaca,
    pulso: dto.pulso,
    frecuenciaRespiratoria: dto.frecuenciaRespiratoria,
    temperatura: dto.temperatura,
    temperaturaCorporal: dto.temperaturaCorporal,
    saturacionOxigeno: dto.saturacionOxigeno,
    peso: dto.peso,
    altura: dto.altura,
    imc: dto.imc,
  };
}
