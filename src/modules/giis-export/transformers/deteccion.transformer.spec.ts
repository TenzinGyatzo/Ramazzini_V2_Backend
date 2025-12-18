import {
  transformDeteccionToGIIS,
  getGIISB019FieldCount,
  validateGIISB019Record,
} from './deteccion.transformer';

describe('Deteccion Transformer (GIIS-B019)', () => {
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

  const mockDeteccion = {
    fechaDeteccion: new Date('2024-03-15T10:00:00Z'),
    clues: 'ASCIJ000012',
    curpPrestador: 'MEAB900303HDFLRN09',
    tipoPersonal: 10,
    servicioAtencion: 5,
    primeraVezAnio: true,
    peso: 75.5,
    talla: 170,
    cintura: 85,
    tensionArterialSistolica: 120,
    tensionArterialDiastolica: 80,
    glucemia: 95,
    tipoMedicionGlucemia: 1,
    depresion: 1,
    ansiedad: 1,
    riesgoDiabetes: 0,
    riesgoHipertension: 1,
    obesidad: 1,
    consumoAlcohol: 0,
    consumoTabaco: 1,
    estado: 'finalizado',
    createdAt: new Date('2024-03-15T12:00:00Z'),
    updatedAt: new Date('2024-03-15T12:00:00Z'),
  };

  describe('transformDeteccionToGIIS', () => {
    it('should produce correct field count', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields.length).toBe(getGIISB019FieldCount());
    });

    it('should produce correct pipe count (fields - 1)', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const pipeCount = (result.match(/\|/g) || []).length;

      expect(pipeCount).toBe(getGIISB019FieldCount() - 1);
    });

    it('should format CLUES correctly in position 1', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[0]).toBe('ASCIJ000012');
    });

    it('should format fechaDeteccion as YYYYMMDD in position 10', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[9]).toBe('20240315');
    });

    it('should format CURP correctly in position 11', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[10]).toBe('ROAJ850102HDFLRN08');
    });

    it('should format fechaNacimiento as YYYYMMDD in position 15', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[14]).toBe('19850102');
    });

    it('should format sexo as numeric in position 16', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[15]).toBe('1');
    });

    it('should calculate age correctly in position 17', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      // Age at detection (2024-03-15) for birth (1985-01-02) = 39
      expect(fields[16]).toBe('39');
    });

    it('should format tipoPersonal in position 31', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[30]).toBe('10');
    });

    it('should format curpPrestador in position 32', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[31]).toBe('MEAB900303HDFLRN09');
    });

    it('should format primeraVezAnio as 1/0 in position 34', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[33]).toBe('1');
    });

    it('should format peso with 1 decimal in position 46', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[45]).toBe('75.5');
    });

    it('should calculate IMC in position 48', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      // IMC = 75.5 / (1.7 * 1.7) = 26.1
      expect(fields[47]).toBe('26.1');
    });

    it('should format result enums correctly (0=Positivo, 1=Negativo)', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[60]).toBe('1'); // depresion = 1 (Negativo)
      expect(fields[67]).toBe('0'); // riesgoDiabetes = 0 (Positivo)
    });

    it('should handle null trabajador gracefully', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        null,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields.length).toBe(getGIISB019FieldCount());
      // CURP should be empty
      expect(fields[10]).toBe('');
      // Name fields should be empty
      expect(fields[11]).toBe('');
    });

    it('should handle null proveedor gracefully', () => {
      const result = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        null,
      );
      const fields = result.split('|');

      expect(fields.length).toBe(getGIISB019FieldCount());
      // Should use deteccion CLUES
      expect(fields[0]).toBe('ASCIJ000012');
    });

    it('should handle minimal deteccion data', () => {
      const minimalDeteccion = {
        fechaDeteccion: new Date('2024-03-15'),
        clues: 'ASCIJ000012',
      };

      const result = transformDeteccionToGIIS(minimalDeteccion, null, null);
      const fields = result.split('|');

      expect(fields.length).toBe(getGIISB019FieldCount());
    });

    it('should produce deterministic output', () => {
      const result1 = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const result2 = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );

      expect(result1).toBe(result2);
    });

    it('should handle -1 (NA) results as empty string', () => {
      const deteccionWithNA = {
        ...mockDeteccion,
        depresion: -1,
        ansiedad: -1,
      };

      const result = transformDeteccionToGIIS(
        deteccionWithNA,
        mockTrabajador,
        mockProveedor,
      );
      const fields = result.split('|');

      expect(fields[60]).toBe(''); // depresion
      expect(fields[61]).toBe(''); // ansiedad
    });
  });

  describe('validateGIISB019Record', () => {
    it('should validate correct record', () => {
      const record = transformDeteccionToGIIS(
        mockDeteccion,
        mockTrabajador,
        mockProveedor,
      );
      const validation = validateGIISB019Record(record);

      expect(validation.isValid).toBe(true);
      expect(validation.fieldCount).toBe(getGIISB019FieldCount());
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect incorrect field count', () => {
      const record = 'A|B|C|D|E'; // Only 5 fields
      const validation = validateGIISB019Record(record);

      expect(validation.isValid).toBe(false);
      expect(validation.fieldCount).toBe(5);
      expect(validation.errors).toContain(
        `Expected ${getGIISB019FieldCount()} fields, got 5`,
      );
    });
  });

  describe('getGIISB019FieldCount', () => {
    it('should return 91', () => {
      expect(getGIISB019FieldCount()).toBe(91);
    });
  });
});
