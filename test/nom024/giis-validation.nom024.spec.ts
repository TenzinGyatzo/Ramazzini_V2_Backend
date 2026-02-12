/**
 * NOM-024 GIIS Validation (Phase 2 — 2A)
 * Schema-based validator: blocker vs warning, skip row, excluded report.
 */

import { loadGiisSchema } from '../../src/modules/giis-export/schema-loader';
import {
  validateRowAgainstSchema,
  validateRowSync,
} from '../../src/modules/giis-export/validation/schema-based-validator';
import type { ValidationError } from '../../src/modules/giis-export/validation/validation.types';

describe('NOM-024 GIIS Validation (Phase 2A)', () => {
  describe('schema-based-validator', () => {
    const schema = loadGiisSchema('CEX');

    it('should report blocker when required field is empty', async () => {
      const row: Record<string, string | number> = {
        clues: '',
        paisNacimiento: 142,
        curpPrestador: 'XXXX999999XXXXXX99',
        nombrePrestador: 'JUAN',
        primerApellidoPrestador: 'PEREZ',
        segundoApellidoPrestador: 'XX',
        tipoPersonal: 2,
        programaSMyMG: 0,
        curpPaciente: 'XXXX999999XXXXXX99',
        nombre: 'MARIA',
        primerApellido: 'LOPEZ',
        segundoApellido: 'XX',
        fechaNacimiento: '01/01/1990',
        paisNacPaciente: 142,
        entidadNacimiento: '09',
        sexoCURP: 2,
        sexoBiologico: 2,
      };
      const errors = await validateRowAgainstSchema('CEX', schema, row, 0);
      const cluesError = errors.find(
        (e) => e.field === 'clues' && e.severity === 'blocker',
      );
      expect(cluesError).toBeDefined();
      expect(cluesError?.cause).toContain('obligatorio');
    });

    it('should return sync errors only for required and maxLength', () => {
      const row: Record<string, string | number> = { clues: '' };
      const errors = validateRowSync('CEX', schema, row, 0);
      expect(Array.isArray(errors)).toBe(true);
      expect(
        errors.some((e) => e.field === 'clues' && e.severity === 'blocker'),
      ).toBe(true);
    });

    it('should classify CURP format error as blocker', async () => {
      const row: Record<string, string | number> = {
        clues: '9998',
        paisNacimiento: 142,
        curpPrestador: 'INVALID_CURP_12',
        nombrePrestador: 'JUAN',
        primerApellidoPrestador: 'PEREZ',
        segundoApellidoPrestador: 'XX',
        tipoPersonal: 2,
        programaSMyMG: 0,
        curpPaciente: 'XXXX999999XXXXXX99',
        nombre: 'MARIA',
        primerApellido: 'LOPEZ',
        segundoApellido: 'XX',
        fechaNacimiento: '01/01/1990',
        paisNacPaciente: 142,
        entidadNacimiento: '09',
        sexoCURP: 2,
        sexoBiologico: 2,
      };
      const errors = await validateRowAgainstSchema('CEX', schema, row, 0);
      const curpError = errors.find(
        (e) =>
          (e.field === 'curpPrestador' || e.field === 'curpPaciente') &&
          e.severity === 'blocker',
      );
      expect(curpError).toBeDefined();
    });
  });
});
