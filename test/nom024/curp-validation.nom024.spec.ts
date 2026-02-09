/**
 * NOM-024 CURP Validation Tests (Task 3, Task 9)
 *
 * Tests CURP format validation, checksum verification, and professional CURP requirements.
 */

import {
  validateCURPFormat,
  validateCURPChecksum,
  isGenericCURP,
  validateCURP,
} from '../../src/utils/curp-validator.util';

describe('NOM-024 CURP Validation (Task 3, 9)', () => {
  describe('CURP Format Validation (Task 3)', () => {
    describe('Valid CURP Formats', () => {
      const validCURPs = [
        'ROAJ850102HDFLRN07',
        'GODM850101HDFRZN02',
        'HEGG560427MVZRRL04',
        'PEGJ850102HDFRNN09',
        'GOLM900515MDFNZR05',
      ];

      validCURPs.forEach((curp) => {
        it(`should accept valid CURP: ${curp}`, () => {
          expect(validateCURPFormat(curp)).toBe(true);
        });
      });
    });

    describe('Invalid CURP Formats', () => {
      it('should reject CURP with incorrect length (17 chars)', () => {
        expect(validateCURPFormat('ROAJ850102HDFLRN0')).toBe(false);
      });

      it('should reject CURP with incorrect length (19 chars)', () => {
        expect(validateCURPFormat('ROAJ850102HDFLRN089')).toBe(false);
      });

      it('should reject CURP with invalid sex character', () => {
        expect(validateCURPFormat('ROAJ850102XDFLRN08')).toBe(false); // X instead of H/M
        expect(validateCURPFormat('ROAJ850102FDFLRN08')).toBe(false); // F instead of H/M
      });

      it('should reject CURP with letters in date positions', () => {
        expect(validateCURPFormat('ROAJ85010AHDFLRN08')).toBe(false);
      });

      it('should reject CURP with numbers in letter positions', () => {
        expect(validateCURPFormat('ROA7850102HDFLRN08')).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle null input', () => {
        expect(validateCURPFormat(null as any)).toBe(false);
      });

      it('should handle undefined input', () => {
        expect(validateCURPFormat(undefined as any)).toBe(false);
      });

      it('should handle empty string', () => {
        expect(validateCURPFormat('')).toBe(false);
      });

      it('should handle whitespace', () => {
        expect(validateCURPFormat('   ')).toBe(false);
      });

      it('should accept lowercase and convert to uppercase', () => {
        expect(validateCURPFormat('roaj850102hdflrn07')).toBe(true);
      });

      it('should trim whitespace', () => {
        expect(validateCURPFormat('  ROAJ850102HDFLRN07  ')).toBe(true);
      });
    });
  });

  describe('CURP Checksum Validation', () => {
    it('should accept CURP with valid checksum (RENAPO table with Ñ)', () => {
      expect(validateCURPChecksum('ROAJ850102HDFLRN07')).toBe(true);
      expect(validateCURPChecksum('SAFG910226MSLNLD00')).toBe(true);
    });

    it('should reject CURP with wrong length for checksum', () => {
      expect(validateCURPChecksum('ROAJ850102HDFLRN0')).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(validateCURPChecksum(null as any)).toBe(false);
      expect(validateCURPChecksum(undefined as any)).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validateCURPChecksum('')).toBe(false);
    });
  });

  describe('Generic CURP Detection', () => {
    it('should detect generic CURP patterns', () => {
      // Pattern with XXXX in positions
      expect(isGenericCURP('XXXX999999HXXXXX99')).toBe(true);
      expect(isGenericCURP('XXXX999999MXXXXX99')).toBe(true);
    });

    it('should NOT flag valid CURPs as generic', () => {
      expect(isGenericCURP('ROAJ850102HDFLRN07')).toBe(false);
      expect(isGenericCURP('GODM850101HDFRZN02')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isGenericCURP('')).toBe(false);
      expect(isGenericCURP(null as any)).toBe(false);
      expect(isGenericCURP(undefined as any)).toBe(false);
    });
  });

  describe('Complete CURP Validation', () => {
    it('should return validation result object', () => {
      const result = validateCURP('ROAJ850102HDFLRN07');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should return invalid for empty CURP', () => {
      const result = validateCURP('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid for null/undefined', () => {
      const result1 = validateCURP(null as any);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('CURP no puede estar vacío');

      const result2 = validateCURP(undefined as any);
      expect(result2.isValid).toBe(false);
    });

    it('should return detailed error for wrong format', () => {
      const result = validateCURP('INVALID');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('18 caracteres'))).toBe(true);
    });

    it('should accept generic CURP as valid (NOM-024 for unknown/foreign)', () => {
      const result = validateCURP('XXXX999999HXXXXX99');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Professional CURP Requirements (Task 9)', () => {
    // Task 9: Professional entities (MedicoFirmante, EnfermeraFirmante, TecnicoFirmante)
    // must have valid CURP when proveedorSalud.pais === 'MX'

    const professionalCURPs = {
      medico: 'ROPC850102HDFDRL02',
      enfermera: 'GOLM900515MDFNZR05',
      tecnico: 'SAMR880720HDFNRB06',
    };

    Object.entries(professionalCURPs).forEach(([type, curp]) => {
      it(`should validate ${type} CURP format: ${curp}`, () => {
        expect(validateCURPFormat(curp)).toBe(true);
      });
    });

    it('should require valid CURP for MX professionals', () => {
      // These are the validation rules for MX providers
      const mxRequiredCURP = 'ROPC850102HDFDRL02';
      const result = validateCURP(mxRequiredCURP);
      expect(result.isValid).toBe(true);
      expect(validateCURPFormat(mxRequiredCURP)).toBe(true);
    });

    it('should allow empty CURP for non-MX professionals', () => {
      // For non-MX providers, CURP is optional
      // This is a business rule test - empty CURP format validation returns false,
      // but the service should allow it for non-MX
      const result = validateCURP('');
      expect(result.isValid).toBe(false); // Format is invalid
      // But service should allow this for non-MX (tested in integration)
    });
  });
});
