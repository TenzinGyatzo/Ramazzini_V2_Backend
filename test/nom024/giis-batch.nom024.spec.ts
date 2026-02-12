/**
 * NOM-024 GIIS Batch Tests (Phase 1 — 1A)
 *
 * Tests GiisBatch schema and GiisBatchService: createBatch, getBatch.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Types } from 'mongoose';
import {
  startMongoMemoryServer,
  stopMongoMemoryServer,
} from '../utils/mongodb-memory.util';
import {
  GiisBatch,
  GiisBatchSchema,
} from '../../src/modules/giis-export/schemas/giis-batch.schema';
import { GiisBatchService } from '../../src/modules/giis-export/giis-batch.service';
import { GiisSerializerService } from '../../src/modules/giis-export/giis-serializer.service';
import {
  Deteccion,
  DeteccionSchema,
} from '../../src/modules/expedientes/schemas/deteccion.schema';
import {
  NotaMedica,
  NotaMedicaSchema,
} from '../../src/modules/expedientes/schemas/nota-medica.schema';
import {
  Lesion,
  LesionSchema,
} from '../../src/modules/expedientes/schemas/lesion.schema';
import {
  Trabajador,
  TrabajadorSchema,
} from '../../src/modules/trabajadores/schemas/trabajador.schema';
import {
  CentroTrabajo,
  CentroTrabajoSchema,
} from '../../src/modules/centros-trabajo/schemas/centro-trabajo.schema';
import {
  Empresa,
  EmpresaSchema,
} from '../../src/modules/empresas/schemas/empresa.schema';
import { RegulatoryPolicyService } from '../../src/utils/regulatory-policy.service';
import { ProveedoresSaludService } from '../../src/modules/proveedores-salud/proveedores-salud.service';
import { GiisValidationService } from '../../src/modules/giis-export/validation/giis-validation.service';
import { GiisCryptoService } from '../../src/modules/giis-export/crypto/giis-crypto.service';
import { GiisExportAuditService } from '../../src/modules/giis-export/giis-export-audit.service';
import { AuditService } from '../../src/modules/audit/audit.service';

const mockGiisValidationService = {
  validateAndFilterRows: jest.fn().mockImplementation(async (_guide, rows) => ({
    validRows: rows,
    excludedReport: { entries: [], totalExcluded: 0 },
    warnings: [],
  })),
};

describe('NOM-024 GIIS Batch (Phase 1A)', () => {
  let service: GiisBatchService;
  let mongoUri: string;

  beforeAll(async () => {
    mongoUri = await startMongoMemoryServer();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: GiisBatch.name, schema: GiisBatchSchema },
          { name: Deteccion.name, schema: DeteccionSchema },
          { name: NotaMedica.name, schema: NotaMedicaSchema },
          { name: Lesion.name, schema: LesionSchema },
          { name: Trabajador.name, schema: TrabajadorSchema },
          { name: CentroTrabajo.name, schema: CentroTrabajoSchema },
          { name: Empresa.name, schema: EmpresaSchema },
        ]),
      ],
      providers: [
        GiisBatchService,
        GiisSerializerService,
        {
          provide: RegulatoryPolicyService,
          useValue: { getRegulatoryPolicy: jest.fn() },
        },
        {
          provide: ProveedoresSaludService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: GiisValidationService,
          useValue: mockGiisValidationService,
        },
        { provide: GiisCryptoService, useValue: {} },
        {
          provide: GiisExportAuditService,
          useValue: { recordGenerationAudit: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: AuditService,
          useValue: { record: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();
    service = module.get<GiisBatchService>(GiisBatchService);
  }, 30000);

  afterAll(async () => {
    await stopMongoMemoryServer();
  }, 10000);

  describe('createBatch and getBatch', () => {
    it('should create batch and read by ID with correct fields', async () => {
      const proveedorId = new Types.ObjectId().toString();
      const yearMonth = '2025-01';

      const batch = await service.createBatch(proveedorId, yearMonth);
      expect(batch).toBeDefined();
      expect(batch._id).toBeDefined();
      expect(batch.status).toBe('pending');
      expect(batch.yearMonth).toBe(yearMonth);
      expect(batch.proveedorSaludId.toString()).toBe(proveedorId);
      expect(batch.artifacts).toEqual([]);
      expect(batch.startedAt).toBeDefined();
      expect(batch.establecimientoClues).toBe('');

      const batchId = batch._id.toString();
      const found = await service.getBatch(batchId);
      expect(found).toBeDefined();
      expect(found!.status).toBe('pending');
      expect(found!.yearMonth).toBe('2025-01');
      expect(found!.proveedorSaludId.toString()).toBe(proveedorId);
    });

    it('should return null for invalid batchId', async () => {
      const found = await service.getBatch('invalid-id');
      expect(found).toBeNull();
    });
  });
});
