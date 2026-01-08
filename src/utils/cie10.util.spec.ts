import { extractCIE10Code, getCIE10Prefix } from './cie10.util';

describe('CIE10 Utility', () => {
  describe('extractCIE10Code', () => {
    it('should extract code from "C530"', () => {
      const result = extractCIE10Code('C530');
      expect(result).toBe('C530');
    });

    it('should extract code from "C530 - DESCRIPTION"', () => {
      const result = extractCIE10Code('C530 - DESCRIPTION');
      expect(result).toBe('C530');
    });

    it('should extract code from "C53"', () => {
      const result = extractCIE10Code('C53');
      expect(result).toBe('C53');
    });

    it('should extract code from "A30 - LEPRA [ENFERMEDAD DE HANSEN]"', () => {
      const result = extractCIE10Code('A30 - LEPRA [ENFERMEDAD DE HANSEN]');
      expect(result).toBe('A30');
    });

    it('should normalize to uppercase', () => {
      const result = extractCIE10Code('c53');
      expect(result).toBe('C53');
    });

    it('should handle codes with spaces before description', () => {
      const result = extractCIE10Code('C53 - Description');
      expect(result).toBe('C53');
    });

    it('should return empty string for null', () => {
      const result = extractCIE10Code(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = extractCIE10Code(undefined);
      expect(result).toBe('');
    });

    it('should return empty string for empty string', () => {
      const result = extractCIE10Code('');
      expect(result).toBe('');
    });

    it('should return empty string for invalid format', () => {
      const result = extractCIE10Code('INVALID');
      expect(result).toBe('');
    });

    it('should handle codes with dots', () => {
      const result = extractCIE10Code('C50.9 - Description');
      expect(result).toBe('C50');
    });
  });

  describe('getCIE10Prefix', () => {
    it('should get prefix from "C530"', () => {
      const result = getCIE10Prefix('C530');
      expect(result).toBe('C53');
    });

    it('should get prefix from "C53"', () => {
      const result = getCIE10Prefix('C53');
      expect(result).toBe('C53');
    });

    it('should get prefix from "A30"', () => {
      const result = getCIE10Prefix('A30');
      expect(result).toBe('A30');
    });

    it('should return null for code shorter than 3 characters', () => {
      const result = getCIE10Prefix('C5');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getCIE10Prefix('');
      expect(result).toBeNull();
    });

    it('should handle "N40X"', () => {
      const result = getCIE10Prefix('N40X');
      expect(result).toBe('N40');
    });
  });
});
