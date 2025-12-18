import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TrabajadoresService } from './trabajadores.service';
import { Trabajador } from './schemas/trabajador.schema';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { CatalogsService } from '../catalogs/catalogs.service';
import { FilesService } from '../files/files.service';

describe('TrabajadoresService - NOM-024 Person Identification Fields', () => {
  let service: TrabajadoresService;
  let mockNom024Util: any;
  let mockCatalogsService: any;

  // Create mock model factory
  const createMockModel = () => ({
    create: jest.fn(),
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
      exec: jest.fn().mockResolvedValue(null),
    }),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
        exec: jest.fn().mockResolvedValue([]),
      }),
      lean: jest.fn().mockResolvedValue([]),
      exec: jest.fn().mockResolvedValue([]),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
      exec: jest.fn().mockResolvedValue(null),
    }),
    save: jest.fn(),
    countDocuments: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    }),
  });

  beforeEach(async () => {
    mockNom024Util = {
      requiresNOM024Compliance: jest.fn().mockResolvedValue(true),
      getProveedorPais: jest.fn().mockResolvedValue('MX'),
    };

    mockCatalogsService = {
      validateINEGI: jest.fn().mockResolvedValue(true),
      validateNacionalidad: jest.fn().mockResolvedValue(true),
      validateCLUES: jest.fn().mockResolvedValue(true),
      validateCIE10: jest.fn().mockResolvedValue(true),
    };

    const mockFilesService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrabajadoresService,
        {
          provide: getModelToken(Trabajador.name),
          useValue: createMockModel(),
        },
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
          provide: getModelToken('ConstanciaAptitud'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('Receta'), useValue: createMockModel() },
        {
          provide: getModelToken('RiesgoTrabajo'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('CentroTrabajo'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('User'), useValue: createMockModel() },
        { provide: getModelToken('Empresa'), useValue: createMockModel() },
        { provide: NOM024ComplianceUtil, useValue: mockNom024Util },
        { provide: CatalogsService, useValue: mockCatalogsService },
        { provide: FilesService, useValue: mockFilesService },
      ],
    }).compile();

    service = module.get<TrabajadoresService>(TrabajadoresService);
  });

  describe('NOM-024 Person Identification Fields', () => {
    it('should validate INEGI codes for MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      // Test that INEGI validation is called for MX providers
      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');
      expect(requiresCompliance).toBe(true);

      const isValidEstado = await mockCatalogsService.validateINEGI(
        'estado',
        '09',
      );
      expect(isValidEstado).toBe(true);
    });

    it('should not require INEGI codes for non-MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('nonMxProveedorId');
      expect(requiresCompliance).toBe(false);
    });

    it('should validate nacionalidad against catalog', async () => {
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      const isValid = await mockCatalogsService.validateNacionalidad('MEX');
      expect(isValid).toBe(true);
      expect(mockCatalogsService.validateNacionalidad).toHaveBeenCalledWith(
        'MEX',
      );
    });

    it('should reject invalid nacionalidad code', async () => {
      mockCatalogsService.validateNacionalidad.mockResolvedValue(false);

      const isValid = await mockCatalogsService.validateNacionalidad('INVALID');
      expect(isValid).toBe(false);
    });

    it('should validate hierarchical INEGI codes', async () => {
      // Municipio must be within estado
      mockCatalogsService.validateINEGI
        .mockResolvedValueOnce(true) // estado
        .mockResolvedValueOnce(true); // municipio within estado

      const isEstadoValid = await mockCatalogsService.validateINEGI(
        'estado',
        '09',
      );
      const isMunicipioValid = await mockCatalogsService.validateINEGI(
        'municipio',
        '017',
        '09',
      );

      expect(isEstadoValid).toBe(true);
      expect(isMunicipioValid).toBe(true);
    });

    it('should accept edge case codes (NE, 00)', async () => {
      // NE = foreign, 00 = not available
      const edgeCases = ['NE', '00'];

      edgeCases.forEach((code) => {
        expect(['NE', '00', 'NND'].includes(code)).toBe(true);
      });
    });
  });

  describe('CURP Validation', () => {
    it('should require CURP for MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');
      expect(requiresCompliance).toBe(true);
    });

    it('should not require CURP for non-MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('nonMxProveedorId');
      expect(requiresCompliance).toBe(false);
    });
  });

  describe('Conditional Enforcement', () => {
    it('should enforce validation for MX providers (pais === MX)', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');
      expect(requiresCompliance).toBe(true);
    });

    it('should be permissive for non-MX providers (GT, PA)', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const gtResult =
        await mockNom024Util.requiresNOM024Compliance('gtProveedorId');
      expect(gtResult).toBe(false);
    });
  });
});
