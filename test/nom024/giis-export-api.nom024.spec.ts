/**
 * NOM-024 GIIS Export API (Phase 1 — 1E)
 * POST batches, GET batch status, GET download; gate SIRES_NOM024.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import {
  startMongoMemoryServer,
  stopMongoMemoryServer,
} from '../utils/mongodb-memory.util';
import { GiisExportController } from '../../src/modules/giis-export/giis-export.controller';
import { GiisBatchService } from '../../src/modules/giis-export/giis-batch.service';
import { GiisSerializerService } from '../../src/modules/giis-export/giis-serializer.service';
import { GiisBatch, GiisBatchSchema } from '../../src/modules/giis-export/schemas/giis-batch.schema';
import { Deteccion, DeteccionSchema } from '../../src/modules/expedientes/schemas/deteccion.schema';
import { NotaMedica, NotaMedicaSchema } from '../../src/modules/expedientes/schemas/nota-medica.schema';
import { Lesion, LesionSchema } from '../../src/modules/expedientes/schemas/lesion.schema';
import { Trabajador, TrabajadorSchema } from '../../src/modules/trabajadores/schemas/trabajador.schema';
import { RegulatoryPolicyService } from '../../src/utils/regulatory-policy.service';
import { ProveedoresSaludService } from '../../src/modules/proveedores-salud/proveedores-salud.service';
import { UsersService } from '../../src/modules/users/users.service';
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
  preValidate: jest.fn().mockResolvedValue({ errors: [], totalRows: 0 }),
};

describe('NOM-024 GIIS Export API (Phase 1E)', () => {
  let app: INestApplication;
  let giisBatchService: GiisBatchService;
  let usersService: UsersService;
  let proveedorSaludModel: any;
  let userModel: any;
  let deteccionModel: any;
  let mongoUri: string;
  const proveedorId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();

  beforeAll(async () => {
    mongoUri = await startMongoMemoryServer();
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

    const policySires = {
      getRegulatoryPolicy: jest.fn().mockResolvedValue({ regime: 'SIRES_NOM024' }),
    };
    const policySinRegimen = {
      getRegulatoryPolicy: jest.fn().mockResolvedValue({ regime: 'SIN_REGIMEN' }),
    };

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
        ]),
      ],
      controllers: [GiisExportController],
      providers: [
        GiisBatchService,
        GiisSerializerService,
        { provide: RegulatoryPolicyService, useValue: policySires },
        { provide: ProveedoresSaludService, useValue: { findOne: jest.fn().mockResolvedValue({ clues: 'DFSSA001234' }) } },
        { provide: GiisValidationService, useValue: mockGiisValidationService },
        { provide: GiisCryptoService, useValue: {} },
        { provide: GiisExportAuditService, useValue: { recordGenerationAudit: jest.fn().mockResolvedValue({}) } },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockImplementation((id: string) => {
              if (id === userId) return Promise.resolve({ idProveedorSalud: proveedorId });
              return Promise.resolve(null);
            }),
          },
        },
      ],
    })
      .compile();

    app = module.createNestApplication();
    await app.init();

    giisBatchService = module.get<GiisBatchService>(GiisBatchService);
    deteccionModel = module.get('DeteccionModel');
  }, 30000);

  afterAll(async () => {
    await app?.close();
    await stopMongoMemoryServer();
  }, 10000);

  function tokenForUser(uid: string): string {
    return jwt.sign({ id: uid }, process.env.JWT_SECRET!);
  }

  it('POST /giis-export/batches with SIRES → 201 and batchId', async () => {
    const res = await request(app.getHttpServer())
      .post('/giis-export/batches')
      .set('Authorization', `Bearer ${tokenForUser(userId)}`)
      .send({ yearMonth: '2025-01' })
      .expect(201);

    expect(res.body.batchId).toBeDefined();
    expect(res.body.status).toBeDefined();
    expect(res.body.yearMonth).toBe('2025-01');
  });

  it('GET /giis-export/batches/:batchId → 200 and artifacts', async () => {
    const batch = await giisBatchService.createBatchForExport(
      proveedorId,
      '2025-01',
    );
    await deteccionModel.create({
      ...validDeteccionAdult,
      _id: new Types.ObjectId(),
      fechaDeteccion: new Date('2025-01-15'),
    });
    await giisBatchService.generateBatchCdt(batch._id.toString());

    const res = await request(app.getHttpServer())
      .get(`/giis-export/batches/${batch._id.toString()}`)
      .set('Authorization', `Bearer ${tokenForUser(userId)}`)
      .expect(200);

    expect(res.body.status).toBe('completed');
    expect(Array.isArray(res.body.artifacts)).toBe(true);
    const cdt = res.body.artifacts.find((a: any) => a.guide === 'CDT');
    expect(cdt).toBeDefined();
  });

  it('GET /giis-export/batches/:batchId/download/CDT → 200 and header line', async () => {
    const batch = await giisBatchService.createBatchForExport(
      proveedorId,
      '2025-01',
    );
    await deteccionModel.create({
      ...validDeteccionAdult,
      _id: new Types.ObjectId(),
      fechaDeteccion: new Date('2025-01-15'),
    });
    await giisBatchService.generateBatchCdt(batch._id.toString());

    const res = await request(app.getHttpServer())
      .get(`/giis-export/batches/${batch._id.toString()}/download/CDT`)
      .set('Authorization', `Bearer ${tokenForUser(userId)}`)
      .expect(200);

    const firstLine = res.text.split('\n')[0];
    expect(firstLine).toContain('clues');
  });
});

describe('GIIS Export gate SIRES', () => {
  let service: GiisBatchService;
  let mongoUri: string;
  const proveedorId = new Types.ObjectId().toString();

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
        {
          provide: RegulatoryPolicyService,
          useValue: { getRegulatoryPolicy: jest.fn().mockResolvedValue({ regime: 'SIN_REGIMEN' }) },
        },
        { provide: ProveedoresSaludService, useValue: { findOne: jest.fn() } },
        { provide: GiisValidationService, useValue: mockGiisValidationService },
        { provide: GiisCryptoService, useValue: {} },
        { provide: GiisExportAuditService, useValue: { recordGenerationAudit: jest.fn().mockResolvedValue({}) } },
      ],
    }).compile();
    service = module.get<GiisBatchService>(GiisBatchService);
  }, 30000);

  afterAll(async () => {
    await stopMongoMemoryServer();
  }, 10000);

  it('createBatchForExport with SIN_REGIMEN → 403', async () => {
    await expect(
      service.createBatchForExport(proveedorId, '2025-01'),
    ).rejects.toThrow('SIRES_NOM024');
  });
});
