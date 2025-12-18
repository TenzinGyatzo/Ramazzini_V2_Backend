/**
 * NOM-024 Name Format Validation Tests (Task 10)
 *
 * Tests name formatting rules for Trabajador names:
 * - Uppercase normalization
 * - Maximum length (50 characters)
 * - No abbreviations (DR., ING., LIC., SR., SRA., etc.)
 * - No trailing periods
 */

import {
  detectAbbreviations,
  removeAbbreviations,
  validateNameField,
  validateTrabajadorNames,
} from '../../src/utils/name-validator.util';

describe('NOM-024 Name Format Validation (Task 10)', () => {
  describe('Abbreviation Detection', () => {
    it('should detect common title abbreviations', () => {
      expect(detectAbbreviations('DR. JUAN PEREZ')).toContain('DR.');
      expect(detectAbbreviations('ING. CARLOS LOPEZ')).toContain('ING.');
      expect(detectAbbreviations('LIC. MARIA GARCIA')).toContain('LIC.');
    });

    it('should detect honorific abbreviations', () => {
      expect(detectAbbreviations('SR. PEDRO MARTINEZ')).toContain('SR.');
      expect(detectAbbreviations('SRA. ANA RODRIGUEZ')).toContain('SRA.');
      expect(detectAbbreviations('SRTA. LUCIA HERNANDEZ')).toContain('SRTA.');
    });

    it('should detect suffix abbreviations', () => {
      expect(detectAbbreviations('CARLOS PEREZ JR.')).toContain('JR.');
    });

    it('should detect multiple abbreviations', () => {
      const detected = detectAbbreviations('DR. JUAN PEREZ SR.');
      expect(detected).toContain('DR.');
      expect(detected).toContain('SR.');
    });

    it('should return empty array for clean names', () => {
      expect(detectAbbreviations('JUAN PEREZ GONZALEZ')).toHaveLength(0);
      expect(detectAbbreviations('MARIA LOPEZ GARCIA')).toHaveLength(0);
    });

    it('should handle case insensitivity', () => {
      expect(detectAbbreviations('dr. juan perez')).toContain('DR.');
      expect(detectAbbreviations('Dr. Juan Perez')).toContain('DR.');
    });

    it('should handle empty/null input', () => {
      expect(detectAbbreviations('')).toHaveLength(0);
      expect(detectAbbreviations(null as any)).toHaveLength(0);
      expect(detectAbbreviations(undefined as any)).toHaveLength(0);
    });
  });

  describe('Abbreviation Removal', () => {
    it('should remove title abbreviations', () => {
      expect(removeAbbreviations('DR. JUAN PEREZ')).toBe('JUAN PEREZ');
      expect(removeAbbreviations('ING. CARLOS LOPEZ')).toBe('CARLOS LOPEZ');
    });

    it('should remove suffix abbreviations', () => {
      expect(removeAbbreviations('CARLOS PEREZ JR.')).toBe('CARLOS PEREZ');
    });

    it('should remove multiple abbreviations', () => {
      expect(removeAbbreviations('DR. JUAN PEREZ SR.')).toBe('JUAN PEREZ');
    });

    it('should handle clean names (no change)', () => {
      expect(removeAbbreviations('JUAN PEREZ GONZALEZ')).toBe(
        'JUAN PEREZ GONZALEZ',
      );
    });

    it('should handle null/empty input', () => {
      expect(removeAbbreviations('')).toBe('');
      expect(removeAbbreviations(null as any)).toBe('');
    });
  });

  describe('Single Name Field Validation', () => {
    // Note: validateNameField signature is (name, fieldName, maxLength = 50)

    describe('Valid Names', () => {
      it('should pass for valid names', () => {
        const result = validateNameField('JUAN', 'Nombre');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should pass for names at max length', () => {
        const name50 = 'A'.repeat(50);
        const result = validateNameField(name50, 'Nombre');
        expect(result.isValid).toBe(true);
      });

      it('should normalize to uppercase', () => {
        const result = validateNameField('juan', 'Nombre');
        expect(result.normalizedValue).toBe('JUAN');
      });
    });

    describe('Invalid Names', () => {
      it('should fail for names exceeding max length', () => {
        const longName = 'A'.repeat(51);
        const result = validateNameField(longName, 'Nombre');
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('límite'))).toBe(true);
      });

      it('should fail for names with abbreviations', () => {
        const result = validateNameField('DR. JUAN', 'Nombre');
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('abreviaciones'))).toBe(
          true,
        );
      });

      it('should fail for names with trailing periods', () => {
        const result = validateNameField('JUAN.', 'Nombre');
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('punto'))).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        const result = validateNameField('', 'Nombre');
        expect(result.isValid).toBe(true); // Empty is valid (handled separately)
        expect(result.normalizedValue).toBe('');
      });

      it('should handle null', () => {
        const result = validateNameField(null, 'Nombre');
        expect(result.isValid).toBe(true);
        expect(result.normalizedValue).toBe('');
      });

      it('should handle undefined', () => {
        const result = validateNameField(undefined, 'Nombre');
        expect(result.isValid).toBe(true);
        expect(result.normalizedValue).toBe('');
      });

      it('should trim whitespace', () => {
        const result = validateNameField('  JUAN  ', 'Nombre');
        expect(result.normalizedValue).toBe('JUAN');
      });

      it('should accept custom max length', () => {
        const result = validateNameField('ABCDEFGHIJK', 'Nombre', 10);
        expect(result.isValid).toBe(false); // 11 chars > 10 limit
      });
    });

    describe('Accented Characters', () => {
      it('should accept accented characters', () => {
        const result = validateNameField('JOSÉ', 'Nombre');
        expect(result.isValid).toBe(true);
      });

      it('should accept Spanish characters', () => {
        const result = validateNameField('MUÑOZ', 'Nombre');
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('Complete Trabajador Names Validation', () => {
    // Note: validateTrabajadorNames signature is (nombre, primerApellido, segundoApellido)

    describe('Valid Names', () => {
      it('should validate all name fields', () => {
        const result = validateTrabajadorNames('JUAN', 'PEREZ', 'GONZALEZ');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle empty segundo apellido', () => {
        const result = validateTrabajadorNames('JUAN', 'PEREZ', '');
        expect(result.isValid).toBe(true);
      });

      it('should return normalized values', () => {
        const result = validateTrabajadorNames('juan', 'perez', 'gonzalez');
        expect(result.normalized.nombre).toBe('JUAN');
        expect(result.normalized.primerApellido).toBe('PEREZ');
        expect(result.normalized.segundoApellido).toBe('GONZALEZ');
      });
    });

    describe('Invalid Names', () => {
      it('should fail if any field has errors', () => {
        const result = validateTrabajadorNames('DR. JUAN', 'PEREZ', 'GONZALEZ');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should accumulate errors from all fields', () => {
        const result = validateTrabajadorNames(
          'DR. JUAN',
          'PEREZ SR.',
          'GONZALEZ.',
        );
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(3);
      });
    });

    describe('Edge Cases', () => {
      it('should handle null segundo apellido', () => {
        const result = validateTrabajadorNames('JUAN', 'PEREZ', null);
        expect(result.isValid).toBe(true);
      });

      it('should handle accented characters', () => {
        const result = validateTrabajadorNames('JOSÉ', 'GARCÍA', 'MUÑOZ');
        expect(result.isValid).toBe(true);
      });

      it('should handle hyphens in names', () => {
        const result = validateTrabajadorNames(
          'JUAN-CARLOS',
          'DE LA CRUZ',
          'RAMIREZ',
        );
        expect(result.isValid).toBe(true);
      });
    });
  });
});
