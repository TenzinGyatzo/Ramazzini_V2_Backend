import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { NotaMedica } from './schemas/nota-medica.schema';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../empresas/schemas/empresa.schema';
import { DocumentoEstado } from './enums/documento-estado.enum';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { FilesService } from '../files/files.service';

describe('ExpedientesService - Document Immutability Enforcement', () => {
  let service: ExpedientesService;
  let notaMedicaModel: Model<NotaMedica>;
  let trabajadorModel: Model<Trabajador>;
  let centroTrabajoModel: Model<CentroTrabajo>;
  let empresaModel: Model<Empresa>;
  let nom024Util: NOM024ComplianceUtil;

  const mockNotaMedicaModel = {
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

  const mockNom024Util = {
    requiresNOM024Compliance: jest.fn(),
  };

  const mockFilesService = {
    // Add any methods used by ExpedientesService
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpedientesService,
        {
          provide: getModelToken(NotaMedica.name),
          useValue: mockNotaMedicaModel,
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
          provide: getModelToken('HistoriaClinica'),
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
    notaMedicaModel = module.get<Model<NotaMedica>>(getModelToken(NotaMedica.name));
    trabajadorModel = module.get<Model<Trabajador>>(getModelToken(Trabajador.name));
    centroTrabajoModel = module.get<Model<CentroTrabajo>>(getModelToken(CentroTrabajo.name));
    empresaModel = module.get<Model<Empresa>>(getModelToken(Empresa.name));
    nom024Util = module.get<NOM024ComplianceUtil>(NOM024ComplianceUtil);

    jest.clearAllMocks();
  });

  describe('MX Provider - Finalized Document Immutability', () => {
    it('should block update of finalized document for MX provider', async () => {
      const documentId = 'doc123';
      const trabajadorId = 'trabajador123';
      const centroTrabajoId = 'centro123';
      const empresaId = 'empresa123';
      const proveedorSaludId = 'proveedor123';

      const finalizedDocument = {
        _id: documentId,
        idTrabajador: trabajadorId,
        estado: DocumentoEstado.FINALIZADO,
        fechaNotaMedica: new Date('2024-01-01'),
        fechaFinalizacion: new Date('2024-01-02'),
        finalizadoPor: 'user123',
      };

      const updateDto = {
        fechaNotaMedica: '2024-01-01T00:00:00.000Z',
        idTrabajador: trabajadorId,
        motivoConsulta: 'Updated motivo',
      };

      const trabajador = {
        _id: trabajadorId,
        idCentroTrabajo: centroTrabajoId,
      };

      const centroTrabajo = {
        _id: centroTrabajoId,
        idEmpresa: empresaId,
      };

      const empresa = {
        _id: empresaId,
        idProveedorSalud: proveedorSaludId,
      };

      mockNotaMedicaModel.findById.mockResolvedValue(finalizedDocument);
      mockTrabajadorModel.findById.mockResolvedValue(trabajador);
      mockCentroTrabajoModel.findById.mockResolvedValue(centroTrabajo);
      mockEmpresaModel.findById.mockResolvedValue(empresa);
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true); // MX provider

      await expect(
        service.updateOrCreateDocument('notaMedica', documentId, updateDto)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateOrCreateDocument('notaMedica', documentId, updateDto)
      ).rejects.toThrow('No se puede actualizar un documento finalizado');
    });

    it('should allow update of borrador document for MX provider', async () => {
      const documentId = 'doc123';
      const trabajadorId = 'trabajador123';

      const borradorDocument = {
        _id: documentId,
        idTrabajador: trabajadorId,
        estado: DocumentoEstado.BORRADOR,
        fechaNotaMedica: new Date('2024-01-01'),
        save: jest.fn(),
      };

      const updateDto = {
        fechaNotaMedica: '2024-01-01T00:00:00.000Z',
        idTrabajador: trabajadorId,
        motivoConsulta: 'Updated motivo',
      };

      mockNotaMedicaModel.findById.mockResolvedValue(borradorDocument);
      mockNotaMedicaModel.findByIdAndUpdate.mockResolvedValue({
        ...borradorDocument,
        ...updateDto,
      });

      // Mock actualizarUpdatedAtTrabajador
      (service as any).actualizarUpdatedAtTrabajador = jest.fn().mockResolvedValue(undefined);

      const result = await service.updateOrCreateDocument('notaMedica', documentId, updateDto);
      expect(result).toBeDefined();
      // Should not throw ForbiddenException
    });
  });

  describe('Non-MX Provider - Finalized Document Mutability', () => {
    it('should allow update of finalized document for non-MX provider', async () => {
      const documentId = 'doc123';
      const trabajadorId = 'trabajador123';
      const centroTrabajoId = 'centro123';
      const empresaId = 'empresa123';
      const proveedorSaludId = 'proveedor123';

      const finalizedDocument = {
        _id: documentId,
        idTrabajador: trabajadorId,
        estado: DocumentoEstado.FINALIZADO,
        fechaNotaMedica: new Date('2024-01-01'),
        fechaFinalizacion: new Date('2024-01-02'),
        finalizadoPor: 'user123',
      };

      const updateDto = {
        fechaNotaMedica: '2024-01-01T00:00:00.000Z',
        idTrabajador: trabajadorId,
        motivoConsulta: 'Updated motivo',
      };

      const trabajador = {
        _id: trabajadorId,
        idCentroTrabajo: centroTrabajoId,
      };

      const centroTrabajo = {
        _id: centroTrabajoId,
        idEmpresa: empresaId,
      };

      const empresa = {
        _id: empresaId,
        idProveedorSalud: proveedorSaludId,
      };

      mockNotaMedicaModel.findById.mockResolvedValue(finalizedDocument);
      mockTrabajadorModel.findById.mockResolvedValue(trabajador);
      mockCentroTrabajoModel.findById.mockResolvedValue(centroTrabajo);
      mockEmpresaModel.findById.mockResolvedValue(empresa);
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false); // Non-MX provider
      mockNotaMedicaModel.findByIdAndUpdate.mockResolvedValue({
        ...finalizedDocument,
        ...updateDto,
      });

      // Mock actualizarUpdatedAtTrabajador
      (service as any).actualizarUpdatedAtTrabajador = jest.fn().mockResolvedValue(undefined);

      const result = await service.updateOrCreateDocument('notaMedica', documentId, updateDto);
      expect(result).toBeDefined();
      // Should not throw ForbiddenException
    });
  });

  describe('Finalize Document', () => {
    it('should finalize a document successfully', async () => {
      const documentId = 'doc123';
      const userId = 'user123';
      const trabajadorId = 'trabajador123';

      const borradorDocument = {
        _id: documentId,
        idTrabajador: trabajadorId,
        estado: DocumentoEstado.BORRADOR,
        fechaNotaMedica: new Date('2024-01-01'),
        save: jest.fn().mockResolvedValue({
          _id: documentId,
          estado: DocumentoEstado.FINALIZADO,
          fechaFinalizacion: new Date(),
          finalizadoPor: userId,
        }),
      };

      mockNotaMedicaModel.findById.mockResolvedValue(borradorDocument);

      // Mock actualizarUpdatedAtTrabajador
      (service as any).actualizarUpdatedAtTrabajador = jest.fn().mockResolvedValue(undefined);

      const result = await service.finalizarDocumento('notaMedica', documentId, userId);

      expect(result.estado).toBe(DocumentoEstado.FINALIZADO);
      expect(result.fechaFinalizacion).toBeDefined();
      expect(result.finalizadoPor).toBe(userId);
      expect(borradorDocument.save).toHaveBeenCalled();
    });

    it('should reject finalizing an already finalized document', async () => {
      const documentId = 'doc123';
      const userId = 'user123';

      const finalizedDocument = {
        _id: documentId,
        estado: DocumentoEstado.FINALIZADO,
        fechaNotaMedica: new Date('2024-01-01'),
      };

      mockNotaMedicaModel.findById.mockResolvedValue(finalizedDocument);

      await expect(
        service.finalizarDocumento('notaMedica', documentId, userId)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.finalizarDocumento('notaMedica', documentId, userId)
      ).rejects.toThrow('ya está finalizado');
    });
  });
});

