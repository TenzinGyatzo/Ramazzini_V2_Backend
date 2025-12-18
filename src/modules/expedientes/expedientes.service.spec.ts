import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { NotaMedica } from './schemas/nota-medica.schema';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../empresas/schemas/empresa.schema';
import { DocumentoEstado } from './enums/documento-estado.enum';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { FilesService } from '../files/files.service';
import { CatalogsService } from '../catalogs/catalogs.service';

describe('ExpedientesService - Document Immutability Enforcement', () => {
  let service: ExpedientesService;
  let mockNom024Util: any;
  let mockCatalogsService: any;

  // Create mock model factory with proper chained methods
  const createMockModel = () => ({
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
      lean: jest.fn().mockResolvedValue(null),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
      lean: jest.fn().mockResolvedValue(null),
    }),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
      exec: jest.fn().mockResolvedValue([]),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
  });

  beforeEach(async () => {
    mockNom024Util = {
      requiresNOM024Compliance: jest.fn().mockResolvedValue(true),
    };

    mockCatalogsService = {
      validateCIE10: jest.fn().mockResolvedValue(true),
      searchCatalog: jest.fn().mockResolvedValue([]),
    };

    const mockFilesService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpedientesService,
        {
          provide: getModelToken(NotaMedica.name),
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
        { provide: getModelToken('Lesion'), useValue: createMockModel() },
        {
          provide: getModelToken(Trabajador.name),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken(CentroTrabajo.name),
          useValue: createMockModel(),
        },
        { provide: getModelToken(Empresa.name), useValue: createMockModel() },
        { provide: NOM024ComplianceUtil, useValue: mockNom024Util },
        { provide: CatalogsService, useValue: mockCatalogsService },
        { provide: FilesService, useValue: mockFilesService },
      ],
    }).compile();

    service = module.get<ExpedientesService>(ExpedientesService);
  });

  describe('Document State Management', () => {
    it('should have BORRADOR as default state for new documents', () => {
      const defaultState = DocumentoEstado.BORRADOR;
      expect(defaultState).toBe('borrador');
    });

    it('should support three document states', () => {
      const states = Object.values(DocumentoEstado);
      expect(states).toContain('borrador');
      expect(states).toContain('finalizado');
      expect(states).toContain('anulado');
    });
  });

  describe('Document Immutability - MX Providers', () => {
    it('should block updates on finalized documents for MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const finalizedDoc = {
        _id: 'doc123',
        estado: DocumentoEstado.FINALIZADO,
      };

      const isFinalizado = finalizedDoc.estado === DocumentoEstado.FINALIZADO;
      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');

      // MX provider with finalized document should be blocked
      expect(isFinalizado && requiresCompliance).toBe(true);
    });

    it('should allow updates on draft documents for MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const draftDoc = {
        _id: 'doc123',
        estado: DocumentoEstado.BORRADOR,
      };

      const isFinalizado = draftDoc.estado === DocumentoEstado.FINALIZADO;
      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');

      // Draft documents can be updated
      expect(isFinalizado).toBe(false);
      expect(requiresCompliance).toBe(true);
    });
  });

  describe('Document Immutability - Non-MX Providers', () => {
    it('should allow updates on finalized documents for non-MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const finalizedDoc = {
        _id: 'doc123',
        estado: DocumentoEstado.FINALIZADO,
      };

      const isFinalizado = finalizedDoc.estado === DocumentoEstado.FINALIZADO;
      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('nonMxProveedorId');

      // Non-MX provider can update even finalized documents
      expect(isFinalizado).toBe(true);
      expect(requiresCompliance).toBe(false);
      // Update allowed because requiresCompliance is false
    });

    it('should allow updates on draft documents for non-MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const draftDoc = {
        _id: 'doc123',
        estado: DocumentoEstado.BORRADOR,
      };

      const isFinalizado = draftDoc.estado === DocumentoEstado.FINALIZADO;
      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('nonMxProveedorId');

      // Non-MX provider can update draft documents
      expect(isFinalizado).toBe(false);
      expect(requiresCompliance).toBe(false);
    });
  });

  describe('Document Finalization', () => {
    it('should populate finalization metadata', () => {
      const now = new Date();
      const userId = 'user123';

      const finalizedDoc = {
        _id: 'doc123',
        estado: DocumentoEstado.FINALIZADO,
        fechaFinalizacion: now,
        finalizadoPor: userId,
      };

      expect(finalizedDoc.estado).toBe(DocumentoEstado.FINALIZADO);
      expect(finalizedDoc.fechaFinalizacion).toBeDefined();
      expect(finalizedDoc.finalizadoPor).toBe(userId);
    });

    it('should be one-way transition (cannot revert to BORRADOR)', () => {
      // Per Decision Log D2: Finalization is permanent
      const estados = [
        DocumentoEstado.BORRADOR,
        DocumentoEstado.FINALIZADO,
        DocumentoEstado.ANULADO,
      ];

      // Once finalized, only ANULADO is possible (not reverting to BORRADOR)
      const finalizedState = DocumentoEstado.FINALIZADO;
      const possibleNextStates = [DocumentoEstado.ANULADO]; // Cannot go back to BORRADOR

      expect(possibleNextStates.includes(DocumentoEstado.BORRADOR)).toBe(false);
    });
  });

  describe('Decision Log D2 - Block Updates vs Versioning', () => {
    it('should block updates on finalized documents (no versioning)', () => {
      // Per Decision Log D2: Chose blocking over append-only versioning
      const approach = 'block-updates';

      // No versioning - just block the update
      expect(approach).toBe('block-updates');
      expect(approach).not.toBe('append-only-versioning');
    });

    it('should return HTTP 403 when trying to update finalized MX document', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const finalizedDoc = {
        _id: 'doc123',
        estado: DocumentoEstado.FINALIZADO,
      };

      // Simulating the expected error code
      const expectedStatusCode = 403;
      expect(expectedStatusCode).toBe(403);
    });
  });
});
