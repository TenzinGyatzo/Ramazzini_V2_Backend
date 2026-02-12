/**
 * Unit tests for CIE-10 lesion/causa-externa classification (GIIS-B013).
 */

import {
  extractCieCode,
  isCieAfeccionLesion,
  isCieCausaExterna,
} from './cie-lesion.utils';

describe('cie-lesion.utils', () => {
  describe('extractCieCode', () => {
    it('extracts code from "CODE - DESCRIPTION"', () => {
      expect(extractCieCode('S00 - TRAUMATISMO')).toBe('S00');
      expect(extractCieCode('W01 - CAIDA')).toBe('W01');
    });
    it('returns as-is when no dash', () => {
      expect(extractCieCode('S00')).toBe('S00');
      expect(extractCieCode('V99')).toBe('V99');
    });
    it('returns empty for null/undefined', () => {
      expect(extractCieCode(null)).toBe('');
      expect(extractCieCode(undefined)).toBe('');
    });
  });

  describe('isCieAfeccionLesion', () => {
    it('returns true for Cap. XIX S00-S99', () => {
      expect(isCieAfeccionLesion('S00')).toBe(true);
      expect(isCieAfeccionLesion('S009')).toBe(true);
      expect(isCieAfeccionLesion('S99')).toBe(true);
    });
    it('returns true for Cap. XIX T00-T98', () => {
      expect(isCieAfeccionLesion('T00')).toBe(true);
      expect(isCieAfeccionLesion('T98')).toBe(true);
    });
    it('returns false for non-lesion codes', () => {
      expect(isCieAfeccionLesion('A04')).toBe(false);
      expect(isCieAfeccionLesion('R69X')).toBe(false);
      expect(isCieAfeccionLesion('V01')).toBe(false);
    });
    it('returns false for empty/null', () => {
      expect(isCieAfeccionLesion('')).toBe(false);
      expect(isCieAfeccionLesion(null)).toBe(false);
    });
  });

  describe('isCieCausaExterna', () => {
    it('returns true for V01-V99, W00-W99, X00-X99, Y00-Y98', () => {
      expect(isCieCausaExterna('V01')).toBe(true);
      expect(isCieCausaExterna('W17')).toBe(true);
      expect(isCieCausaExterna('X00')).toBe(true);
      expect(isCieCausaExterna('Y98')).toBe(true);
    });
    it('returns false for lesion codes', () => {
      expect(isCieCausaExterna('S00')).toBe(false);
      expect(isCieCausaExterna('T98')).toBe(false);
    });
    it('returns false for empty/null', () => {
      expect(isCieCausaExterna('')).toBe(false);
      expect(isCieCausaExterna(null)).toBe(false);
    });
  });
});
