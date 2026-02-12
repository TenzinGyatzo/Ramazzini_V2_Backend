import {
  getCIE10Restriction,
  getPrefixFromCode,
  hasCIE10Restriction,
  RestrictionRule,
} from './cie10-restrictions.util';

describe('CIE10 Restrictions Utility', () => {
  describe('getPrefixFromCode', () => {
    it('should extract prefix from simple code', () => {
      expect(getPrefixFromCode('C50')).toBe('C50');
      expect(getPrefixFromCode('C61')).toBe('C61');
      expect(getPrefixFromCode('N40')).toBe('N40');
      expect(getPrefixFromCode('O00')).toBe('O00');
    });

    it('should extract prefix from code with subcode', () => {
      expect(getPrefixFromCode('C50.9')).toBe('C50');
      expect(getPrefixFromCode('C53.0')).toBe('C53');
      expect(getPrefixFromCode('N40.1')).toBe('N40');
      expect(getPrefixFromCode('O00.0')).toBe('O00');
    });

    it('should extract prefix from code with description', () => {
      expect(getPrefixFromCode('C50 - Neoplasia maligna de mama')).toBe('C50');
      expect(getPrefixFromCode('C53 - Cáncer cervicouterino')).toBe('C53');
      expect(getPrefixFromCode('C61 - Cáncer de próstata')).toBe('C61');
    });

    it('should normalize to uppercase', () => {
      expect(getPrefixFromCode('c50')).toBe('C50');
      expect(getPrefixFromCode('c50.9')).toBe('C50');
      expect(getPrefixFromCode('n40')).toBe('N40');
    });

    it('should return null for invalid codes', () => {
      expect(getPrefixFromCode('')).toBeNull();
      expect(getPrefixFromCode(null)).toBeNull();
      expect(getPrefixFromCode(undefined)).toBeNull();
      expect(getPrefixFromCode('INVALID')).toBeNull();
      expect(getPrefixFromCode('123')).toBeNull();
    });
  });

  describe('getCIE10Restriction', () => {
    it('should return restriction for C50 (cáncer de mama)', () => {
      const restriction = getCIE10Restriction('C50');
      expect(restriction).toBeDefined();
      expect(restriction?.sexoPermitido).toBe('MUJER');
      expect(restriction?.edadMin).toBeUndefined();
      expect(restriction?.edadMax).toBeUndefined();
      expect(restriction?.ruleId).toBe('C3');
    });

    it('should return restriction for C50.9 (código con subcódigo)', () => {
      const restriction = getCIE10Restriction('C50.9');
      expect(restriction).toBeDefined();
      expect(restriction?.sexoPermitido).toBe('MUJER');
      expect(restriction?.ruleId).toBe('C3');
    });

    it('should return restriction for C53 (cáncer cervicouterino)', () => {
      const restriction = getCIE10Restriction('C53');
      expect(restriction).toBeDefined();
      expect(restriction?.sexoPermitido).toBe('MUJER');
      expect(restriction?.edadMin).toBe(25);
      expect(restriction?.edadMax).toBe(64);
      expect(restriction?.ruleId).toBe('C3');
    });

    it('should return restriction for C51-C58 (otros cánceres ginecológicos)', () => {
      expect(getCIE10Restriction('C51')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('C52')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('C54')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('C55')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('C56')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('C57')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('C58')?.sexoPermitido).toBe('MUJER');

      // Verificar que C56 no tiene restricción de edad (como C50)
      expect(getCIE10Restriction('C56')?.edadMin).toBeUndefined();
      expect(getCIE10Restriction('C56')?.edadMax).toBeUndefined();
    });

    it('should return restriction for D06 (neoplasia in situ)', () => {
      const restriction = getCIE10Restriction('D06');
      expect(restriction).toBeDefined();
      expect(restriction?.sexoPermitido).toBe('MUJER');
      expect(restriction?.edadMin).toBe(25);
      expect(restriction?.edadMax).toBe(64);
      expect(restriction?.ruleId).toBe('C3');
    });

    it('should return restriction for C61 (cáncer de próstata)', () => {
      const restriction = getCIE10Restriction('C61');
      expect(restriction).toBeDefined();
      expect(restriction?.sexoPermitido).toBe('HOMBRE');
      expect(restriction?.edadMin).toBe(40);
      expect(restriction?.edadMax).toBeUndefined();
      expect(restriction?.ruleId).toBe('C4');
    });

    it('should return restriction for C60, C62, C63 (otros cánceres de órganos genitales masculinos)', () => {
      expect(getCIE10Restriction('C60')?.sexoPermitido).toBe('HOMBRE');
      expect(getCIE10Restriction('C62')?.sexoPermitido).toBe('HOMBRE');
      expect(getCIE10Restriction('C63')?.sexoPermitido).toBe('HOMBRE');

      // Verificar que no tienen restricción de edad (excepto C61 que ya se probó)
      expect(getCIE10Restriction('C60')?.edadMin).toBeUndefined();
      expect(getCIE10Restriction('C62')?.edadMin).toBeUndefined();
      expect(getCIE10Restriction('C63')?.edadMin).toBeUndefined();
    });

    it('should return restriction for N40 (hiperplasia prostática)', () => {
      const restriction = getCIE10Restriction('N40');
      expect(restriction).toBeDefined();
      expect(restriction?.sexoPermitido).toBe('HOMBRE');
      expect(restriction?.edadMin).toBe(40);
      expect(restriction?.ruleId).toBe('C4');
    });

    it('should return restriction for N41-N51 (otros trastornos masculinos)', () => {
      expect(getCIE10Restriction('N41')?.sexoPermitido).toBe('HOMBRE');
      expect(getCIE10Restriction('N42')?.sexoPermitido).toBe('HOMBRE');
      expect(getCIE10Restriction('N50')?.sexoPermitido).toBe('HOMBRE');
      expect(getCIE10Restriction('N51')?.sexoPermitido).toBe('HOMBRE');
    });

    it('should return restriction for N70-N98 (trastornos ginecológicos)', () => {
      expect(getCIE10Restriction('N70')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('N80')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('N95')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('N98')?.sexoPermitido).toBe('MUJER');
    });

    it('should return restriction for O00-O99 (embarazo)', () => {
      expect(getCIE10Restriction('O00')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('O50')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('O99')?.sexoPermitido).toBe('MUJER');
      expect(getCIE10Restriction('O00')?.edadMin).toBe(10);
      expect(getCIE10Restriction('O99')?.edadMin).toBe(10);
    });

    it('should return null for codes without restrictions', () => {
      expect(getCIE10Restriction('A30')).toBeNull();
      expect(getCIE10Restriction('B20')).toBeNull();
      expect(getCIE10Restriction('I10')).toBeNull();
    });

    it('should handle code with description format', () => {
      const restriction = getCIE10Restriction(
        'C50 - Neoplasia maligna de mama',
      );
      expect(restriction).toBeDefined();
      expect(restriction?.sexoPermitido).toBe('MUJER');
    });

    it('should return null for invalid input', () => {
      expect(getCIE10Restriction('')).toBeNull();
      expect(getCIE10Restriction(null)).toBeNull();
      expect(getCIE10Restriction(undefined)).toBeNull();
    });
  });

  describe('hasCIE10Restriction', () => {
    it('should return true for codes with restrictions', () => {
      expect(hasCIE10Restriction('C50')).toBe(true);
      expect(hasCIE10Restriction('C53')).toBe(true);
      expect(hasCIE10Restriction('C61')).toBe(true);
      expect(hasCIE10Restriction('N40')).toBe(true);
      expect(hasCIE10Restriction('O00')).toBe(true);
    });

    it('should return false for codes without restrictions', () => {
      expect(hasCIE10Restriction('A30')).toBe(false);
      expect(hasCIE10Restriction('B20')).toBe(false);
      expect(hasCIE10Restriction('I10')).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(hasCIE10Restriction('')).toBe(false);
      expect(hasCIE10Restriction(null)).toBe(false);
      expect(hasCIE10Restriction(undefined)).toBe(false);
    });
  });
});
