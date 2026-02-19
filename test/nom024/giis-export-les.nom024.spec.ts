/**
 * NOM-024 GIIS Export LES integration (Phase 1 — 1D)
 * Create batch, generate LES from Lesion documents (GIIS-B013), verify file and batch.
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
  getLesSchema,
} from '../../src/modules/giis-export/transformers/les.mapper';

describe('NOM-024 GIIS Export LES (Phase 1D)', () => {
  let service: GiisBatchService;
  let lesionModel: any;
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
            getFirmanteDataForLes: jest.fn().mockResolvedValue(null),
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
    lesionModel = testingModule.get('LesionModel');
    trabajadorModel = testingModule.get('TrabajadorModel');
  }, 30000);

  afterAll(async () => {
    await stopMongoMemoryServer();
  }, 10000);

  it('should create batch, generate LES from Lesion with injury code, and produce valid TXT', async () => {
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

    await lesionModel.create({
      folio: '00000001',
      folioScopeId: proveedorId,
      idProveedorSalud: new Types.ObjectId(proveedorId),
      fechaReporteLesion: new Date('2025-01-10'),
      fechaEvento: new Date('2025-01-10'),
      horaEvento: '14:30',
      sitioOcurrencia: 1,
      intencionalidad: 1,
      agenteLesion: 5,
      areaAnatomica: 3,
      consecuenciaGravedad: 2,
      fechaAtencion: new Date('2025-01-10'),
      horaAtencion: '15:00',
      codigoCIEAfeccionPrincipal: 'S00',
      codigoCIECausaExterna: 'W01',
      causaExterna: 'Caída',
      idTrabajador: trabajador._id,
      estado: DocumentoEstado.FINALIZADO,
      createdBy,
      updatedBy: createdBy,
      finalizadoPor: createdBy,
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
    expect(row.codigoCIEAfeccionPrincipal).toBe('S010');
    expect(row.codigoCIECausaExterna).toBe('W010');
  });

  it('mapLesionToLesRow: lesion with trabajador populates nombre, apellidos y sexo derivado', () => {
    const lesion = {
      folio: '00000001',
      curpPaciente: 'PEGJ850102HDFRNN08',
      fechaNacimiento: new Date('1985-01-02'),
      codigoCIEAfeccionPrincipal: 'S00',
      codigoCIECausaExterna: 'W01',
      causaExterna: 'Caída',
    };
    const trabajador = {
      curp: 'PEGJ850102HDFRNN08',
      nombre: 'Juan',
      primerApellido: 'Perez',
      segundoApellido: 'Gomez',
      fechaNacimiento: new Date('1985-01-02'),
      sexo: 'Masculino',
      entidadNacimiento: '14',
    };
    const row = mapLesionToLesRow(lesion, { clues: 'DFSSA001234' }, trabajador);
    expect(row.sexo).toBe(1);
    expect(row.codigoCIEAfeccionPrincipal).toBe('S000');
    expect(row.codigoCIECausaExterna).toBe('W010');
    expect(row.curpPaciente).toBe('PEGJ850102HDFRNN08');
    expect(row.nombre).toBe('JUAN');
    expect(row.primerApellido).toBe('PEREZ');
    expect(row.segundoApellido).toBe('GOMEZ');
    expect(Object.keys(row).length).toBe(82);
  });

  it('mapLesionToLesRow: lesion with causaExterna W17 normalizes CIE to 4 chars', () => {
    const lesion = {
      folio: '00000002',
      codigoCIEAfeccionPrincipal: 'S00.1',
      codigoCIECausaExterna: 'W17',
      causaExterna: 'Caída',
      fechaAtencion: new Date('2025-01-10'),
    };
    const row = mapLesionToLesRow(lesion, { clues: 'ASSCT000014' }, null);
    expect(row.codigoCIEAfeccionPrincipal).toBe('S001');
    expect(row.codigoCIECausaExterna).toBe('W170');
    expect(row.causaExterna).toBe('Caída');
  });

  it('mapLesionToLesRow: afeccionesTratadas multivalor (Num#Desc#CIE con &)', () => {
    const lesion = {
      folio: '00000004',
      codigoCIEAfeccionPrincipal: 'S00',
      codigoCIECausaExterna: 'W01',
      fechaAtencion: new Date('2025-01-10'),
      afeccionesTratadas: [
        '1#LESION EN MEJILLA#S014',
        '2#FRACTURA COLUMNA#S127',
        '3#CONTUSION RODILLA#S800',
      ],
    };
    const row = mapLesionToLesRow(lesion, { clues: 'DFSSA001234' }, null);
    expect(row.numeroAfeccion).toBe('1&2&3');
    expect(row.descripcionAfeccion).toBe(
      'LESION EN MEJILLA&FRACTURA COLUMNA&CONTUSION RODILLA',
    );
    expect(row.codigoCIEAfeccion).toBe('S014&S127&S800');
  });

  it('mapLesionToLesRow: sin afeccionesTratadas usa afeccion principal como unica', () => {
    const lesion = {
      folio: '00000005',
      codigoCIEAfeccionPrincipal: 'S00',
      descripcionAfeccionPrincipal: 'TRAUMATISMO CABEZA',
      codigoCIECausaExterna: 'W01',
      fechaAtencion: new Date('2025-01-10'),
    };
    const row = mapLesionToLesRow(lesion, { clues: 'DFSSA001234' }, null);
    expect(row.numeroAfeccion).toBe('1');
    expect(row.descripcionAfeccion).toBe('TRAUMATISMO CABEZA');
    expect(row.codigoCIEAfeccion).toBe('S000');
  });

  it('mapLesionToLesRow: municipioOcurrencia y localidadOcurrencia extraen solo CATALOG_KEY del formato compuesto', () => {
    const lesion = {
      folio: '00000006',
      codigoCIEAfeccionPrincipal: 'S00',
      codigoCIECausaExterna: 'W01',
      fechaAtencion: new Date('2025-01-10'),
      municipioOcurrencia: '25-001',
      localidadOcurrencia: '25-001-0001',
    };
    const row = mapLesionToLesRow(lesion, { clues: 'DFSSA001234' }, null);
    expect(row.municipioOcurrencia).toBe('001');
    expect(row.localidadOcurrencia).toBe('0001');
    expect(String(row.municipioOcurrencia).length).toBe(3);
    expect(String(row.localidadOcurrencia).length).toBe(4);
  });

  it('mapLesionToLesRow: municipio/localidad sin valor usa defaults 998/9998', () => {
    const lesion = {
      folio: '00000007',
      codigoCIEAfeccionPrincipal: 'S00',
      codigoCIECausaExterna: 'W01',
      fechaAtencion: new Date('2025-01-10'),
    };
    const row = mapLesionToLesRow(lesion, { clues: 'DFSSA001234' }, null);
    expect(row.municipioOcurrencia).toBe('998');
    expect(row.localidadOcurrencia).toBe('9998');
  });

  it('mapLesionToLesRow: firmanteData (enfermera) deriva curpResponsable y responsableAtencion', () => {
    const lesion = {
      folio: '00000003',
      codigoCIEAfeccionPrincipal: 'S00',
      codigoCIECausaExterna: 'W01',
      fechaAtencion: new Date('2025-01-10'),
    };
    const firmanteData = {
      curp: 'LOMG900315MDFRRN09',
      nombre: 'Maria',
      primerApellido: 'Lopez',
      segundoApellido: 'Garcia',
      cedula: '12345678',
      responsableAtencion: 2,
    };
    const row = mapLesionToLesRow(
      lesion,
      { clues: 'DFSSA001234' },
      null,
      firmanteData,
    );
    expect(row.curpResponsable).toBe('LOMG900315MDFRRN09');
    expect(row.nombreResponsable).toBe('MARIA');
    expect(row.primerApellidoResponsable).toBe('LOPEZ');
    expect(row.segundoApellidoResponsable).toBe('GARCIA');
    expect(row.cedulaResponsable).toBe('12345678');
    expect(row.responsableAtencion).toBe(2);
  });
});
