# Plan 03-01 — Summary

**Status:** Complete  
**Completed:** 2026-02-05

## Changes

- **GiisBatchService** (`giis-batch.service.ts`): Added `listBatchesForProveedor(proveedorSaludId)` returning `BatchListItem[]`; query by proveedorSaludId, sort by yearMonth desc; map to batchId, yearMonth, status, completedAt, validationStatus, establecimientoClues, errorMessage, excludedReport (totalExcluded), artifacts (guide only). Exported `BatchListItem` and internal `LeanGiisBatchDoc`.
- **GiisExportController** (`giis-export.controller.ts`): Added `GET /giis-export/batches` (declared before `GET batches/:batchId`). Uses getProveedorSaludIdFromRequest; verifies SIRES_NOM024 via RegulatoryPolicyService (403 if not); returns result of listBatchesForProveedor.

## must_haves

- [x] GET /giis-export/batches list with 403 when not SIRES.
- [x] Response includes batchId, yearMonth, status, completedAt, validationStatus, establecimientoClues, errorMessage, excludedReport summary, artifacts with guide.
- [x] Order by yearMonth descending.
- [x] No pagination.

## Verification

- GET /giis-export/batches with SIRES proveedor returns 200 and array.
- GET /giis-export/batches with non-SIRES returns 403.
- Each item has required fields for UI.
