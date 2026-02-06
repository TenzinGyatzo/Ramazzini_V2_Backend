/**
 * NOM-024 GIIS Export CEX integration (Phase 1 — 1C)
 * Create batch, generate CEX from 1 NotaMedica (consulta externa) fixture, verify file and batch.
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
import { validNotaMedicaCex } from '../fixtures/nota-medica.fixtures';

const mockGiisValidationService = {
  validateAndFilterRows: jest.fn().mockImplementation(async (_g: string, rows: any[]) => ({
    validRows: rows,
    excludedReport: { entries: [], totalExcluded: 0 },
    warnings: [],
  })),
};
import { validMXTrabajador } from '../fixtures/trabajador.fixtures';
import { mapNotaMedicaToCexRow, getCexSchema, extractCieCode } from '../../src/modules/giis-export/transformers/cex.mapper';

describe('NOM-024 GIIS Export CEX (Phase 1C)', () => {
  let service: GiisBatchService;
  let notaMedicaModel: any;
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
    notaMedicaModel = module.get('NotaMedicaModel');
    trabajadorModel = module.get('TrabajadorModel');
  }, 30000);

  afterAll(async () => {
    await stopMongoMemoryServer();
  }, 10000);

  it('should create batch, generate CEX with 1 consulta externa, and produce valid TXT', async () => {
    const batch = await service.createBatch(proveedorId, yearMonth);
    const batchId = batch._id.toString();

    const trabajador = await trabajadorModel.create({
      ...validMXTrabajador,
      _id: validNotaMedicaCex.idTrabajador,
      escolaridad: 'Licenciatura',
      puesto: 'OPERADOR',
      estadoCivil: 'Soltero/a',
      estadoLaboral: 'Activo',
      idCentroTrabajo: new Types.ObjectId(),
      createdBy: new Types.ObjectId(),
      updatedBy: new Types.ObjectId(),
    });

    await notaMedicaModel.create({
      ...validNotaMedicaCex,
      _id: new Types.ObjectId(),
      fechaNotaMedica: new Date('2025-01-15'),
      idTrabajador: trabajador._id,
    });

    const updated = await service.generateBatchCex(batchId);
    expect(updated).toBeDefined();
    expect(updated!.artifacts).toBeDefined();
    const cexArtifact = updated!.artifacts?.find((a) => a.guide === 'CEX');
    expect(cexArtifact).toBeDefined();
    expect(cexArtifact!.guide).toBe('CEX');
    expect(cexArtifact!.rowCount).toBe(1);

    const relativePath = cexArtifact!.path;
    const fullPath = path.join(process.cwd(), relativePath);
    expect(fs.existsSync(fullPath)).toBe(true);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    const headerLine = lines[0];
    const dataLine = lines[1];
    expect(headerLine).toContain('clues');
    expect(headerLine).toContain('fechaConsulta');
    const delimiter = '|';
    const dataCols = dataLine.split(delimiter);
    expect(dataCols.length).toBe(106);
  });
});

describe('CEX mapper unit', () => {
  it('should output 106 keys from schema and include clues and required fields', () => {
    const schema = getCexSchema();
    expect(schema.fields.length).toBe(106);

    const consulta = {
      fechaNotaMedica: new Date('2025-01-15'),
      codigoCIE10Principal: 'Z00 - EXAMEN GENERAL',
      relacionTemporal: 0,
    };
    const trabajador = {
      curp: 'PEGJ850102HDFRNN08',
      nombre: 'JUAN',
      primerApellido: 'PEREZ',
      segundoApellido: 'GONZALEZ',
      fechaNacimiento: new Date('1985-01-02'),
      sexo: 'Masculino',
      entidadNacimiento: '09',
    };
    const row = mapNotaMedicaToCexRow(consulta, { clues: 'DFSSA001234' }, trabajador);

    expect(Object.keys(row).length).toBe(106);
    expect(row.clues).toBe('DFSSA001234');
    expect(row.curpPaciente).toBe('PEGJ850102HDFRNN08');
    expect(row.fechaConsulta).toBe('15/01/2025');
    expect(row.codigoCIEDiagnostico1).toBe('Z00');
  });

  it('should extract CIE code from "CODE - DESCRIPTION" format', () => {
    expect(extractCieCode('A30 - LEPRA')).toBe('A30');
    expect(extractCieCode('R69X')).toBe('R69X');
    expect(extractCieCode('')).toBe('');
    expect(extractCieCode(undefined)).toBe('');
  });
});
