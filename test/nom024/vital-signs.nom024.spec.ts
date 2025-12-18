/**
 * NOM-024 Vital Signs Validation Tests (Task 11)
 *
 * Tests vital signs range validation and physiological consistency.
 * Note: The current implementation validates ranges without MX/non-MX distinction.
 * Conditional enforcement is handled at the service layer.
 */

import {
  validateVitalSignRange,
  validateBloodPressureConsistency,
  validateAnthropometricConsistency,
  validateVitalSigns,
  extractVitalSignsFromDTO,
  VITAL_SIGNS_RANGES,
} from '../../src/utils/vital-signs-validator.util';

import * as vitalSignsFixtures from '../fixtures/vital-signs.fixtures';

describe('NOM-024 Vital Signs Validation (Task 11)', () => {
  describe('Vital Signs Range Constants', () => {
    it('should have defined ranges for all vital signs', () => {
      const expectedFields = [
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

      expectedFields.forEach((field) => {
        expect(VITAL_SIGNS_RANGES[field]).toBeDefined();
        expect(VITAL_SIGNS_RANGES[field].min).toBeDefined();
        expect(VITAL_SIGNS_RANGES[field].max).toBeDefined();
        expect(VITAL_SIGNS_RANGES[field].unit).toBeDefined();
      });
    });

    it('should have correct range for blood pressure systolic', () => {
      expect(VITAL_SIGNS_RANGES.tensionArterialSistolica.min).toBe(60);
      expect(VITAL_SIGNS_RANGES.tensionArterialSistolica.max).toBe(250);
    });

    it('should have correct range for blood pressure diastolic', () => {
      expect(VITAL_SIGNS_RANGES.tensionArterialDiastolica.min).toBe(30);
      expect(VITAL_SIGNS_RANGES.tensionArterialDiastolica.max).toBe(150);
    });

    it('should have correct range for temperature', () => {
      expect(VITAL_SIGNS_RANGES.temperatura.min).toBe(34.0);
      expect(VITAL_SIGNS_RANGES.temperatura.max).toBe(42.0);
    });
  });

  describe('Individual Vital Sign Range Validation', () => {
    describe('Valid Values', () => {
      it('should pass for valid blood pressure systolic', () => {
        const result = validateVitalSignRange('tensionArterialSistolica', 120);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should pass for valid temperature', () => {
        const result = validateVitalSignRange('temperatura', 36.5);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should pass for valid weight', () => {
        const result = validateVitalSignRange('peso', 70);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Boundary Values', () => {
      it('should pass for lower boundary systolic BP', () => {
        const result = validateVitalSignRange('tensionArterialSistolica', 60);
        expect(result.isValid).toBe(true);
      });

      it('should pass for upper boundary systolic BP', () => {
        const result = validateVitalSignRange('tensionArterialSistolica', 250);
        expect(result.isValid).toBe(true);
      });

      it('should pass for lower boundary temperature', () => {
        const result = validateVitalSignRange('temperatura', 34.0);
        expect(result.isValid).toBe(true);
      });

      it('should pass for upper boundary temperature', () => {
        const result = validateVitalSignRange('temperatura', 42.0);
        expect(result.isValid).toBe(true);
      });
    });

    describe('Out of Range Values', () => {
      it('should fail for systolic BP below minimum', () => {
        const result = validateVitalSignRange('tensionArterialSistolica', 50);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should fail for systolic BP above maximum', () => {
        const result = validateVitalSignRange('tensionArterialSistolica', 300);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should fail for temperature below minimum', () => {
        const result = validateVitalSignRange('temperatura', 30);
        expect(result.isValid).toBe(false);
      });

      it('should fail for temperature above maximum', () => {
        const result = validateVitalSignRange('temperatura', 45);
        expect(result.isValid).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle undefined values', () => {
        const result = validateVitalSignRange(
          'tensionArterialSistolica',
          undefined,
        );
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle null values', () => {
        const result = validateVitalSignRange('tensionArterialSistolica', null);
        expect(result.isValid).toBe(true);
      });

      it('should handle NaN values', () => {
        const result = validateVitalSignRange('tensionArterialSistolica', NaN);
        expect(result.isValid).toBe(false);
      });

      it('should handle unknown field names', () => {
        const result = validateVitalSignRange('unknownField', 100);
        expect(result.isValid).toBe(true); // No range defined = valid
      });
    });
  });

  describe('Blood Pressure Consistency', () => {
    it('should pass for consistent BP (systolic > diastolic)', () => {
      const result = validateBloodPressureConsistency(120, 80);
      expect(result.isValid).toBe(true);
    });

    it('should fail if systolic <= diastolic', () => {
      const result = validateBloodPressureConsistency(80, 100);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('sistólica'))).toBe(true);
    });

    it('should fail if systolic equals diastolic', () => {
      const result = validateBloodPressureConsistency(100, 100);
      expect(result.isValid).toBe(false);
    });

    it('should warn for very low pulse pressure', () => {
      const result = validateBloodPressureConsistency(100, 90); // PP = 10
      expect(result.warnings.some((w) => w.includes('pulso muy baja'))).toBe(
        true,
      );
    });

    it('should warn for very high pulse pressure', () => {
      const result = validateBloodPressureConsistency(200, 80); // PP = 120
      expect(result.warnings.some((w) => w.includes('pulso muy alta'))).toBe(
        true,
      );
    });

    describe('Edge Cases', () => {
      it('should handle missing systolic', () => {
        const result = validateBloodPressureConsistency(undefined, 80);
        expect(result.isValid).toBe(true);
      });

      it('should handle missing diastolic', () => {
        const result = validateBloodPressureConsistency(120, undefined);
        expect(result.isValid).toBe(true);
      });

      it('should handle both missing', () => {
        const result = validateBloodPressureConsistency(undefined, undefined);
        expect(result.isValid).toBe(true);
      });

      it('should handle null values', () => {
        const result = validateBloodPressureConsistency(null, null);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Anthropometric Consistency', () => {
    it('should pass for consistent peso/altura/imc', () => {
      // peso=70, altura=1.75 => IMC ≈ 22.86
      const result = validateAnthropometricConsistency(70, 1.75, 22.86);
      expect(result.isValid).toBe(true);
    });

    it('should warn for IMC mismatch', () => {
      // peso=70, altura=1.75 => IMC ≈ 22.86, but provided 30.0
      const result = validateAnthropometricConsistency(70, 1.75, 30.0);
      expect(result.warnings.some((w) => w.includes('IMC'))).toBe(true);
    });

    it('should handle missing IMC', () => {
      const result = validateAnthropometricConsistency(70, 1.75, undefined);
      expect(result.isValid).toBe(true);
    });

    it('should fail for out-of-range peso', () => {
      const result = validateAnthropometricConsistency(500, 1.75, undefined);
      expect(result.isValid).toBe(false);
    });

    it('should fail for out-of-range altura', () => {
      const result = validateAnthropometricConsistency(70, 3.0, undefined);
      expect(result.isValid).toBe(false);
    });

    it('should handle missing peso', () => {
      const result = validateAnthropometricConsistency(undefined, 1.75, 22.0);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Complete Vital Signs Validation', () => {
    it('should validate all vital signs from valid fixture', () => {
      const result = validateVitalSigns(vitalSignsFixtures.validVitalSigns);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept lower boundary values', () => {
      const result = validateVitalSigns(
        vitalSignsFixtures.vitalSignsLowerBoundary,
      );
      expect(result.isValid).toBe(true);
    });

    it('should accept upper boundary values', () => {
      const result = validateVitalSigns(
        vitalSignsFixtures.vitalSignsUpperBoundary,
      );
      expect(result.isValid).toBe(true);
    });

    it('should fail for out-of-range values', () => {
      const result = validateVitalSigns(
        vitalSignsFixtures.vitalSignsOutOfRange,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect BP inconsistency', () => {
      const result = validateVitalSigns(vitalSignsFixtures.bpInconsistent);
      expect(result.isValid).toBe(false);
    });

    it('should handle partial vital signs', () => {
      const result = validateVitalSigns(vitalSignsFixtures.partialVitalSigns);
      expect(result.isValid).toBe(true);
    });

    it('should detect low pulse pressure warning', () => {
      const result = validateVitalSigns(vitalSignsFixtures.bpLowPulsePressure);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should detect high pulse pressure warning', () => {
      const result = validateVitalSigns(vitalSignsFixtures.bpHighPulsePressure);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should detect IMC mismatch warning', () => {
      const result = validateVitalSigns(
        vitalSignsFixtures.anthropometricIMCMismatch,
      );
      expect(result.warnings.some((w) => w.includes('IMC'))).toBe(true);
    });
  });

  describe('DTO Field Extraction', () => {
    it('should extract standard vital signs fields', () => {
      const dto = {
        tensionArterialSistolica: 120,
        tensionArterialDiastolica: 80,
        frecuenciaCardiaca: 72,
        temperatura: 36.5,
        saturacionOxigeno: 98,
      };
      const extracted = extractVitalSignsFromDTO(dto);
      expect(extracted.tensionArterialSistolica).toBe(120);
      expect(extracted.tensionArterialDiastolica).toBe(80);
      expect(extracted.frecuenciaCardiaca).toBe(72);
      expect(extracted.temperatura).toBe(36.5);
      expect(extracted.saturacionOxigeno).toBe(98);
    });

    it('should extract anthropometric fields', () => {
      const dto = {
        peso: 75,
        altura: 1.8,
        imc: 23.15,
      };
      const extracted = extractVitalSignsFromDTO(dto);
      expect(extracted.peso).toBe(75);
      expect(extracted.altura).toBe(1.8);
      expect(extracted.imc).toBe(23.15);
    });

    it('should extract CertificadoExpedito-style fields', () => {
      const dto = vitalSignsFixtures.certificadoExpeditioVitals;
      const extracted = extractVitalSignsFromDTO(dto);
      expect(extracted.peso).toBe(75);
      expect(extracted.altura).toBe(1.8);
      expect(extracted.temperaturaCorporal).toBe(36.8);
      expect(extracted.pulso).toBe(68);
    });

    it('should handle empty DTO', () => {
      const extracted = extractVitalSignsFromDTO({});
      expect(extracted.tensionArterialSistolica).toBeUndefined();
      expect(extracted.peso).toBeUndefined();
    });
  });
});
