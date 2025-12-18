import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { NotaMedica } from './schemas/nota-medica.schema';
import { HistoriaClinica } from './schemas/historia-clinica.schema';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../empresas/schemas/empresa.schema';
import { CatalogsService } from '../catalogs/catalogs.service';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { FilesService } from '../files/files.service';

describe('CIE-10 Validation - MX vs Non-MX Providers', () => {
  let service: ExpedientesService;
  let catalogsService: CatalogsService;
  let nom024Util: NOM024ComplianceUtil;

  const mockNotaMedicaModel = {
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
  };

  const mockHistoriaClinicaModel = {
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
  };

  const mockTrabajadorModel = {
    findById: jest.fn(),
  };

  const mockCentroTrabajoModel = {
    findById: jest.fn(),
  };

  const mockEmpresaModel = {
    findById: jest.fn(),
  };

  const mockCatalogsService = {
    validateCIE10: jest.fn(),
    searchCatalog: jest.fn(),
  };

  const mockNom024Util = {
    requiresNOM024Compliance: jest.fn(),
  };

  const mockFilesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpedientesService,
        {
          provide: getModelToken(NotaMedica.name),
          useValue: mockNotaMedicaModel,
        },
        {
          provide: getModelToken(HistoriaClinica.name),
          useValue: mockHistoriaClinicaModel,
        },
        {
          provide: getModelToken('Antidoping'),
          useValue: {},
        },
        {
          provide: getModelToken('AptitudPuesto'),
          useValue: {},
        },
        {
          provide: getModelToken('Audiometria'),
          useValue: {},
        },
        {
          provide: getModelToken('Certificado'),
          useValue: {},
        },
        {
          provide: getModelToken('CertificadoExpedito'),
          useValue: {},
        },
        {
          provide: getModelToken('DocumentoExterno'),
          useValue: {},
        },
        {
          provide: getModelToken('ExamenVista'),
          useValue: {},
        },
        {
          provide: getModelToken('ExploracionFisica'),
          useValue: {},
        },
        {
          provide: getModelToken('ControlPrenatal'),
          useValue: {},
        },
        {
          provide: getModelToken('HistoriaOtologica'),
          useValue: {},
        },
        {
          provide: getModelToken('PrevioEspirometria'),
          useValue: {},
        },
        {
          provide: getModelToken('Receta'),
          useValue: {},
        },
        {
          provide: getModelToken('ConstanciaAptitud'),
          useValue: {},
        },
        {
          provide: getModelToken(Trabajador.name),
          useValue: mockTrabajadorModel,
        },
        {
          provide: getModelToken(CentroTrabajo.name),
          useValue: mockCentroTrabajoModel,
        },
        {
          provide: getModelToken(Empresa.name),
          useValue: mockEmpresaModel,
        },
        {
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
        {
          provide: NOM024ComplianceUtil,
          useValue: mockNom024Util,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    service = module.get<ExpedientesService>(ExpedientesService);
    catalogsService = module.get<CatalogsService>(CatalogsService);
    nom024Util = module.get<NOM024ComplianceUtil>(NOM024ComplianceUtil);

    jest.clearAllMocks();
  });

  describe('MX Provider - CIE-10 Required', () => {
    const mxTrabajadorId = 'trabajador123';
    const mxCentroTrabajoId = 'centro123';
    const mxEmpresaId = 'empresa123';
    const mxProveedorSaludId = 'proveedor123';

    beforeEach(() => {
      mockTrabajadorModel.findById.mockResolvedValue({
        _id: mxTrabajadorId,
        idCentroTrabajo: mxCentroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: mxCentroTrabajoId,
        idEmpresa: mxEmpresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: mxEmpresaId,
        idProveedorSalud: mxProveedorSaludId,
      });
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
    });

    it('should require codigoCIE10Principal for MX provider', async () => {
      const createDto = {
        tipoNota: 'Inicial',
        fechaNotaMedica: new Date('2024-01-01'),
        motivoConsulta: 'Consulta general',
        diagnostico: 'Diagnóstico en texto libre',
        idTrabajador: mxTrabajadorId,
        rutaPDF: '/path/to/pdf',
        createdBy: 'user123',
        updatedBy: 'user123',
        // codigoCIE10Principal missing
      };

      mockNotaMedicaModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(createDto),
      });

      await expect(
        service.createDocument('notaMedica', createDto)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createDocument('notaMedica', createDto)
      ).rejects.toThrow('Código CIE-10 principal es obligatorio');
    });

    it('should validate codigoCIE10Principal exists in catalog for MX provider', async () => {
      const createDto = {
        tipoNota: 'Inicial',
        fechaNotaMedica: new Date('2024-01-01'),
        motivoConsulta: 'Consulta general',
        diagnostico: 'Diagnóstico en texto libre',
        codigoCIE10Principal: 'INVALID',
        idTrabajador: mxTrabajadorId,
        rutaPDF: '/path/to/pdf',
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      mockCatalogsService.validateCIE10.mockResolvedValue(false);

      mockNotaMedicaModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(createDto),
      });

      await expect(
        service.createDocument('notaMedica', createDto)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createDocument('notaMedica', createDto)
      ).rejects.toThrow('Código CIE-10 principal inválido');
    });

    it('should accept valid codigoCIE10Principal for MX provider', async () => {
      const createDto = {
        tipoNota: 'Inicial',
        fechaNotaMedica: new Date('2024-01-01'),
        motivoConsulta: 'Consulta general',
        diagnostico: 'Diagnóstico en texto libre',
        codigoCIE10Principal: 'A00.0',
        idTrabajador: mxTrabajadorId,
        rutaPDF: '/path/to/pdf',
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      mockCatalogsService.validateCIE10.mockResolvedValue(true);
      mockNotaMedicaModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(createDto),
      });

      // Mock actualizarUpdatedAtTrabajador
      (service as any).actualizarUpdatedAtTrabajador = jest.fn().mockResolvedValue(undefined);

      const result = await service.createDocument('notaMedica', createDto);
      expect(result).toBeDefined();
      expect(mockCatalogsService.validateCIE10).toHaveBeenCalledWith('A00.0');
    });

    it('should validate secondary CIE-10 codes for MX provider', async () => {
      const createDto = {
        tipoNota: 'Inicial',
        fechaNotaMedica: new Date('2024-01-01'),
        motivoConsulta: 'Consulta general',
        diagnostico: 'Diagnóstico en texto libre',
        codigoCIE10Principal: 'A00.0',
        codigosCIE10Secundarios: ['INVALID', 'B00.1'],
        idTrabajador: mxTrabajadorId,
        rutaPDF: '/path/to/pdf',
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      mockCatalogsService.validateCIE10
        .mockResolvedValueOnce(true) // Principal
        .mockResolvedValueOnce(false) // First secondary (invalid)
        .mockResolvedValueOnce(true); // Second secondary

      mockNotaMedicaModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(createDto),
      });

      await expect(
        service.createDocument('notaMedica', createDto)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createDocument('notaMedica', createDto)
      ).rejects.toThrow('Código CIE-10 secundario inválido');
    });
  });

  describe('Non-MX Provider - CIE-10 Optional', () => {
    const nonMxTrabajadorId = 'trabajador456';
    const nonMxCentroTrabajoId = 'centro456';
    const nonMxEmpresaId = 'empresa456';
    const nonMxProveedorSaludId = 'proveedor456';

    beforeEach(() => {
      mockTrabajadorModel.findById.mockResolvedValue({
        _id: nonMxTrabajadorId,
        idCentroTrabajo: nonMxCentroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: nonMxCentroTrabajoId,
        idEmpresa: nonMxEmpresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: nonMxEmpresaId,
        idProveedorSalud: nonMxProveedorSaludId,
      });
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);
    });

    it('should allow document creation without CIE-10 for non-MX provider', async () => {
      const createDto = {
        tipoNota: 'Inicial',
        fechaNotaMedica: new Date('2024-01-01'),
        motivoConsulta: 'Consulta general',
        diagnostico: 'Diagnóstico en texto libre',
        // codigoCIE10Principal missing - should be OK for non-MX
        idTrabajador: nonMxTrabajadorId,
        rutaPDF: '/path/to/pdf',
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      mockNotaMedicaModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(createDto),
      });

      // Mock actualizarUpdatedAtTrabajador
      (service as any).actualizarUpdatedAtTrabajador = jest.fn().mockResolvedValue(undefined);

      const result = await service.createDocument('notaMedica', createDto);
      expect(result).toBeDefined();
      expect(mockCatalogsService.validateCIE10).not.toHaveBeenCalled();
    });

    it('should allow optional CIE-10 codes for non-MX provider', async () => {
      const createDto = {
        tipoNota: 'Inicial',
        fechaNotaMedica: new Date('2024-01-01'),
        motivoConsulta: 'Consulta general',
        diagnostico: 'Diagnóstico en texto libre',
        codigoCIE10Principal: 'A00.0',
        codigosCIE10Secundarios: ['B00.1'],
        idTrabajador: nonMxTrabajadorId,
        rutaPDF: '/path/to/pdf',
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      mockNotaMedicaModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(createDto),
      });

      // Mock actualizarUpdatedAtTrabajador
      (service as any).actualizarUpdatedAtTrabajador = jest.fn().mockResolvedValue(undefined);

      const result = await service.createDocument('notaMedica', createDto);
      expect(result).toBeDefined();
      // Validation should not be called for non-MX (or called but not required)
      // In this case, since it's optional, validation might not be called
    });
  });

  describe('HistoriaClinica CIE-10 Validation', () => {
    const mxTrabajadorId = 'trabajador123';
    const mxCentroTrabajoId = 'centro123';
    const mxEmpresaId = 'empresa123';
    const mxProveedorSaludId = 'proveedor123';

    beforeEach(() => {
      mockTrabajadorModel.findById.mockResolvedValue({
        _id: mxTrabajadorId,
        idCentroTrabajo: mxCentroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: mxCentroTrabajoId,
        idEmpresa: mxEmpresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: mxEmpresaId,
        idProveedorSalud: mxProveedorSaludId,
      });
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
    });

    it('should require codigoCIE10Principal for HistoriaClinica MX provider', async () => {
      const createDto = {
        motivoExamen: 'Ingreso',
        fechaHistoriaClinica: new Date('2024-01-01'),
        resumenHistoriaClinica: 'Resumen de historia clínica',
        // codigoCIE10Principal missing
        idTrabajador: mxTrabajadorId,
        rutaPDF: '/path/to/pdf',
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      mockHistoriaClinicaModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue(createDto),
      });

      await expect(
        service.createDocument('historiaClinica', createDto)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createDocument('historiaClinica', createDto)
      ).rejects.toThrow('Código CIE-10 principal es obligatorio');
    });
  });
});

