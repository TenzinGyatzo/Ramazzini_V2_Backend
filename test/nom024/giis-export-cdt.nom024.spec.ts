/**
 * NOM-024 GIIS Export CDT integration (Phase 1 — 1B)
 * Create batch, generate CDT from 1 detección fixture, verify file and batch.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Types } from 'mongoose';
import {
  startMongoMemoryServer,
  stopMongoMemoryServer,
} from '../utils/mongodb-memory.util';
import { GiisBatch, GiisBatchSchema } from '../../src/modules/giis-export/schemas/giis-batch.schema';
import { GiisBatchService } from '../../src/modules/giis-export/giis-batch.service';
import { GiisSerializerService } from '../../src/modules/giis-export/giis-serializer.service';
import { Deteccion, DeteccionSchema } from '../../src/modules/expedientes/schemas/deteccion.schema';
import { NotaMedica, NotaMedicaSchema } from '../../src/modules/expedientes/schemas/nota-medica.schema';
import { Lesion, LesionSchema } from '../../src/modules/expedientes/schemas/lesion.schema';
import { RegulatoryPolicyService } from '../../src/utils/regulatory-policy.service';
import { ProveedoresSaludService } from '../../src/modules/proveedores-salud/proveedores-salud.service';
import { GiisValidationService } from '../../src/modules/giis-export/validation/giis-validation.service';
import { GiisCryptoService } from '../../src/modules/giis-export/crypto/giis-crypto.service';
import { GiisExportAuditService } from '../../src/modules/giis-export/giis-export-audit.service';
import { validDeteccionAdult } from '../fixtures/deteccion.fixtures';

const mockGiisValidationService = {
  validateAndFilterRows: jest.fn().mockImplementation(async (_g: string, rows: any[]) => ({
    validRows: rows,
    excludedReport: { entries: [], totalExcluded: 0 },
    warnings: [],
  })),
};

describe('NOM-024 GIIS Export CDT (Phase 1B)', () => {
  let service: GiisBatchService;
  let deteccionModel: any;
  let mongoUri: string;
  const proveedorId = new Types.ObjectId().toString();
  const yearMonth = '2025-01';

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
        ]),
      ],
      providers: [
        GiisBatchService,
        GiisSerializerService,
        { provide: RegulatoryPolicyService, useValue: { getRegulatoryPolicy: jest.fn() } },
        { provide: ProveedoresSaludService, useValue: { findOne: jest.fn() } },
        { provide: GiisValidationService, useValue: mockGiisValidationService },
        { provide: GiisCryptoService, useValue: {} },
        { provide: GiisExportAuditService, useValue: { recordGenerationAudit: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();
    service = module.get<GiisBatchService>(GiisBatchService);
    deteccionModel = module.get('DeteccionModel');
  }, 30000);

  afterAll(async () => {
    await stopMongoMemoryServer();
  }, 10000);

  it('should create batch, generate CDT with 1 detección, and produce valid TXT', async () => {
    const batch = await service.createBatch(proveedorId, yearMonth);
    const batchId = batch._id.toString();

    await deteccionModel.create({
      ...validDeteccionAdult,
      _id: new Types.ObjectId(),
      fechaDeteccion: new Date('2025-01-15'),
    });

    const updated = await service.generateBatchCdt(batchId);
    expect(updated).toBeDefined();
    expect(updated!.status).toBe('completed');
    expect(updated!.artifacts).toHaveLength(1);
    expect(updated!.artifacts![0].guide).toBe('CDT');
    expect(updated!.artifacts![0].rowCount).toBe(1);

    const relativePath = updated!.artifacts![0].path;
    const fullPath = path.join(process.cwd(), relativePath);
    expect(fs.existsSync(fullPath)).toBe(true);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    const headerLine = lines[0];
    const dataLine = lines[1];
    expect(headerLine).toContain('clues');
    const delimiter = '|';
    const dataCols = dataLine.split(delimiter);
    expect(dataCols.length).toBe(92);
  });
});
