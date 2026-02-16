import {
  transformLesionToGIIS,
  getGIISB013FieldCount,
  validateGIISB013Record,
} from './lesion.transformer';

describe('Lesion Transformer (GIIS-B013)', () => {
  const mockTrabajador = {
    curp: 'ROAJ850102HDFLRN08',
    nombre: 'JUAN',
    primerApellido: 'RODRIGUEZ',
    segundoApellido: 'PEREZ',
    fechaNacimiento: new Date('1985-01-02T00:00:00Z'),
    sexo: 'Masculino',
    entidadNacimiento: '09',
    nacionalidad: 'MEX',
  };

  const mockProveedor = {
    clues: 'ASCIJ000012',
    pais: 'MX',
    nombre: 'CLINICA TEST',
    entidadFederativa: '09',
    municipio: '001',
  };

  const mockLesion = {
    folio: '00000001',
    curpPaciente: 'ROAJ850102HDFLRN08',
    fechaNacimiento: new Date('1985-01-02T00:00:00Z'),
    sexo: 1,
    fechaEvento: new Date('2024-03-15T10:00:00Z'),
    horaEvento: '10:00',
    sitioOcurrencia: 1,
    intencionalidad: 1,
    agenteLesion: 5,
    tipoViolencia: null,
    fechaAtencion: new Date('2024-03-15T12:00:00Z'),
    horaAtencion: '12:00',
    tipoAtencion: [1, 2],
    areaAnatomica: 3,
    consecuenciaGravedad: 2,
    codigoCIEAfeccionPrincipal: 'S00.0',
    codigoCIECausaExterna: 'W01',
    afeccionesTratadas: null,
    responsableAtencion: 1,
    curpResponsable: 'MEAB900303HDFLRN09',
    estado: 'finalizado',
    createdAt: new Date('2024-03-15T12:30:00Z'),
    updatedAt: new Date('2024-03-15T12:30:00Z'),
  };

  describe('transformLesionToGIIS', () => {
    it('should produce correct field count', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields.length).toBe(getGIISB013FieldCount());
    });

    it('should produce correct pipe count (fields - 1)', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const pipeCount = (result.match(/\|/g) || []).length;

      expect(pipeCount).toBe(getGIISB013FieldCount() - 1);
    });

    it('should format CLUES correctly in position 1', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[0]).toBe('ASCIJ000012');
    });

    it('should format folio correctly in position 2', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[1]).toBe('00000001');
    });

    it('should format CURP correctly in position 11', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[10]).toBe('ROAJ850102HDFLRN08');
    });

    it('should format fechaNacimiento as YYYYMMDD in position 15', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[14]).toBe('19850102');
    });

    it('should format sexo as numeric in position 16', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[15]).toBe('1');
    });

    it('should calculate age correctly in position 30', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      // Age at event (2024-03-15) for birth (1985-01-02) = 39
      expect(fields[29]).toBe('39');
    });

    it('should format fechaEvento as YYYYMMDD in position 31', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[30]).toBe('20240315');
    });

    it('should format horaEvento as HHMM in position 32', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[31]).toBe('1000');
    });

    it('should format tipoAtencion as multi-value with & in position 53', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[52]).toBe('1&2');
    });

    it('should format CIE-10 codes correctly', () => {
      const result = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[55]).toBe('S00.0'); // codigoCIEAfeccionPrincipal
      expect(fields[57]).toBe('W01'); // codigoCIECausaExterna
    });

    it('should handle null trabajador gracefully', () => {
      const result = transformLesionToGIIS(mockLesion, null, mockProveedor);
      const fields = result.split('|');

      expect(fields.length).toBe(getGIISB013FieldCount());
      // Name fields should be empty
      expect(fields[11]).toBe(''); // primerApellido
      expect(fields[12]).toBe(''); // segundoApellido
      expect(fields[13]).toBe(''); // nombre
    });

    it('should handle null proveedor gracefully', () => {
      const result = transformLesionToGIIS(mockLesion, mockTrabajador, null);
      const fields = result.split('|');

      expect(fields.length).toBe(getGIISB013FieldCount());
      // CLUES se obtiene de ProveedorSalud; sin proveedor queda vacío
      expect(fields[0]).toBe('');
    });

    it('should handle minimal lesion data', () => {
      const minimalLesion = {
        fechaEvento: new Date('2024-03-15'),
        fechaAtencion: new Date('2024-03-15'),
      };
      const minimalProveedor = { clues: 'ASCIJ000012' };

      const result = transformLesionToGIIS(
        minimalLesion,
        null,
        minimalProveedor,
      );
      const fields = result.split('|');

      expect(fields.length).toBe(getGIISB013FieldCount());
    });

    it('should produce deterministic output', () => {
      const result1 = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const result2 = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );

      expect(result1).toBe(result2);
    });
  });

  describe('validateGIISB013Record', () => {
    it('should validate correct record', () => {
      const record = transformLesionToGIIS(
        mockLesion,
        mockTrabajador,
        mockProveedor,
      );
      const validation = validateGIISB013Record(record);

      expect(validation.isValid).toBe(true);
      expect(validation.fieldCount).toBe(getGIISB013FieldCount());
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect incorrect field count', () => {
      const record = 'A|B|C'; // Only 3 fields
      const validation = validateGIISB013Record(record);

      expect(validation.isValid).toBe(false);
      expect(validation.fieldCount).toBe(3);
      expect(validation.errors).toContain(
        `Expected ${getGIISB013FieldCount()} fields, got 3`,
      );
    });
  });

  describe('getGIISB013FieldCount', () => {
    it('should return 78', () => {
      expect(getGIISB013FieldCount()).toBe(78);
    });
  });
});
