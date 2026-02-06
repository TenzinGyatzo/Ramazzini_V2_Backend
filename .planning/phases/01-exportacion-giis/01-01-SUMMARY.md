# Plan 01-01 — Summary

**Subfase 1A: Pipeline base y esquema GiisBatch**

## Completado

- Schema `GiisBatch` en `src/modules/giis-export/schemas/giis-batch.schema.ts` con proveedorSaludId, establecimientoClues, yearMonth, status, artifacts, startedAt, completedAt, errorMessage, options.
- `GiisBatchService` en `src/modules/giis-export/giis-batch.service.ts`: createBatch(proveedorSaludId, yearMonth, options?), getBatch(batchId).
- Módulo actualizado: GiisBatch y GiisBatchService registrados en giis-export.module.ts.
- Test `test/nom024/giis-batch.nom024.spec.ts`: crear batch, leer por ID, verificar status/yearMonth/proveedorSaludId; getBatch con ID inválido retorna null.

## Verificación

- `npm run test:nom024 -- --testPathPattern=giis-batch` — 2 tests passed.
