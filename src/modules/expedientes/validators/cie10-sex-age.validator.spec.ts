import {
  validateNotaMedicaCIE10SexAgeRules,
  CIE10ValidationResult,
} from './cie10-sex-age.validator';

describe('CIE10 Sex and Age Validator', () => {
  // Helper para crear fechas
  const createDate = (year: number, month: number, day: number): Date => {
    return new Date(year, month - 1, day);
  };

  describe('Mujer 30 años', () => {
    const fechaNacimiento = createDate(1994, 1, 1); // 30 años en 2024
    const fechaNotaMedica = createDate(2024, 1, 1);
    const sexo = 'Femenino';

    it('should allow C53 (cáncer cervicouterino) - edad válida 25-64', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should allow C50 (cáncer de mama) - sin restricción de edad', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C50' },
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject C61 (cáncer de próstata) - solo HOMBRE', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C61' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].field).toBe('codigoCIE10Principal');
      expect(result.issues[0].cie10).toBe('C61');
      expect(result.issues[0].ruleId).toBe('C4');
      expect(result.issues[0].sexo).toBe('Femenino');
      expect(result.issues[0].edad).toBe(30);
    });

    it('should reject C56 (cáncer de ovario) - solo MUJER', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Masculino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C56 - Tumor maligno del ovario' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].field).toBe('codigoCIE10Principal');
      expect(result.issues[0].cie10).toBe('C56');
      expect(result.issues[0].ruleId).toBe('C3');
      expect(result.issues[0].sexo).toBe('Masculino');
    });

    it('should reject N40 (hiperplasia prostática) - solo HOMBRE', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'N40' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].ruleId).toBe('C4');
    });
  });

  describe('Mujer 20 años', () => {
    const fechaNacimiento = createDate(2004, 1, 1); // 20 años en 2024
    const fechaNotaMedica = createDate(2024, 1, 1);
    const sexo = 'Femenino';

    it('should reject C53 (cáncer cervicouterino) - edad < 25', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].field).toBe('codigoCIE10Principal');
      expect(result.issues[0].cie10).toBe('C53');
      expect(result.issues[0].ruleId).toBe('C3');
      expect(result.issues[0].edad).toBe(20);
      expect(result.issues[0].reason).toContain('25');
    });

    it('should allow C50 (cáncer de mama) - sin restricción de edad', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C50' },
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Hombre 45 años', () => {
    const fechaNacimiento = createDate(1979, 1, 1); // 45 años en 2024
    const fechaNotaMedica = createDate(2024, 1, 1);
    const sexo = 'Masculino';

    it('should allow C61 (cáncer de próstata) - edad >= 40', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C61' },
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should allow N40 (hiperplasia prostática) - edad >= 40', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'N40' },
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject C50 (cáncer de mama) - solo MUJER', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C50' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].ruleId).toBe('C3');
      expect(result.issues[0].sexo).toBe('Masculino');
    });

    it('should reject O00 (embarazo) - solo MUJER', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'O00' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].ruleId).toBe('C3');
    });

    it('should reject C60 (cáncer de pene) - solo HOMBRE', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C60' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].ruleId).toBe('C4');
      expect(result.issues[0].sexo).toBe('Femenino');
    });

    it('should reject C62 (cáncer de testículo) - solo HOMBRE', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C62' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].ruleId).toBe('C4');
    });
  });

  describe('Hombre 35 años', () => {
    const fechaNacimiento = createDate(1989, 1, 1); // 35 años en 2024
    const fechaNotaMedica = createDate(2024, 1, 1);
    const sexo = 'Masculino';

    it('should reject N40 (hiperplasia prostática) - edad < 40', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'N40' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].field).toBe('codigoCIE10Principal');
      expect(result.issues[0].cie10).toBe('N40');
      expect(result.issues[0].ruleId).toBe('C4');
      expect(result.issues[0].edad).toBe(35);
      expect(result.issues[0].reason).toContain('40');
    });

    it('should reject C61 (cáncer de próstata) - edad < 40', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: sexo,
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C61' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].edad).toBe(35);
    });
  });

  describe('Validación de múltiples campos', () => {
    const fechaNacimiento = createDate(1994, 1, 1);
    const fechaNotaMedica = createDate(2024, 1, 1);

    it('should report only invalid codes when principal is valid and complementary is invalid', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C50' }, // Válido
          { field: 'codigosCIE10Complementarios', value: ['C61'] }, // Inválido (solo HOMBRE)
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].field).toBe('codigosCIE10Complementarios');
      expect(result.issues[0].cie10).toBe('C61');
    });

    it('should report all violations when multiple codes are invalid', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C61' }, // Inválido
          { field: 'codigosCIE10Complementarios', value: ['N40', 'C50'] }, // N40 inválido, C50 válido
          { field: 'codigoCIEDiagnostico2', value: 'O00' }, // Inválido (pero permitido por edad >= 10)
        ],
      });

      expect(result.ok).toBe(false);
      // Debe reportar C61, N40, y O00 (por sexo)
      expect(result.issues.length).toBeGreaterThan(0);
      
      const fields = result.issues.map((i) => i.field);
      expect(fields).toContain('codigoCIE10Principal');
      expect(fields).toContain('codigosCIE10Complementarios');
    });

    it('should validate all fields correctly', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C50' },
          { field: 'codigosCIE10Complementarios', value: ['C53', 'D06'] },
          { field: 'codigoCIEDiagnostico2', value: 'O00' },
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should return ok when no CIE-10 codes are provided', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: createDate(1994, 1, 1),
        fechaNotaMedica: createDate(2024, 1, 1),
        cie10Fields: [],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should return ok when CIE-10 fields are empty', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: createDate(1994, 1, 1),
        fechaNotaMedica: createDate(2024, 1, 1),
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: '' },
          { field: 'codigosCIE10Complementarios', value: [] },
          { field: 'codigoCIEDiagnostico2', value: '' },
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should handle codes without restrictions', () => {
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: createDate(1994, 1, 1),
        fechaNotaMedica: createDate(2024, 1, 1),
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'A30' }, // Sin restricción
        ],
      });

      expect(result.ok).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should use current date when fechaNotaMedica is not provided', () => {
      const fechaNacimiento = createDate(1994, 1, 1);
      // No proporcionar fechaNotaMedica, debería usar fecha actual
      
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C50' },
        ],
      });

      // Debe calcular la edad usando fecha actual
      expect(result.ok).toBe(true);
    });

    it('should handle age validation at boundaries', () => {
      // Mujer de exactamente 25 años (edad mínima para C53)
      const fechaNacimiento = createDate(1999, 1, 1);
      const fechaNotaMedica = createDate(2024, 1, 1); // Exactamente 25 años
      
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
      });

      expect(result.ok).toBe(true); // 25 es válido (>= 25)
    });

    it('should handle age validation at upper boundary', () => {
      // Mujer de exactamente 64 años (edad máxima para C53)
      const fechaNacimiento = createDate(1960, 1, 1);
      const fechaNotaMedica = createDate(2024, 1, 1); // Exactamente 64 años
      
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
      });

      expect(result.ok).toBe(true); // 64 es válido (<= 64)
    });

    it('should reject age above maximum', () => {
      // Mujer de 65 años (mayor que máximo para C53)
      const fechaNacimiento = createDate(1959, 1, 1);
      const fechaNotaMedica = createDate(2024, 1, 1); // 65 años
      
      const result = validateNotaMedicaCIE10SexAgeRules({
        trabajadorSexo: 'Femenino',
        trabajadorFechaNacimiento: fechaNacimiento,
        fechaNotaMedica,
        cie10Fields: [
          { field: 'codigoCIE10Principal', value: 'C53' },
        ],
      });

      expect(result.ok).toBe(false);
      expect(result.issues[0].edad).toBe(65);
    });
  });
});

