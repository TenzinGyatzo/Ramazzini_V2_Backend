import { toGIISHM, toGIISNumeric, toGIISSexo } from './sexo.formatter';

describe('Sexo Formatter', () => {
  describe('toGIISHM', () => {
    it('should map "Masculino" to "H"', () => {
      expect(toGIISHM('Masculino')).toBe('H');
    });

    it('should map "Femenino" to "M"', () => {
      expect(toGIISHM('Femenino')).toBe('M');
    });

    it('should handle case variations', () => {
      expect(toGIISHM('MASCULINO')).toBe('H');
      expect(toGIISHM('masculino')).toBe('H');
      expect(toGIISHM('FEMENINO')).toBe('M');
      expect(toGIISHM('femenino')).toBe('M');
    });

    it('should handle alternative terms', () => {
      expect(toGIISHM('Hombre')).toBe('H');
      expect(toGIISHM('Mujer')).toBe('M');
      expect(toGIISHM('male')).toBe('H');
      expect(toGIISHM('female')).toBe('M');
    });

    it('should handle shorthand', () => {
      expect(toGIISHM('H')).toBe('H');
      expect(toGIISHM('M')).toBe('H'); // 'M' alone maps to male in this context
      expect(toGIISHM('F')).toBe('M');
    });

    it('should return empty string for null', () => {
      expect(toGIISHM(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(toGIISHM(undefined)).toBe('');
    });

    it('should return empty string for unknown values', () => {
      expect(toGIISHM('unknown')).toBe('');
      expect(toGIISHM('Otro')).toBe('');
      expect(toGIISHM('')).toBe('');
    });

    it('should handle whitespace', () => {
      expect(toGIISHM('  Masculino  ')).toBe('H');
      expect(toGIISHM('  Femenino  ')).toBe('M');
    });
  });

  describe('toGIISNumeric', () => {
    it('should map "Masculino" to "1"', () => {
      expect(toGIISNumeric('Masculino')).toBe('1');
    });

    it('should map "Femenino" to "2"', () => {
      expect(toGIISNumeric('Femenino')).toBe('2');
    });

    it('should map "Intersexual" to "3"', () => {
      expect(toGIISNumeric('Intersexual')).toBe('3');
    });

    it('should handle case variations', () => {
      expect(toGIISNumeric('MASCULINO')).toBe('1');
      expect(toGIISNumeric('masculino')).toBe('1');
      expect(toGIISNumeric('FEMENINO')).toBe('2');
      expect(toGIISNumeric('intersexual')).toBe('3');
    });

    it('should handle alternative terms', () => {
      expect(toGIISNumeric('Hombre')).toBe('1');
      expect(toGIISNumeric('Mujer')).toBe('2');
      expect(toGIISNumeric('Otro')).toBe('3');
    });

    it('should handle numeric string input', () => {
      expect(toGIISNumeric('1')).toBe('1');
      expect(toGIISNumeric('2')).toBe('2');
      expect(toGIISNumeric('3')).toBe('3');
    });

    it('should return empty string for null', () => {
      expect(toGIISNumeric(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(toGIISNumeric(undefined)).toBe('');
    });

    it('should return empty string for unknown values', () => {
      expect(toGIISNumeric('unknown')).toBe('');
      expect(toGIISNumeric('X')).toBe('');
      expect(toGIISNumeric('')).toBe('');
    });
  });

  describe('toGIISSexo (default)', () => {
    it('should use numeric format by default', () => {
      expect(toGIISSexo('Masculino')).toBe('1');
      expect(toGIISSexo('Femenino')).toBe('2');
      expect(toGIISSexo('Intersexual')).toBe('3');
    });

    it('should be the same as toGIISNumeric', () => {
      expect(toGIISSexo).toBe(toGIISNumeric);
    });
  });
});
