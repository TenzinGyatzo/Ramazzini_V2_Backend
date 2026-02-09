# Plan 04-02 — Summary

**Status:** Completed  
**Date:** 2026-02-06

## Delivered

- `audit/schemas/audit-event.schema.ts`: proveedorSaludId, actorId, timestamp, actionType, resourceType, resourceId, payload, hashEvento, hashEventoAnterior. Indexes: (proveedorSaludId, timestamp), (proveedorSaludId, actorId, timestamp), (proveedorSaludId, resourceType, resourceId, timestamp). Append-only documented.
- `audit/schemas/audit-outbox.schema.ts`: proveedorSaludId, actorId, timestamp, actionType, payload, eventClass, processedAt, errorMessage. Index (processedAt, createdAt).
- `expedientes/schemas/document-version.schema.ts`: documentType, documentId, version, snapshot (Mixed), proveedorSaludId, createdBy, createdAt. Unique index (proveedorSaludId, documentType, documentId, version).
- `giis-export/schemas/giis-export-audit.schema.ts`: added optional proveedorSaludId; index (proveedorSaludId, fechaHora). Migration note in comment.
- AuditModule: MongooseModule.forFeature(AuditEvent, AuditOutbox). ExpedientesModule: DocumentVersion registered. GiisExportModule unchanged (schema already registered).

## Verification

- Build passes. No data migration run; backfill for GiisExportAudit.proveedorSaludId documented in schema comment.
