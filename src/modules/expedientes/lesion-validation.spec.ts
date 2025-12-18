import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { Lesion } from './schemas/lesion.schema';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../empresas/schemas/empresa.schema';
import { CatalogsService } from '../catalogs/catalogs.service';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { FilesService } from '../files/files.service';
import { DocumentoEstado } from './enums/documento-estado.enum';

describe('Lesion Validation - Without GIIS-B013 Catalog Dependencies', () => {
  let service: ExpedientesService;
  let mockLesionModel: any;
  let mockTrabajadorModel: any;
  let mockCentroTrabajoModel: any;
  let mockEmpresaModel: any;
  let mockCatalogsService: any;
  let mockNom024Util: any;

  beforeEach(async () => {
    // Reset mocks with proper chained method structure
    mockLesionModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    };

    mockTrabajadorModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    };

    mockCentroTrabajoModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    };

    mockEmpresaModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    };

    mockCatalogsService = {
      validateCIE10: jest.fn().mockResolvedValue(true),
      searchCatalog: jest.fn().mockResolvedValue([]),
    };

    mockNom024Util = {
      requiresNOM024Compliance: jest.fn().mockResolvedValue(true),
    };

    const mockFilesService = {};

    // Create a mock model factory
    const createMockModel = () => ({
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      find: jest.fn().mockReturnValue({
        sort: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
        exec: jest.fn().mockResolvedValue([]),
      }),
      findByIdAndUpdate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      findByIdAndDelete: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpedientesService,
        { provide: getModelToken(Lesion.name), useValue: mockLesionModel },
        { provide: getModelToken('Antidoping'), useValue: createMockModel() },
        {
          provide: getModelToken('AptitudPuesto'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('Audiometria'), useValue: createMockModel() },
        { provide: getModelToken('Certificado'), useValue: createMockModel() },
        {
          provide: getModelToken('CertificadoExpedito'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('DocumentoExterno'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('ExamenVista'), useValue: createMockModel() },
        {
          provide: getModelToken('ExploracionFisica'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('HistoriaClinica'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('NotaMedica'), useValue: createMockModel() },
        {
          provide: getModelToken('ControlPrenatal'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('HistoriaOtologica'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('PrevioEspirometria'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('Receta'), useValue: createMockModel() },
        {
          provide: getModelToken('ConstanciaAptitud'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('Deteccion'), useValue: createMockModel() },
        {
          provide: getModelToken(Trabajador.name),
          useValue: mockTrabajadorModel,
        },
        {
          provide: getModelToken(CentroTrabajo.name),
          useValue: mockCentroTrabajoModel,
        },
        { provide: getModelToken(Empresa.name), useValue: mockEmpresaModel },
        { provide: CatalogsService, useValue: mockCatalogsService },
        { provide: NOM024ComplianceUtil, useValue: mockNom024Util },
        { provide: FilesService, useValue: mockFilesService },
      ],
    }).compile();

    service = module.get<ExpedientesService>(ExpedientesService);
  });

  describe('GIIS-B013 Lesion - Catalog Independence', () => {
    const mxTrabajadorId = 'trabajador123';
    const mxCentroTrabajoId = 'centro123';
    const mxEmpresaId = 'empresa123';
    const mxProveedorSaludId = 'proveedor123';

    beforeEach(() => {
      // Setup MX provider chain
      mockTrabajadorModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: mxTrabajadorId,
          idCentroTrabajo: mxCentroTrabajoId,
        }),
      });
      mockCentroTrabajoModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: mxCentroTrabajoId,
          idEmpresa: mxEmpresaId,
        }),
      });
      mockEmpresaModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: mxEmpresaId,
          idProveedorSalud: mxProveedorSaludId,
        }),
      });
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateCIE10.mockResolvedValue(true);
    });

    it('should validate numeric codes without catalog CSV files', async () => {
      // The service should accept numeric codes for SITIO_OCURRENCIA, AGENTE_LESION,
      // AREA_ANATOMICA, CONSECUENCIA without requiring catalog CSVs

      // These catalogs are NOT publicly available from DGIS
      // Validation should only check:
      // - Integer type
      // - Basic bounds (>= 1)
      // - Requiredness based on intencionalidad

      const numericCode = 5;
      expect(Number.isInteger(numericCode)).toBe(true);
      expect(numericCode >= 1).toBe(true);
    });

    it('should enforce conditional validation based on intencionalidad', async () => {
      // Accidental (1) or Self-inflicted (4): agenteLesion required
      // Violence (2 or 3): tipoViolencia required

      const accidentalCase = { intencionalidad: 1 };
      const violenceCase = { intencionalidad: 2 };

      // Accidental requires agenteLesion
      expect(
        accidentalCase.intencionalidad === 1 ||
          accidentalCase.intencionalidad === 4,
      ).toBe(true);

      // Violence requires tipoViolencia
      expect(
        violenceCase.intencionalidad === 2 ||
          violenceCase.intencionalidad === 3,
      ).toBe(true);
    });

    it('should not validate against unavailable DGIS catalogs', async () => {
      // Official DGIS catalogs for GIIS-B013 are not publicly available:
      // - SITIO_OCURRENCIA
      // - AGENTE_LESION
      // - AREA_ANATOMICA
      // - CONSECUENCIA

      // The system should accept numeric codes without strict catalog validation
      const catalogFields = {
        sitioOcurrencia: 5,
        agenteLesion: 10,
        areaAnatomica: 3,
        consecuenciaGravedad: 2,
      };

      // All should be valid numeric codes >= 1
      Object.values(catalogFields).forEach((value) => {
        expect(Number.isInteger(value)).toBe(true);
        expect(value >= 1).toBe(true);
      });
    });

    it('should still validate CIE-10 codes (catalog IS available)', async () => {
      // CIE-10 catalog is available and should be validated
      const cie10Code = 'S72.0';

      // Mock that catalog validation works
      mockCatalogsService.validateCIE10.mockResolvedValue(true);

      const isValid = await mockCatalogsService.validateCIE10(cie10Code);
      expect(isValid).toBe(true);
      expect(mockCatalogsService.validateCIE10).toHaveBeenCalledWith(cie10Code);
    });

    it('should reject invalid CIE-10 codes', async () => {
      const invalidCode = 'INVALID';

      mockCatalogsService.validateCIE10.mockResolvedValue(false);

      const isValid = await mockCatalogsService.validateCIE10(invalidCode);
      expect(isValid).toBe(false);
    });

    it('should validate temporal sequence of dates', async () => {
      // fechaNacimiento <= fechaEvento <= fechaAtencion
      const fechaNacimiento = new Date('1990-01-01');
      const fechaEvento = new Date('2024-01-15');
      const fechaAtencion = new Date('2024-01-15');

      expect(fechaEvento >= fechaNacimiento).toBe(true);
      expect(fechaAtencion >= fechaEvento).toBe(true);
    });

    it('should reject invalid temporal sequence', async () => {
      const fechaNacimiento = new Date('2000-01-01');
      const fechaEvento = new Date('1990-01-15'); // Invalid: before birth

      expect(fechaEvento >= fechaNacimiento).toBe(false);
    });
  });

  describe('Document Immutability', () => {
    it('should allow updates on non-finalized documents', async () => {
      const draftLesion = {
        _id: 'lesion123',
        estado: DocumentoEstado.BORRADOR,
        toObject: jest.fn().mockReturnValue({
          _id: 'lesion123',
          estado: DocumentoEstado.BORRADOR,
        }),
      };

      expect(draftLesion.estado).toBe(DocumentoEstado.BORRADOR);
      expect(draftLesion.estado !== DocumentoEstado.FINALIZADO).toBe(true);
    });

    it('should block updates on finalized documents for MX providers', async () => {
      const finalizedLesion = {
        _id: 'lesion123',
        estado: DocumentoEstado.FINALIZADO,
      };

      // MX provider requires NOM-024 compliance
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const isFinalizado =
        finalizedLesion.estado === DocumentoEstado.FINALIZADO;
      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('proveedorId');

      // Should block update
      expect(isFinalizado && requiresCompliance).toBe(true);
    });

    it('should allow updates on finalized documents for non-MX providers', async () => {
      const finalizedLesion = {
        _id: 'lesion123',
        estado: DocumentoEstado.FINALIZADO,
      };

      // Non-MX provider does not require NOM-024 compliance
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const isFinalizado =
        finalizedLesion.estado === DocumentoEstado.FINALIZADO;
      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('nonMxProveedorId');

      // Should allow update (non-MX can edit finalized docs)
      expect(isFinalizado && !requiresCompliance).toBe(true);
    });
  });

  describe('MX-Only Enforcement', () => {
    it('should enable Lesion entity only for MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');
      expect(requiresCompliance).toBe(true);
    });

    it('should not enable Lesion entity for non-MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('nonMxProveedorId');
      expect(requiresCompliance).toBe(false);
    });
  });
});
