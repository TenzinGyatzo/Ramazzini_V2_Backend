/**
 * NOM-024 GIIS Export LES integration (Phase 1 — 1D)
 * Create batch, generate LES from 1 Lesion fixture, verify file and batch.
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
import { Trabajador, TrabajadorSchema } from '../../src/modules/trabajadores/schemas/trabajador.schema';
import { RegulatoryPolicyService } from '../../src/utils/regulatory-policy.service';
import { ProveedoresSaludService } from '../../src/modules/proveedores-salud/proveedores-salud.service';
import { GiisValidationService } from '../../src/modules/giis-export/validation/giis-validation.service';
import { GiisCryptoService } from '../../src/modules/giis-export/crypto/giis-crypto.service';
import { GiisExportAuditService } from '../../src/modules/giis-export/giis-export-audit.service';
import { validLesionAccidental } from '../fixtures/lesion.fixtures';

const mockGiisValidationService = {
  validateAndFilterRows: jest.fn().mockImplementation(async (_g: string, rows: any[]) => ({
    validRows: rows,
    excludedReport: { entries: [], totalExcluded: 0 },
    warnings: [],
  })),
};
import { validMXTrabajador } from '../fixtures/trabajador.fixtures';
import { mapLesionToLesRow, getLesSchema } from '../../src/modules/giis-export/transformers/les.mapper';

describe('NOM-024 GIIS Export LES (Phase 1D)', () => {
  let service: GiisBatchService;
  let lesionModel: any;
  let trabajadorModel: any;
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
          { name: Trabajador.name, schema: TrabajadorSchema },
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
    lesionModel = module.get('LesionModel');
    trabajadorModel = module.get('TrabajadorModel');
  }, 30000);

  afterAll(async () => {
    await stopMongoMemoryServer();
  }, 10000);

  it('should create batch, generate LES with 1 lesión, and produce valid TXT', async () => {
    const batch = await service.createBatch(proveedorId, yearMonth);
    const batchId = batch._id.toString();

    const trabajador = await trabajadorModel.create({
      ...validMXTrabajador,
      _id: new Types.ObjectId(),
      escolaridad: 'Licenciatura',
      puesto: 'OPERADOR',
      estadoCivil: 'Soltero/a',
      estadoLaboral: 'Activo',
      idCentroTrabajo: new Types.ObjectId(),
      createdBy: new Types.ObjectId(),
      updatedBy: new Types.ObjectId(),
    });

    await lesionModel.create({
      ...validLesionAccidental,
      _id: new Types.ObjectId(),
      fechaEvento: new Date('2025-01-10'),
      fechaAtencion: new Date('2025-01-10'),
      idTrabajador: trabajador._id,
      createdBy: new Types.ObjectId(),
      updatedBy: new Types.ObjectId(),
    });

    const updated = await service.generateBatchLes(batchId);
    expect(updated).toBeDefined();
    expect(updated!.artifacts).toBeDefined();
    const lesArtifact = updated!.artifacts?.find((a) => a.guide === 'LES');
    expect(lesArtifact).toBeDefined();
    expect(lesArtifact!.guide).toBe('LES');
    expect(lesArtifact!.rowCount).toBe(1);

    const relativePath = lesArtifact!.path;
    const fullPath = path.join(process.cwd(), relativePath);
    expect(fs.existsSync(fullPath)).toBe(true);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    const headerLine = lines[0];
    const dataLine = lines[1];
    expect(headerLine).toContain('clues');
    expect(headerLine).toContain('fechaAtencion');
    const delimiter = '|';
    const dataCols = dataLine.split(delimiter);
    expect(dataCols.length).toBe(82);
  });
});

describe('LES mapper unit', () => {
  it('should output 82 keys from schema and include clues and required fields', () => {
    const schema = getLesSchema();
    expect(schema.fields.length).toBe(82);

    const lesion = {
      clues: 'DFSSA001234',
      folio: '00000001',
      curpPaciente: 'PEGJ850102HDFRNN08',
      fechaNacimiento: new Date('1985-01-02'),
      sexo: 1,
      fechaEvento: new Date('2025-01-10'),
      horaEvento: '14:30',
      sitioOcurrencia: 1,
      intencionalidad: 1,
      agenteLesion: 5,
      fechaAtencion: new Date('2025-01-10'),
      horaAtencion: '15:00',
      tipoAtencion: [1, 2],
      areaAnatomica: 3,
      consecuenciaGravedad: 2,
      codigoCIEAfeccionPrincipal: 'S01.0',
      codigoCIECausaExterna: 'W01',
      responsableAtencion: 1,
      curpResponsable: 'ROPC850102HDFDRL08',
    };
    const row = mapLesionToLesRow(lesion, { clues: 'DFSSA001234' }, null);

    expect(Object.keys(row).length).toBe(82);
    expect(row.clues).toBeDefined();
    expect(row.folio).toBeDefined();
    expect(row.curpPaciente).toBe('PEGJ850102HDFRNN08');
    expect(row.fechaEvento).toBe('10/01/2025');
    expect(row.codigoCIEAfeccionPrincipal).toBe('S01.0');
    expect(row.codigoCIECausaExterna).toBe('W01');
  });
});
