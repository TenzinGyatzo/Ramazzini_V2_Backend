/**
 * NOM-024 GIIS Export LES integration (Phase 1 — 1D)
 * Create batch, generate LES from NotaMedica with injury codes (S00-T98 / V01-Y98), verify file and batch.
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
import { DocumentoEstado } from '../../src/modules/expedientes/enums/documento-estado.enum';
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
import { AuditService } from '../../src/modules/audit/audit.service';
import { ProveedoresSaludService } from '../../src/modules/proveedores-salud/proveedores-salud.service';
import { GiisValidationService } from '../../src/modules/giis-export/validation/giis-validation.service';
import { GiisCryptoService } from '../../src/modules/giis-export/crypto/giis-crypto.service';
import { GiisExportAuditService } from '../../src/modules/giis-export/giis-export-audit.service';
import { FirmanteHelper } from '../../src/modules/expedientes/helpers/firmante-helper';
import { CatalogsService } from '../../src/modules/catalogs/catalogs.service';

const mockGiisValidationService = {
  validateAndFilterRows: jest
    .fn()
    .mockImplementation(async (_g: string, rows: any[]) => ({
      validRows: rows,
      excludedReport: { entries: [], totalExcluded: 0 },
      warnings: [],
    })),
};
import { validMXTrabajador } from '../fixtures/trabajador.fixtures';
import {
  mapLesionToLesRow,
  mapNotaMedicaToLesRows,
  getLesSchema,
} from '../../src/modules/giis-export/transformers/les.mapper';

describe('NOM-024 GIIS Export LES (Phase 1D)', () => {
  let service: GiisBatchService;
  let notaMedicaModel: any;
  let trabajadorModel: any;
  let testingModule: TestingModule;
  let mongoUri: string;
  const proveedorId = new Types.ObjectId().toString();
  const yearMonth = '2025-01';

  beforeAll(async () => {
    mongoUri = await startMongoMemoryServer();
    testingModule = await Test.createTestingModule({
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
        { provide: ProveedoresSaludService, useValue: { findOne: jest.fn() } },
        { provide: GiisValidationService, useValue: mockGiisValidationService },
        { provide: GiisCryptoService, useValue: {} },
        {
          provide: GiisExportAuditService,
          useValue: { recordGenerationAudit: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: AuditService,
          useValue: { record: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: FirmanteHelper,
          useValue: {
            getPrestadorDataFromUser: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: CatalogsService,
          useValue: {
            getPaisCatalogKeyFromNacionalidad: jest.fn().mockReturnValue(142),
          },
        },
      ],
    }).compile();
    service = testingModule.get<GiisBatchService>(GiisBatchService);
    notaMedicaModel = testingModule.get('NotaMedicaModel');
    trabajadorModel = testingModule.get('TrabajadorModel');
  }, 30000);

  afterAll(async () => {
    await stopMongoMemoryServer();
  }, 10000);

  it('should create batch, generate LES from NotaMedica with injury code, and produce valid TXT', async () => {
    const empresaModel = testingModule.get('EmpresaModel');
    const centroTrabajoModel = testingModule.get('CentroTrabajoModel');
    const createdBy = new Types.ObjectId();

    const empresa = await empresaModel.create({
      nombreComercial: 'Test SA',
      razonSocial: 'Test SA',
      RFC: 'TST123456ABC',
      idProveedorSalud: proveedorId,
      createdBy,
      updatedBy: createdBy,
    });
    const centro = await centroTrabajoModel.create({
      nombreCentro: 'Centro 1',
      idEmpresa: empresa._id,
      createdBy,
      updatedBy: createdBy,
    });

    const batch = await service.createBatch(proveedorId, yearMonth);
    const batchId = batch._id.toString();

    const trabajador = await trabajadorModel.create({
      ...validMXTrabajador,
      _id: new Types.ObjectId(),
      escolaridad: 'Licenciatura',
      puesto: 'OPERADOR',
      estadoCivil: 'Soltero/a',
      estadoLaboral: 'Activo',
      idCentroTrabajo: centro._id,
      createdBy,
      updatedBy: createdBy,
    });

    await notaMedicaModel.create({
      tipoNota: 'Inicial',
      fechaNotaMedica: new Date('2025-01-10'),
      motivoConsulta: 'Traumatismo',
      codigoCIE10Principal: 'S00 - TRAUMATISMO SUPERFICIAL DE LA CABEZA',
      codigoCIECausaExterna: 'W01',
      causaExterna: 'Caída',
      idTrabajador: trabajador._id,
      rutaPDF: '/path/to/pdf',
      estado: DocumentoEstado.FINALIZADO,
      createdBy,
      updatedBy: createdBy,
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
  it('should output 82 keys from schema and include clues and required fields (mapLesionToLesRow)', () => {
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

  it('mapNotaMedicaToLesRows: nota with injury code S00 generates 1 row', () => {
    const nota = {
      _id: new Types.ObjectId(),
      fechaNotaMedica: new Date('2025-01-15'),
      codigoCIE10Principal: 'S00',
      codigoCIECausaExterna: 'W01',
    };
    const trabajador = {
      curp: 'PEGJ850102HDFRNN08',
      nombre: 'Juan',
      primerApellido: 'Perez',
      segundoApellido: 'Gomez',
      fechaNacimiento: new Date('1985-01-02'),
      sexo: 'H',
      entidadNacimiento: '14',
    };
    const rows = mapNotaMedicaToLesRows(
      nota,
      { clues: 'DFSSA001234' },
      trabajador,
      null,
    );
    expect(rows.length).toBe(1);
    expect(rows[0].codigoCIEAfeccionPrincipal).toBe('S00');
    expect(rows[0].codigoCIECausaExterna).toBe('W01');
    expect(rows[0].curpPaciente).toBe('PEGJ850102HDFRNN08');
    expect(rows[0].nombre).toBe('JUAN');
    expect(rows[0].primerApellido).toBe('PEREZ');
    expect(Object.keys(rows[0]).length).toBe(82);
  });

  it('mapNotaMedicaToLesRows: nota with only A04 (no injury) returns 0 rows', () => {
    const nota = {
      _id: new Types.ObjectId(),
      fechaNotaMedica: new Date('2025-01-15'),
      codigoCIE10Principal: 'A04',
    };
    const rows = mapNotaMedicaToLesRows(
      nota,
      { clues: 'DFSSA001234' },
      null,
      null,
    );
    expect(rows.length).toBe(0);
  });

  it('mapNotaMedicaToLesRows: nota with S00 + codigoCIECausaExterna W17 has both codes', () => {
    const nota = {
      _id: new Types.ObjectId(),
      fechaNotaMedica: new Date('2025-01-10'),
      codigoCIE10Principal: 'S00 - TRAUMATISMO',
      codigoCIECausaExterna: 'W17',
      causaExterna: 'Caída',
    };
    const rows = mapNotaMedicaToLesRows(
      nota,
      { clues: 'ASSCT000014' },
      null,
      null,
    );
    expect(rows.length).toBe(1);
    expect(rows[0].codigoCIEAfeccionPrincipal).toBe('S00');
    expect(rows[0].codigoCIECausaExterna).toBe('W17');
    expect(rows[0].causaExterna).toBe('Caída');
  });
});
