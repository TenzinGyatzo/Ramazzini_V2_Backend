/**
 * Vital Signs Test Fixtures
 *
 * Sample data for testing vital signs validation (Task 11).
 */

/**
 * Valid vital signs within normal ranges
 */
export const validVitalSigns = {
  tensionArterialSistolica: 120,
  tensionArterialDiastolica: 80,
  frecuenciaCardiaca: 72,
  frecuenciaRespiratoria: 16,
  temperatura: 36.5,
  saturacionOxigeno: 98,
  peso: 70,
  altura: 1.75,
  imc: 22.86,
};

/**
 * Vital signs at lower boundary (still valid)
 */
export const vitalSignsLowerBoundary = {
  tensionArterialSistolica: 60,
  tensionArterialDiastolica: 30,
  frecuenciaCardiaca: 30,
  frecuenciaRespiratoria: 8,
  temperatura: 34.0,
  saturacionOxigeno: 70,
  peso: 20,
  altura: 0.5,
};

/**
 * Vital signs at upper boundary (still valid)
 */
export const vitalSignsUpperBoundary = {
  tensionArterialSistolica: 250,
  tensionArterialDiastolica: 150,
  frecuenciaCardiaca: 220,
  frecuenciaRespiratoria: 60,
  temperatura: 42.0,
  saturacionOxigeno: 100,
  peso: 300,
  altura: 2.5,
};

/**
 * Vital signs out of valid range (should fail MX validation)
 */
export const vitalSignsOutOfRange = {
  tensionArterialSistolica: 300, // Max is 250
  tensionArterialDiastolica: 200, // Max is 150
  frecuenciaCardiaca: 250, // Max is 220
  frecuenciaRespiratoria: 70, // Max is 60
  temperatura: 45.0, // Max is 42.0
  saturacionOxigeno: 110, // Max is 100
  peso: 500, // Max is 300
  altura: 3.0, // Max is 2.5
};

/**
 * Blood pressure with consistency error (systolic <= diastolic)
 */
export const bpInconsistent = {
  tensionArterialSistolica: 80,
  tensionArterialDiastolica: 100, // Higher than systolic
};

/**
 * Blood pressure with very low pulse pressure (warning)
 */
export const bpLowPulsePressure = {
  tensionArterialSistolica: 100,
  tensionArterialDiastolica: 90, // Pulse pressure = 10 (< 20)
};

/**
 * Blood pressure with very high pulse pressure (warning)
 */
export const bpHighPulsePressure = {
  tensionArterialSistolica: 200,
  tensionArterialDiastolica: 80, // Pulse pressure = 120 (> 100)
};

/**
 * Anthropometric data with IMC mismatch
 */
export const anthropometricIMCMismatch = {
  peso: 70,
  altura: 1.75,
  imc: 30.0, // Calculated should be ~22.86
};

/**
 * Partial vital signs (only some fields)
 */
export const partialVitalSigns = {
  tensionArterialSistolica: 120,
  tensionArterialDiastolica: 80,
  // Other fields not provided
};

/**
 * CertificadoExpedito style vital signs (different field names)
 */
export const certificadoExpeditioVitals = {
  peso: 75,
  altura: 1.8,
  temperaturaCorporal: 36.8,
  pulso: 68, // Instead of frecuenciaCardiaca
};
