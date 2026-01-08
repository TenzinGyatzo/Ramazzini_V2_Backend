import { validateCURPCrossCheck, Discrepancy } from './curp-validator.util';

describe('validateCURPCrossCheck (A1)', () => {
  const mockData = {
    fechaNacimiento: new Date('1990-05-15'),
    sexo: 'Masculino',
    entidadNacimiento: '09', // CDMX
    nombre: 'JUAN',
    primerApellido: 'GARCIA',
    segundoApellido: 'LOPEZ',
  };

  it('debe retornar isValid=true para CURP genérica', () => {
    const result = validateCURPCrossCheck('XXXX999999XXXXXX99', mockData);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe pasar validación para caso real correcto CXGE941130HJCRND07', () => {
    const curp = 'CXGE941130HJCRND07';
    const dataCorrecta = {
      fechaNacimiento: '1994-11-30' as any, // String ISO
      sexo: 'Masculino',
      entidadNacimiento: 'JALISCO', // Nombre completo
      nombre: 'EDGAR OMAR',
      primerApellido: 'CORONEL',
      segundoApellido: 'GONZALEZ',
    };
    const result = validateCURPCrossCheck(curp, dataCorrecta);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe pasar validación con entidadNacimiento como código INEGI (14)', () => {
    const curp = 'CXGE941130HJCRND07';
    const data = {
      fechaNacimiento: new Date('1994-11-30'),
      sexo: 'Masculino',
      entidadNacimiento: '14', // Código INEGI
      nombre: 'EDGAR OMAR',
      primerApellido: 'CORONEL',
      segundoApellido: 'GONZALEZ',
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe pasar validación con entidadNacimiento como código CURP (JC)', () => {
    const curp = 'CXGE941130HJCRND07';
    const data = {
      fechaNacimiento: new Date('1994-11-30'),
      sexo: 'Masculino',
      entidadNacimiento: 'JC', // Código CURP directo
      nombre: 'EDGAR OMAR',
      primerApellido: 'CORONEL',
      segundoApellido: 'GONZALEZ',
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe retornar isValid=false si fechaNacimiento no coincide', () => {
    const curp = 'GALJ900515HDFLRN08'; // Fecha: 1990-05-15 (900515)
    const dataIncorrecta = {
      ...mockData,
      fechaNacimiento: new Date('1991-05-15'), // Año diferente (910515)
    };
    const result = validateCURPCrossCheck(curp, dataIncorrecta);
    expect(result.isValid).toBe(false);
    expect(result.discrepancies.length).toBeGreaterThan(0);
    const fechaDiscrepancy = result.discrepancies.find(
      (d) => d.field === 'fechaNacimiento',
    );
    expect(fechaDiscrepancy).toBeDefined();
    expect(fechaDiscrepancy?.expected).toBe('910515'); // Fecha esperada de los datos
    expect(fechaDiscrepancy?.gotFromCurp).toBe('900515'); // Fecha en la CURP
  });

  it('debe retornar discrepancy estructurada para fecha incorrecta', () => {
    const curp = 'GALJ900515HDFLRN08'; // Fecha: 1990-05-15
    const dataIncorrecta = {
      ...mockData,
      fechaNacimiento: new Date('1990-05-16'), // Día diferente
    };
    const result = validateCURPCrossCheck(curp, dataIncorrecta);
    expect(result.isValid).toBe(false);
    const fechaDiscrepancy = result.discrepancies.find(
      (d) => d.field === 'fechaNacimiento',
    );
    expect(fechaDiscrepancy).toBeDefined();
    expect(fechaDiscrepancy?.field).toBe('fechaNacimiento');
    expect(fechaDiscrepancy?.expected).toBe('900516');
    expect(fechaDiscrepancy?.gotFromCurp).toBe('900515');
  });

  it('debe retornar isValid=false si sexo no coincide', () => {
    const curp = 'GALJ900515HDFLRN08'; // H (Hombre)
    const dataIncorrecta = {
      ...mockData,
      sexo: 'Femenino', // M en CURP vs Femenino
    };
    const result = validateCURPCrossCheck(curp, dataIncorrecta);
    expect(result.isValid).toBe(false);
    expect(result.discrepancies.length).toBeGreaterThan(0);
    const sexoDiscrepancy = result.discrepancies.find((d) => d.field === 'sexo');
    expect(sexoDiscrepancy).toBeDefined();
    expect(sexoDiscrepancy?.field).toBe('sexo');
    expect(sexoDiscrepancy?.expected).toBe('M');
    expect(sexoDiscrepancy?.gotFromCurp).toBe('H');
  });

  it('debe mapear correctamente variantes de sexo: Hombre → H', () => {
    const curp = 'GALJ900515HDFLRN08'; // H
    const data = {
      ...mockData,
      sexo: 'Hombre',
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe mapear correctamente variantes de sexo: M → M (Femenino)', () => {
    const curp = 'GALJ900515MDFLRN08'; // M
    const data = {
      ...mockData,
      sexo: 'M',
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe retornar isValid=false si entidadNacimiento no coincide', () => {
    const curp = 'GALJ900515HDFLRN08'; // DF (09)
    const dataIncorrecta = {
      ...mockData,
      entidadNacimiento: '01', // Aguascalientes (AS)
    };
    const result = validateCURPCrossCheck(curp, dataIncorrecta);
    expect(result.isValid).toBe(false);
    expect(result.discrepancies.length).toBeGreaterThan(0);
    const entidadDiscrepancy = result.discrepancies.find(
      (d) => d.field === 'entidadNacimiento',
    );
    expect(entidadDiscrepancy).toBeDefined();
    expect(entidadDiscrepancy?.field).toBe('entidadNacimiento');
    expect(entidadDiscrepancy?.expected).toBe('AS'); // Código CURP de Aguascalientes
    expect(entidadDiscrepancy?.gotFromCurp).toBe('DF');
  });

  it('debe mapear correctamente entidadNacimiento: JALISCO → JC', () => {
    const curp = 'CXGE941130HJCRND07'; // JC
    const data = {
      ...mockData,
      fechaNacimiento: new Date('1994-11-30'),
      sexo: 'Masculino',
      entidadNacimiento: 'JALISCO',
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe mapear correctamente entidadNacimiento: código INEGI 14 → JC', () => {
    const curp = 'CXGE941130HJCRND07'; // JC
    const data = {
      ...mockData,
      fechaNacimiento: new Date('1994-11-30'),
      sexo: 'Masculino',
      entidadNacimiento: '14',
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe retornar isValid=true si todos los datos coinciden', () => {
    const curp = 'GALJ900515HDFLRN08'; // 1990-05-15, H, DF (09)
    const result = validateCURPCrossCheck(curp, mockData);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe permitir entidadNacimiento NE o 00 sin validar', () => {
    const curp = 'GALJ900515HDFLRN08';
    const dataConNE = {
      ...mockData,
      entidadNacimiento: 'NE',
    };
    const result = validateCURPCrossCheck(curp, dataConNE);
    // No debe generar discrepancia por entidad si es NE
    expect(
      result.discrepancies.filter((d) => d.field === 'entidadNacimiento'),
    ).toHaveLength(0);
  });

  it('debe permitir entidadNacimiento 00 sin validar', () => {
    const curp = 'GALJ900515HDFLRN08';
    const dataCon00 = {
      ...mockData,
      entidadNacimiento: '00',
    };
    const result = validateCURPCrossCheck(curp, dataCon00);
    // No debe generar discrepancia por entidad si es 00
    expect(
      result.discrepancies.filter((d) => d.field === 'entidadNacimiento'),
    ).toHaveLength(0);
  });

  it('debe retornar isValid=false si CURP tiene formato inválido', () => {
    const curpInvalida = 'INVALID';
    const result = validateCURPCrossCheck(curpInvalida, mockData);
    expect(result.isValid).toBe(false);
    expect(result.discrepancies.length).toBeGreaterThan(0);
    // Debe tener una discrepancy de formato inválido
    expect(result.discrepancies[0].field).toBe('fechaNacimiento');
  });

  it('debe validar correctamente fecha con mes y día de un solo dígito', () => {
    const curp = 'GALJ900105HDFLRN08'; // 1990-01-05
    const data = {
      ...mockData,
      fechaNacimiento: new Date('1990-01-05'),
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe validar correctamente sexo Femenino', () => {
    const curp = 'GALJ900515MDFLRN08'; // M (Mujer)
    const data = {
      ...mockData,
      sexo: 'Femenino',
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  it('debe permitir entidadNacimiento vacío sin validar', () => {
    const curp = 'GALJ900515HDFLRN08';
    const dataSinEntidad = {
      ...mockData,
      entidadNacimiento: undefined,
    };
    const result = validateCURPCrossCheck(curp, dataSinEntidad);
    // No debe generar discrepancia por entidad si no está presente
    expect(
      result.discrepancies.filter((d) => d.field === 'entidadNacimiento'),
    ).toHaveLength(0);
  });

  it('debe retornar múltiples discrepancias cuando varios campos fallan', () => {
    const curp = 'GALJ900515HDFLRN08'; // 1990-05-15, H, DF
    const dataIncorrecta = {
      fechaNacimiento: new Date('1991-06-20'), // Año, mes y día diferentes
      sexo: 'Femenino', // Sexo diferente
      entidadNacimiento: '01', // Entidad diferente (AS vs DF)
      nombre: 'JUAN',
      primerApellido: 'GARCIA',
      segundoApellido: 'LOPEZ',
    };
    const result = validateCURPCrossCheck(curp, dataIncorrecta);
    expect(result.isValid).toBe(false);
    expect(result.discrepancies.length).toBeGreaterThanOrEqual(3);

    const fechaDiscrepancy = result.discrepancies.find(
      (d) => d.field === 'fechaNacimiento',
    );
    const sexoDiscrepancy = result.discrepancies.find((d) => d.field === 'sexo');
    const entidadDiscrepancy = result.discrepancies.find(
      (d) => d.field === 'entidadNacimiento',
    );

    expect(fechaDiscrepancy).toBeDefined();
    expect(sexoDiscrepancy).toBeDefined();
    expect(entidadDiscrepancy).toBeDefined();

    expect(fechaDiscrepancy?.expected).toBe('910620');
    expect(fechaDiscrepancy?.gotFromCurp).toBe('900515');

    expect(sexoDiscrepancy?.expected).toBe('M');
    expect(sexoDiscrepancy?.gotFromCurp).toBe('H');

    expect(entidadDiscrepancy?.expected).toBe('AS');
    expect(entidadDiscrepancy?.gotFromCurp).toBe('DF');
  });

  it('debe manejar fecha como string ISO correctamente', () => {
    const curp = 'GALJ900515HDFLRN08'; // 1990-05-15
    const data = {
      ...mockData,
      fechaNacimiento: '1990-05-15' as any, // String ISO
    };
    const result = validateCURPCrossCheck(curp, data);
    expect(result.isValid).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });
});
