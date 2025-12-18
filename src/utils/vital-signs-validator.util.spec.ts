import {
  validateVitalSignRange,
  validateBloodPressureConsistency,
  validateAnthropometricConsistency,
  validateVitalSigns,
  extractVitalSignsFromDTO,
  VITAL_SIGNS_RANGES,
} from './vital-signs-validator.util';

describe('Vital Signs Validator Utility', () => {
  describe('validateVitalSignRange', () => {
    it('should validate values within normal range', () => {
      expect(
        validateVitalSignRange('tensionArterialSistolica', 120).isValid,
      ).toBe(true);
      expect(
        validateVitalSignRange('tensionArterialDiastolica', 80).isValid,
      ).toBe(true);
      expect(validateVitalSignRange('frecuenciaCardiaca', 72).isValid).toBe(
        true,
      );
      expect(validateVitalSignRange('frecuenciaRespiratoria', 16).isValid).toBe(
        true,
      );
      expect(validateVitalSignRange('temperatura', 36.5).isValid).toBe(true);
      expect(validateVitalSignRange('saturacionOxigeno', 98).isValid).toBe(
        true,
      );
    });

    it('should reject values below minimum range', () => {
      const result = validateVitalSignRange('tensionArterialSistolica', 50);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('por debajo'))).toBe(true);
    });

    it('should reject values above maximum range', () => {
      const result = validateVitalSignRange('tensionArterialSistolica', 300);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('excede'))).toBe(true);
    });

    it('should pass validation for null/undefined values', () => {
      expect(
        validateVitalSignRange('tensionArterialSistolica', null).isValid,
      ).toBe(true);
      expect(
        validateVitalSignRange('tensionArterialSistolica', undefined).isValid,
      ).toBe(true);
    });

    it('should reject non-numeric values', () => {
      const result = validateVitalSignRange('tensionArterialSistolica', NaN);
      expect(result.isValid).toBe(false);
    });

    it('should skip validation for unknown fields', () => {
      const result = validateVitalSignRange('unknownField', 999);
      expect(result.isValid).toBe(true);
    });

    it('should validate temperature within fever range', () => {
      // Normal temp
      expect(validateVitalSignRange('temperatura', 36.5).isValid).toBe(true);
      // Fever (still valid, just high)
      expect(validateVitalSignRange('temperatura', 39.0).isValid).toBe(true);
      // Hyperthermia (extreme but still physiologically possible)
      expect(validateVitalSignRange('temperatura', 41.5).isValid).toBe(true);
      // Beyond human survival
      expect(validateVitalSignRange('temperatura', 43.0).isValid).toBe(false);
    });

    it('should validate weight within reasonable range', () => {
      expect(validateVitalSignRange('peso', 70).isValid).toBe(true);
      expect(validateVitalSignRange('peso', 150).isValid).toBe(true);
      expect(validateVitalSignRange('peso', 15).isValid).toBe(false);
      expect(validateVitalSignRange('peso', 350).isValid).toBe(false);
    });

    it('should validate height within reasonable range', () => {
      expect(validateVitalSignRange('altura', 1.7).isValid).toBe(true);
      expect(validateVitalSignRange('altura', 2.1).isValid).toBe(true);
      expect(validateVitalSignRange('altura', 0.4).isValid).toBe(false);
      expect(validateVitalSignRange('altura', 2.8).isValid).toBe(false);
    });
  });

  describe('validateBloodPressureConsistency', () => {
    it('should validate normal blood pressure', () => {
      const result = validateBloodPressureConsistency(120, 80);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject when systolic <= diastolic', () => {
      const result = validateBloodPressureConsistency(80, 120);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('sistólica'))).toBe(true);
    });

    it('should reject when systolic equals diastolic', () => {
      const result = validateBloodPressureConsistency(100, 100);
      expect(result.isValid).toBe(false);
    });

    it('should pass when either value is missing', () => {
      expect(validateBloodPressureConsistency(120, null).isValid).toBe(true);
      expect(validateBloodPressureConsistency(null, 80).isValid).toBe(true);
      expect(
        validateBloodPressureConsistency(undefined, undefined).isValid,
      ).toBe(true);
    });

    it('should warn about very low pulse pressure', () => {
      const result = validateBloodPressureConsistency(100, 90);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes('pulso muy baja'))).toBe(
        true,
      );
    });

    it('should warn about very high pulse pressure', () => {
      const result = validateBloodPressureConsistency(200, 60);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes('pulso muy alta'))).toBe(
        true,
      );
    });

    it('should not warn about normal pulse pressure', () => {
      const result = validateBloodPressureConsistency(120, 80); // 40 mmHg pulse pressure
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validateAnthropometricConsistency', () => {
    it('should validate normal anthropometric values', () => {
      const result = validateAnthropometricConsistency(70, 1.75, 22.9);
      expect(result.isValid).toBe(true);
    });

    it('should validate each field individually', () => {
      // Invalid weight
      const result1 = validateAnthropometricConsistency(10, 1.75, 22.9);
      expect(result1.isValid).toBe(false);

      // Invalid height
      const result2 = validateAnthropometricConsistency(70, 0.3, 22.9);
      expect(result2.isValid).toBe(false);

      // Invalid BMI
      const result3 = validateAnthropometricConsistency(70, 1.75, 5);
      expect(result3.isValid).toBe(false);
    });

    it('should warn about IMC mismatch', () => {
      // 70kg / 1.75^2 = 22.9, but we provide 30
      const result = validateAnthropometricConsistency(70, 1.75, 30);
      expect(result.isValid).toBe(true); // Still valid, just warns
      expect(result.warnings.some((w) => w.includes('IMC proporcionado'))).toBe(
        true,
      );
    });

    it('should pass when values are missing', () => {
      expect(validateAnthropometricConsistency(70, null, null).isValid).toBe(
        true,
      );
      expect(validateAnthropometricConsistency(null, 1.75, null).isValid).toBe(
        true,
      );
    });

    it('should not warn when IMC is close to calculated', () => {
      // 70kg / 1.75^2 = 22.86
      const result = validateAnthropometricConsistency(70, 1.75, 22.9);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validateVitalSigns (complete)', () => {
    it('should validate complete set of normal vital signs', () => {
      const result = validateVitalSigns({
        tensionArterialSistolica: 120,
        tensionArterialDiastolica: 80,
        frecuenciaCardiaca: 72,
        frecuenciaRespiratoria: 16,
        temperatura: 36.5,
        saturacionOxigeno: 98,
        peso: 70,
        altura: 1.75,
        imc: 22.9,
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate partial vital signs', () => {
      const result = validateVitalSigns({
        tensionArterialSistolica: 120,
        tensionArterialDiastolica: 80,
      });
      expect(result.isValid).toBe(true);
    });

    it('should validate empty vital signs', () => {
      const result = validateVitalSigns({});
      expect(result.isValid).toBe(true);
    });

    it('should collect all errors from multiple fields', () => {
      const result = validateVitalSigns({
        tensionArterialSistolica: 50, // Below min
        tensionArterialDiastolica: 200, // Above max
        frecuenciaCardiaca: 10, // Below min
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle CertificadoExpedito fields', () => {
      const result = validateVitalSigns({
        peso: 75,
        altura: 1.8,
        tensionArterialSistolica: 130,
        tensionArterialDiastolica: 85,
        frecuenciaCardiaca: 78,
        frecuenciaRespiratoria: 18,
        temperaturaCorporal: 36.8, // Different field name
      });
      expect(result.isValid).toBe(true);
    });

    it('should handle pulso as alternative to frecuenciaCardiaca', () => {
      const result = validateVitalSigns({
        pulso: 72,
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('extractVitalSignsFromDTO', () => {
    it('should extract vital signs from NotaMedica DTO', () => {
      const dto = {
        tipoNota: 'Inicial',
        fechaNotaMedica: new Date(),
        motivoConsulta: 'Consulta de rutina',
        tensionArterialSistolica: 120,
        tensionArterialDiastolica: 80,
        frecuenciaCardiaca: 72,
        temperatura: 36.5,
        saturacionOxigeno: 98,
        diagnostico: 'Sano',
      };

      const vitalSigns = extractVitalSignsFromDTO(dto);
      expect(vitalSigns.tensionArterialSistolica).toBe(120);
      expect(vitalSigns.tensionArterialDiastolica).toBe(80);
      expect(vitalSigns.frecuenciaCardiaca).toBe(72);
      expect(vitalSigns.temperatura).toBe(36.5);
      expect(vitalSigns.saturacionOxigeno).toBe(98);
    });

    it('should extract vital signs from CertificadoExpedito DTO', () => {
      const dto = {
        fechaCertificadoExpedito: new Date(),
        peso: 75,
        altura: 1.8,
        imc: 23.1,
        tensionArterialSistolica: 130,
        tensionArterialDiastolica: 85,
        frecuenciaCardiaca: 78,
        frecuenciaRespiratoria: 18,
        temperaturaCorporal: 36.8,
      };

      const vitalSigns = extractVitalSignsFromDTO(dto);
      expect(vitalSigns.peso).toBe(75);
      expect(vitalSigns.altura).toBe(1.8);
      expect(vitalSigns.imc).toBe(23.1);
      expect(vitalSigns.temperaturaCorporal).toBe(36.8);
    });

    it('should handle missing fields gracefully', () => {
      const dto = {
        tipoNota: 'Inicial',
        fechaNotaMedica: new Date(),
      };

      const vitalSigns = extractVitalSignsFromDTO(dto);
      expect(vitalSigns.tensionArterialSistolica).toBeUndefined();
      expect(vitalSigns.peso).toBeUndefined();
    });
  });

  describe('VITAL_SIGNS_RANGES configuration', () => {
    it('should have ranges for all common vital signs', () => {
      const requiredFields = [
        'tensionArterialSistolica',
        'tensionArterialDiastolica',
        'frecuenciaCardiaca',
        'frecuenciaRespiratoria',
        'temperatura',
        'saturacionOxigeno',
        'peso',
        'altura',
        'imc',
      ];

      requiredFields.forEach((field) => {
        expect(VITAL_SIGNS_RANGES[field]).toBeDefined();
        expect(VITAL_SIGNS_RANGES[field].min).toBeDefined();
        expect(VITAL_SIGNS_RANGES[field].max).toBeDefined();
        expect(VITAL_SIGNS_RANGES[field].unit).toBeDefined();
      });
    });

    it('should have reasonable physiological ranges', () => {
      // Blood pressure
      expect(VITAL_SIGNS_RANGES.tensionArterialSistolica.min).toBeLessThan(80);
      expect(VITAL_SIGNS_RANGES.tensionArterialSistolica.max).toBeGreaterThan(
        200,
      );
      expect(VITAL_SIGNS_RANGES.tensionArterialDiastolica.min).toBeLessThan(50);
      expect(VITAL_SIGNS_RANGES.tensionArterialDiastolica.max).toBeGreaterThan(
        120,
      );

      // Heart rate
      expect(VITAL_SIGNS_RANGES.frecuenciaCardiaca.min).toBeLessThan(50);
      expect(VITAL_SIGNS_RANGES.frecuenciaCardiaca.max).toBeGreaterThan(180);

      // Temperature
      expect(VITAL_SIGNS_RANGES.temperatura.min).toBeLessThan(35);
      expect(VITAL_SIGNS_RANGES.temperatura.max).toBeGreaterThan(40);

      // Oxygen saturation
      expect(VITAL_SIGNS_RANGES.saturacionOxigeno.min).toBeLessThan(90);
      expect(VITAL_SIGNS_RANGES.saturacionOxigeno.max).toBe(100);
    });
  });

  describe('Real-world medical scenarios', () => {
    it('should accept hypertensive patient values', () => {
      const result = validateVitalSigns({
        tensionArterialSistolica: 180,
        tensionArterialDiastolica: 110,
        frecuenciaCardiaca: 90,
      });
      expect(result.isValid).toBe(true);
    });

    it('should accept hypotensive patient values', () => {
      const result = validateVitalSigns({
        tensionArterialSistolica: 90,
        tensionArterialDiastolica: 60,
        frecuenciaCardiaca: 55,
      });
      expect(result.isValid).toBe(true);
    });

    it('should accept febrile patient values', () => {
      const result = validateVitalSigns({
        temperatura: 39.5,
        frecuenciaCardiaca: 110,
        frecuenciaRespiratoria: 24,
      });
      expect(result.isValid).toBe(true);
    });

    it('should accept athlete bradycardia', () => {
      const result = validateVitalSigns({
        frecuenciaCardiaca: 45,
        tensionArterialSistolica: 110,
        tensionArterialDiastolica: 70,
      });
      expect(result.isValid).toBe(true);
    });

    it('should accept obese patient anthropometrics', () => {
      const result = validateVitalSigns({
        peso: 150,
        altura: 1.75,
        imc: 49.0,
      });
      expect(result.isValid).toBe(true);
    });

    it('should reject impossible values', () => {
      // Heart stopped
      const result1 = validateVitalSigns({ frecuenciaCardiaca: 0 });
      expect(result1.isValid).toBe(false);

      // No oxygen
      const result2 = validateVitalSigns({ saturacionOxigeno: 50 });
      expect(result2.isValid).toBe(false);

      // Body temp incompatible with life
      const result3 = validateVitalSigns({ temperatura: 45 });
      expect(result3.isValid).toBe(false);
    });
  });
});
