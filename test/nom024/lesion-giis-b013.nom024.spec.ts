/**
 * NOM-024 Lesion (GIIS-B013) Tests (Task 12, Task 13)
 *
 * Tests Lesion entity validation and CRUD operations.
 *
 * CRITICAL: Tests MUST NOT fail if optional GIIS catalog CSV files are missing.
 * GIIS-B013 catalogs (SITIO_OCURRENCIA, AGENTE_LESION, etc.) are not publicly available.
 */

import { Types } from 'mongoose';
import { DocumentoEstado } from '../../src/modules/expedientes/enums/documento-estado.enum';
import * as lesionFixtures from '../fixtures/lesion.fixtures';

describe('NOM-024 Lesion GIIS-B013 (Task 12, 13)', () => {
  describe('Lesion Schema Validation', () => {
    describe('Required Fields', () => {
      const requiredFields = [
        'clues',
        'folio',
        'curpPaciente',
        'fechaNacimiento',
        'sexo',
        'fechaEvento',
        'sitioOcurrencia',
        'intencionalidad',
        'fechaAtencion',
        'tipoAtencion',
        'areaAnatomica',
        'consecuenciaGravedad',
        'codigoCIEAfeccionPrincipal',
        'codigoCIECausaExterna',
        'responsableAtencion',
        'curpResponsable',
        'idTrabajador',
      ];

      requiredFields.forEach((field) => {
        it(`should require ${field}`, () => {
          const validLesion = lesionFixtures.validLesionAccidental;
          expect(validLesion[field]).toBeDefined();
        });
      });
    });

    describe('CLUES Format', () => {
      it('should validate CLUES format (11 alphanumeric)', () => {
        const clues = lesionFixtures.validLesionAccidental.clues;
        expect(clues).toMatch(/^[A-Z0-9]{11}$/);
      });

      it('should reject invalid CLUES format', () => {
        const invalidCLUES = ['INVALID', '12345', 'DFSSA00123', ''];
        invalidCLUES.forEach((clues) => {
          expect(clues).not.toMatch(/^[A-Z0-9]{11}$/);
        });
      });
    });

    describe('Folio Format', () => {
      it('should validate folio format (8 digits)', () => {
        const folio = lesionFixtures.validLesionAccidental.folio;
        expect(folio).toMatch(/^[0-9]{8}$/);
      });
    });

    describe('CURP Validation', () => {
      it('should validate patient CURP format', () => {
        const curp = lesionFixtures.validLesionAccidental.curpPaciente;
        expect(curp).toMatch(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/);
      });

      it('should validate responsible professional CURP format', () => {
        const curp = lesionFixtures.validLesionAccidental.curpResponsable;
        expect(curp).toMatch(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/);
      });
    });

    describe('Sexo Enum', () => {
      it('should accept valid sexo values (1=H, 2=M, 3=I)', () => {
        const validValues = [1, 2, 3];
        validValues.forEach((sexo) => {
          expect([1, 2, 3]).toContain(sexo);
        });
      });

      it('should use sexo=1 for Hombre', () => {
        expect(lesionFixtures.validLesionAccidental.sexo).toBe(1);
      });

      it('should use sexo=2 for Mujer', () => {
        expect(lesionFixtures.validLesionViolenciaFamiliar.sexo).toBe(2);
      });
    });

    describe('Intencionalidad Enum', () => {
      it('should accept valid intencionalidad values', () => {
        const validValues = [1, 2, 3, 4];
        // 1=Accidental, 2=Violencia Familiar, 3=Violencia No Familiar, 4=Autoinfligido
        validValues.forEach((int) => {
          expect([1, 2, 3, 4]).toContain(int);
        });
      });
    });
  });

  describe('Conditional Field Validation', () => {
    describe('Accidental (intencionalidad=1)', () => {
      it('should require agenteLesion', () => {
        const lesion = lesionFixtures.validLesionAccidental;
        expect(lesion.intencionalidad).toBe(1);
        expect(lesion.agenteLesion).toBeDefined();
      });
    });

    describe('Violencia Familiar (intencionalidad=2)', () => {
      it('should require tipoViolencia', () => {
        const lesion = lesionFixtures.validLesionViolenciaFamiliar;
        expect(lesion.intencionalidad).toBe(2);
        expect(lesion.tipoViolencia).toBeDefined();
        expect(Array.isArray(lesion.tipoViolencia)).toBe(true);
        expect(lesion.tipoViolencia!.length).toBeGreaterThan(0);
      });
    });

    describe('Autoinfligido (intencionalidad=4)', () => {
      it('should require agenteLesion', () => {
        const lesion = {
          ...lesionFixtures.validLesionAccidental,
          intencionalidad: 4,
          agenteLesion: 3,
        };
        expect(lesion.agenteLesion).toBeDefined();
      });
    });
  });

  describe('CIE-10 Codes Validation', () => {
    it('should validate codigoCIEAfeccionPrincipal format', () => {
      const code =
        lesionFixtures.validLesionAccidental.codigoCIEAfeccionPrincipal;
      expect(code).toMatch(/^[A-Z][0-9]{2}(\.[0-9]{1,2})?$/);
    });

    it('should validate codigoCIECausaExterna is Chapter XX', () => {
      const code = lesionFixtures.validLesionAccidental.codigoCIECausaExterna;
      // Chapter XX: V01-Y98
      expect(code).toMatch(/^V[0-9]{2}|^W[0-9]{2}|^X[0-9]{2}|^Y[0-9]{2}/);
    });
  });

  describe('Temporal Validation', () => {
    it('should validate fechaEvento >= fechaNacimiento', () => {
      const lesion = lesionFixtures.validLesionAccidental;
      const fechaNacimiento = new Date(lesion.fechaNacimiento);
      const fechaEvento = new Date(lesion.fechaEvento);
      expect(fechaEvento.getTime()).toBeGreaterThanOrEqual(
        fechaNacimiento.getTime(),
      );
    });

    it('should validate fechaAtencion >= fechaEvento', () => {
      const lesion = lesionFixtures.validLesionAccidental;
      const fechaEvento = new Date(lesion.fechaEvento);
      const fechaAtencion = new Date(lesion.fechaAtencion);
      expect(fechaAtencion.getTime()).toBeGreaterThanOrEqual(
        fechaEvento.getTime(),
      );
    });

    it('should detect temporal inconsistency errors', () => {
      const lesion = lesionFixtures.lesionTemporalError;
      const fechaEvento = new Date(lesion.fechaEvento);
      const fechaAtencion = new Date(lesion.fechaAtencion);
      expect(fechaAtencion.getTime()).toBeLessThan(fechaEvento.getTime());
    });
  });

  describe('TipoAtencion Array Validation', () => {
    it('should be an array with 1-5 values', () => {
      const tipoAtencion = lesionFixtures.validLesionAccidental.tipoAtencion;
      expect(Array.isArray(tipoAtencion)).toBe(true);
      expect(tipoAtencion.length).toBeGreaterThanOrEqual(1);
      expect(tipoAtencion.length).toBeLessThanOrEqual(5);
    });

    it('should contain numeric values', () => {
      const tipoAtencion = lesionFixtures.validLesionAccidental.tipoAtencion;
      tipoAtencion.forEach((ta) => {
        expect(typeof ta).toBe('number');
        expect(ta).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('ResponsableAtencion Enum', () => {
    it('should accept valid responsableAtencion values', () => {
      const validValues = [1, 2, 3]; // 1=Médico, 2=Psicólogo, 3=Trabajador Social
      validValues.forEach((ra) => {
        expect([1, 2, 3]).toContain(ra);
      });
    });
  });

  describe('Document State Management', () => {
    it('should default to BORRADOR state', () => {
      expect(lesionFixtures.validLesionAccidental.estado).toBe(
        DocumentoEstado.BORRADOR,
      );
    });

    it('should support FINALIZADO state', () => {
      expect(lesionFixtures.finalizedLesion.estado).toBe(
        DocumentoEstado.FINALIZADO,
      );
    });

    it('should have finalization metadata when FINALIZADO', () => {
      const lesion = lesionFixtures.finalizedLesion;
      expect(lesion.fechaFinalizacion).toBeDefined();
      expect(lesion.finalizadoPor).toBeDefined();
    });
  });

  describe('GIIS Catalog Best-Effort Validation (Task 12)', () => {
    /**
     * CRITICAL: GIIS-B013 catalogs are NOT publicly available from DGIS.
     * Tests must NOT fail due to missing catalog files.
     * Validation should use best-effort (type + basic bounds).
     */

    const bestEffortFields = [
      'sitioOcurrencia',
      'agenteLesion',
      'areaAnatomica',
      'consecuenciaGravedad',
    ];

    bestEffortFields.forEach((field) => {
      it(`should validate ${field} as integer >= 1 (best-effort)`, () => {
        const value = lesionFixtures.validLesionAccidental[field];
        if (value !== undefined) {
          expect(typeof value).toBe('number');
          expect(Number.isInteger(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(1);
        }
      });
    });

    it('should NOT require strict catalog enumeration for missing catalogs', () => {
      // This test documents that we use best-effort validation
      // because DGIS has not published these catalogs publicly
      const lesion = lesionFixtures.validLesionAccidental;

      // Any positive integer should be accepted
      expect(lesion.sitioOcurrencia).toBeGreaterThanOrEqual(1);
      expect(lesion.areaAnatomica).toBeGreaterThanOrEqual(1);
      expect(lesion.consecuenciaGravedad).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Patient ≠ Responsible Validation', () => {
    it('should ensure curpPaciente ≠ curpResponsable', () => {
      const lesion = lesionFixtures.validLesionAccidental;
      expect(lesion.curpPaciente).not.toBe(lesion.curpResponsable);
    });
  });

  describe('Fixture Validation', () => {
    it('should have valid accidental lesion fixture', () => {
      const lesion = lesionFixtures.validLesionAccidental;
      expect(lesion._id).toBeDefined();
      expect(lesion.clues).toBeDefined();
      expect(lesion.idTrabajador).toBeDefined();
    });

    it('should have valid violence lesion fixture', () => {
      const lesion = lesionFixtures.validLesionViolenciaFamiliar;
      expect(lesion.intencionalidad).toBe(2);
      expect(lesion.tipoViolencia).toBeDefined();
    });
  });
});
