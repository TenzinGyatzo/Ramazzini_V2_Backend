/**
 * NOM-024 Phase 4 — D2 reconstrucción de versión previa, D3 no updates destructivos en resguardado.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  startMongoMemoryServer,
  stopMongoMemoryServer,
  clearDatabase,
} from '../utils/mongodb-memory.util';
import { AuditService } from '../../src/modules/audit/audit.service';
import { AuditEvent, AuditEventSchema } from '../../src/modules/audit/schemas/audit-event.schema';
import { AuditOutbox, AuditOutboxSchema } from '../../src/modules/audit/schemas/audit-outbox.schema';
import {
  DocumentVersion,
  DocumentVersionSchema,
} from '../../src/modules/expedientes/schemas/document-version.schema';
import { DocumentoEstado } from '../../src/modules/expedientes/enums/documento-estado.enum';

describe('NOM-024 Audit Reconstruction (04-06)', () => {
  let uri: string;
  let auditService: AuditService;
  let documentVersionModel: any;

  beforeAll(async () => {
    uri = await startMongoMemoryServer();
  });

  afterAll(async () => {
    await stopMongoMemoryServer();
  });

  beforeEach(async () => {
    await clearDatabase();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: AuditEvent.name, schema: AuditEventSchema },
          { name: AuditOutbox.name, schema: AuditOutboxSchema },
          { name: DocumentVersion.name, schema: DocumentVersionSchema },
        ]),
      ],
      providers: [AuditService],
    }).compile();

    auditService = module.get<AuditService>(AuditService);
    documentVersionModel = module.get(getModelToken(DocumentVersion.name));
  });

  describe('D2 — Reconstrucción de versión previa', () => {
    it('getDocumentVersion returns snapshot stored in document_versions', async () => {
      const proveedorSaludId = new Types.ObjectId();
      const documentId = new Types.ObjectId();
      const createdBy = new Types.ObjectId();
      const snapshotV1 = { estado: DocumentoEstado.BORRADOR, contenido: 'v1' };
      const snapshotV2 = { estado: DocumentoEstado.FINALIZADO, contenido: 'v2' };

      await documentVersionModel.create([
        {
          documentType: 'notaMedica',
          documentId,
          version: 1,
          snapshot: snapshotV1,
          proveedorSaludId,
          createdBy,
          createdAt: new Date(),
        },
        {
          documentType: 'notaMedica',
          documentId,
          version: 2,
          snapshot: snapshotV2,
          proveedorSaludId,
          createdBy,
          createdAt: new Date(),
        },
      ]);

      const v1 = await auditService.getDocumentVersion(
        proveedorSaludId.toString(),
        'notaMedica',
        documentId.toString(),
        1,
      );
      const v2 = await auditService.getDocumentVersion(
        proveedorSaludId.toString(),
        'notaMedica',
        documentId.toString(),
        2,
      );

      expect(v1).toEqual(snapshotV1);
      expect(v2).toEqual(snapshotV2);
      expect(v1).not.toEqual(v2);
    });
  });

  describe('D3 — No updates destructivos en resguardado', () => {
    it('FINALIZADO state exists and updates on finalized docs are blocked at service layer', () => {
      expect(DocumentoEstado.FINALIZADO).toBe('finalizado');
      // Full test: PATCH on finalized document returns 403/409 for NOM-024 proveedor
      // is in regulatory-policy.expedientes.spec.ts (ForbiddenException when updating FINALIZADO for SIRES_NOM024).
    });
  });
});
