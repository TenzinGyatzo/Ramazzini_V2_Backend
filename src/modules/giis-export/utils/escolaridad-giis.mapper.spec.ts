/**
 * Unit tests for app escolaridad → GIIS catalog key mapping.
 */

import { appEscolaridadToCatalogKey } from './escolaridad-giis.mapper';

describe('escolaridad-giis.mapper', () => {
  describe('appEscolaridadToCatalogKey', () => {
    it('returns 88 for null, undefined, empty string', () => {
      expect(appEscolaridadToCatalogKey(null)).toBe(88);
      expect(appEscolaridadToCatalogKey(undefined)).toBe(88);
      expect(appEscolaridadToCatalogKey('')).toBe(88);
      expect(appEscolaridadToCatalogKey('   ')).toBe(88);
    });

    it('maps Nula to 1 (NINGUNA)', () => {
      expect(appEscolaridadToCatalogKey('Nula')).toBe(1);
      expect(appEscolaridadToCatalogKey('nula')).toBe(1);
    });

    it('maps Primaria to 31 (PRIMARIA COMPLETA)', () => {
      expect(appEscolaridadToCatalogKey('Primaria')).toBe(31);
      expect(appEscolaridadToCatalogKey('primaria')).toBe(31);
    });

    it('maps Secundaria to 51', () => {
      expect(appEscolaridadToCatalogKey('Secundaria')).toBe(51);
    });

    it('maps Preparatoria and Diversificado to 71', () => {
      expect(appEscolaridadToCatalogKey('Preparatoria')).toBe(71);
      expect(appEscolaridadToCatalogKey('Diversificado')).toBe(71);
    });

    it('maps Licenciatura to 81', () => {
      expect(appEscolaridadToCatalogKey('Licenciatura')).toBe(81);
    });

    it('maps Maestría and Doctorado to 101 (POSGRADO COMPLETO)', () => {
      expect(appEscolaridadToCatalogKey('Maestria')).toBe(101);
      expect(appEscolaridadToCatalogKey('Doctorado')).toBe(101);
      // With accent (í): app schema uses "Maestría"; mapper normalizes to maestria
      expect(
        appEscolaridadToCatalogKey(
          'Maestr' + String.fromCharCode(0x00ed) + 'a',
        ),
      ).toBe(101);
    });

    it('returns 88 for unknown value', () => {
      expect(appEscolaridadToCatalogKey('Otro')).toBe(88);
      expect(appEscolaridadToCatalogKey('INVALID')).toBe(88);
    });
  });
});
