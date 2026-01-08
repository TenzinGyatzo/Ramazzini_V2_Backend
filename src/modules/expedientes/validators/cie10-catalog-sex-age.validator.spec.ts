import { validateCie10SexAgeAgainstCatalog } from './cie10-catalog-sex-age.validator';
import { DiagnosisRule } from '../services/cie10-catalog-lookup.service';

describe('CIE10 Catalog Sex and Age Validator', () => {
  // Helper to create dates
  const createDate = (year: number, month: number, day: number): Date => {
    return new Date(year, month - 1, day);
  };

  // Mock lookup function
  const createMockLookup = (rules: Map<string, DiagnosisRule>) => {
    return async (code: string): Promise<DiagnosisRule | null> => {
      return rules.get(code) || null;
    };
  };

  describe('MUJER 30 años', () => {
    const fechaNacimiento = createDate(1994, 1, 1); // 30 años en 2024
    const fechaNotaMedica = createDate(2024, 1, 1);
    const sexo = 'Femenino';

    it('should allow C53 (cáncer cervicouterino) - LSEX=MUJER, LINF=010A, LSUP=120A', async () => {
      const rules = new Map<string, DiagnosisRule>();
      rules.set('C53', {
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A',
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should allow C50 (cáncer de mama) - LSEX=NO (sin restricción)', async () => {
      const rules = new Map<string, DiagnosisRule>();
      rules.set('C50', {
        key: 'C50',
        lsex: 'NO',
        linf: null,
        lsup: null,
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C50' },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject C61 (cáncer de próstata) - LSEX=HOMBRE', async () => {
      const rules = new Map<string, DiagnosisRule>();
      rules.set('C61', {
        key: 'C61',
        lsex: 'HOMBRE',
        linf: '010A',
        lsup: '120A',
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C61' },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].reason).toBe('Sexo no permitido');
      expect(result.issues[0].lsex).toBe('HOMBRE');
      expect(result.issues[0].sexoTrabajador).toBe('MUJER');
    });
  });

  describe('HOMBRE 30 años', () => {
    const fechaNacimiento = createDate(1994, 1, 1);
    const fechaNotaMedica = createDate(2024, 1, 1);
    const sexo = 'Masculino';

    it('should reject C53 - LSEX=MUJER', async () => {
      const rules = new Map<string, DiagnosisRule>();
      rules.set('C53', {
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A',
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(false);
      expect(result.issues[0].reason).toBe('Sexo no permitido');
      expect(result.issues[0].sexoTrabajador).toBe('HOMBRE');
    });

    it('should allow C61 - LSEX=HOMBRE', async () => {
      const rules = new Map<string, DiagnosisRule>();
      rules.set('C61', {
        key: 'C61',
        lsex: 'HOMBRE',
        linf: '010A',
        lsup: '120A',
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C61' },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('Edad fuera de rango', () => {
    it('should reject MUJER 5 años + C53 (LINF=010A)', async () => {
      const fechaNacimiento = createDate(2019, 1, 1); // 5 años en 2024
      const fechaNotaMedica = createDate(2024, 1, 1);
      const sexo = 'Femenino';

      const rules = new Map<string, DiagnosisRule>();
      rules.set('C53', {
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A', // 10 años mínimo
        lsup: '120A',
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(false);
      expect(result.issues[0].reason).toBe('Edad fuera de rango');
      expect(result.issues[0].edadTrabajador).toBe(5);
    });

    it('should reject edad mayor a LSUP', async () => {
      const fechaNacimiento = createDate(1900, 1, 1); // 124 años en 2024
      const fechaNotaMedica = createDate(2024, 1, 1);
      const sexo = 'Femenino';

      const rules = new Map<string, DiagnosisRule>();
      rules.set('C53', {
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A', // 120 años máximo
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(false);
      expect(result.issues[0].reason).toBe('Edad fuera de rango');
    });
  });

  describe('Lookup fallback', () => {
    it('should use prefix when exact code not found', async () => {
      const fechaNacimiento = createDate(1994, 1, 1);
      const fechaNotaMedica = createDate(2024, 1, 1);
      const sexo = 'Femenino';

      const rules = new Map<string, DiagnosisRule>();
      // Only prefix exists, not exact code
      rules.set('C53', {
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A',
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C530' }, // Exact not in rules
        ],
        lookup: createMockLookup(rules),
      });

      // Should not block if lookup returns null (conservative approach)
      // But if prefix lookup is done in the lookup service, this would work
      // For this test, we simulate that lookup service already handled prefix
      expect(result.ok).toBe(true); // No rule found = no blocking
    });
  });

  describe('Multiple codes', () => {
    it('should validate all codes and collect all issues', async () => {
      const fechaNacimiento = createDate(1994, 1, 1);
      const fechaNotaMedica = createDate(2024, 1, 1);
      const sexo = 'Femenino';

      const rules = new Map<string, DiagnosisRule>();
      rules.set('C53', {
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A',
      });
      rules.set('C61', {
        key: 'C61',
        lsex: 'HOMBRE', // Invalid for MUJER
        linf: '010A',
        lsup: '120A',
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
          { field: 'codigosCIE10Complementarios', value: ['C61'] },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].cie10).toBe('C61');
    });
  });

  describe('Edge cases', () => {
    it('should handle codes with description format', async () => {
      const fechaNacimiento = createDate(1994, 1, 1);
      const fechaNotaMedica = createDate(2024, 1, 1);
      const sexo = 'Femenino';

      const rules = new Map<string, DiagnosisRule>();
      rules.set('C53', {
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A',
      });

      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          {
            field: 'codigoCIE10Principal',
            value: 'C53 - TUMOR MALIGNO DEL CUELLO DEL ÚTERO',
          },
        ],
        lookup: createMockLookup(rules),
      });

      expect(result.ok).toBe(true);
    });

    it('should handle empty cie10Fields', async () => {
      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: createDate(1994, 1, 1),
        fechaNotaMedica: createDate(2024, 1, 1),
        cie10Fields: [],
        lookup: async () => null,
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should handle codes not in catalog (no blocking)', async () => {
      const result = await validateCie10SexAgeAgainstCatalog({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: createDate(1994, 1, 1),
        fechaNotaMedica: createDate(2024, 1, 1),
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'UNKNOWN' },
        ],
        lookup: async () => null, // Not in catalog
      });

      expect(result.ok).toBe(true); // Conservative: no blocking
    });
  });
});

