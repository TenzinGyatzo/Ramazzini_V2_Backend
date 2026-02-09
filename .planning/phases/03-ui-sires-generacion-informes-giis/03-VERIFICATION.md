# Phase 3: UI SIRES — Generación de informes GIIS — Verification

**Date:** 2026-02-05  
**Status:** passed

## Goal (from ROADMAP)

UI para que el proveedor SIRES genere y obtenga informes GIIS: elegir período, disparar generación, ver estado y descargar CDT/CEX/LES (apoyado en Phase 1 y 2).

## must_haves verification

### Plan 03-01 — Backend list batches

| Criterio | Estado |
|----------|--------|
| GET /giis-export/batches lista del proveedor; 403 si no SIRES | ✓ Controller listBatches con getProveedorSaludIdFromRequest y policy.regime check |
| Respuesta con batchId, yearMonth, status, completedAt, validationStatus, establecimientoClues, errorMessage, excludedReport, artifacts | ✓ listBatchesForProveedor devuelve BatchListItem[] con todos los campos |
| Orden yearMonth descendente | ✓ sort({ yearMonth: -1 }) |
| Sin paginación | ✓ |

### Plan 03-02 — Frontend

| Criterio | Estado |
|----------|--------|
| Menú "Exportación GIIS" solo Principal/Administrador y giisExportEnabled; ruta en condición del menú | ✓ LayOut.vue: v-if con role y proveedorSaludStore.giisExportEnabled; 'exportacion-giis' en lista de route.name |
| Ruta /exportacion-giis y vista con validación de rol y SIRES | ✓ router/index.ts; ExportacionGiisView con isPrincipalOrAdmin y giisExportEnabled |
| Formulario mes/año, Generar, spinner, listado, descargas CDT/CEX/LES, errores, 9998, estado vacío | ✓ ExportacionGiisView.vue implementado |
| API listBatches, createBatch, getBatch, downloadFile, downloadExcludedReportCsv | ✓ giisExportAPI.ts |
| Un job a la vez (botón deshabilitado durante generación o si hay batch generating) | ✓ canGenerate y hasGeneratingBatch |

## Artifacts

- Backend: giis-batch.service.ts (listBatchesForProveedor), giis-export.controller.ts (GET batches).
- Frontend: api/giisExportAPI.ts, views/ExportacionGiisView.vue, views/LayOut.vue (menú), router/index.ts (ruta).

## Result

**passed** — Phase 3 goal met; UI SIRES Exportación GIIS operativa según CONTEXT.md.
