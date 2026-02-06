# Plan 01-05 — Summary

**Subfase 1E: API (create batch, status, download) + CLUES + gate SIRES**

## Completado

- **Resolución CLUES y gate SIRES (Task 5.1):**
  - `GiisBatchService.createBatchForExport(proveedorSaludId, yearMonth, options)`: obtiene política con `RegulatoryPolicyService.getRegulatoryPolicy`; si `regime !== 'SIRES_NOM024'` lanza `ForbiddenException`. Obtiene proveedor con `ProveedoresSaludService.findOne`; `establecimientoClues` = `formatCLUES(proveedor.clues)` si válido (11 chars), sino `"9998"` (modo privado SMP). Crea batch con ese `establecimientoClues`. Los mappers CDT/CEX/LES reciben `context.clues` desde el batch.
  - Servicio inyecta `RegulatoryPolicyService` y `ProveedoresSaludService`; `ProveedoresSaludModule` ya exportaba ambos.

- **Controller y endpoints (Task 5.2):**
  - `GiisExportController` (`giis-export.controller.ts`): prefijo `giis-export`.
  - **POST** `giis-export/batches`: body `CreateBatchDto` { yearMonth, onlyFinalized? }; obtiene `proveedorSaludId` del usuario autenticado (JWT → `getUserIdFromRequest` → `UsersService.findById` → `idProveedorSalud`); llama `createBatchForExport`, luego `generateBatchCdt`, `generateBatchCex`, `generateBatchLes` (síncrono); respuesta `{ batchId, status, yearMonth, establecimientoClues }`.
  - **GET** `giis-export/batches/:batchId`: verifica pertenencia (batch.proveedorSaludId === usuario) y régimen SIRES; devuelve batch con artifacts.
  - **GET** `giis-export/batches/:batchId/download/:guide` (guide = CDT | CEX | LES): misma verificación; sirve archivo TXT con `Content-Type: text/plain; charset=windows-1252` y `Content-Disposition: attachment`.
  - DTO `create-batch.dto.ts` con validación `yearMonth` YYYY-MM.
  - Módulo: `GiisExportController` registrado; importados `ProveedoresSaludModule` (ya existía) y `UsersModule` (forwardRef).

- **Tests API y gate (Task 5.3):**
  - `test/nom024/giis-export-api.nom024.spec.ts`: POST con proveedor SIRES (mocks) → 201 y batchId; GET batch → 200 y artifacts; GET download/CDT → 200 y primera línea con header (clues). Describe aparte: `createBatchForExport` con política SIN_REGIMEN → 403.
  - Tests existentes de batch/CDT/CEX/LES actualizados con mocks de `RegulatoryPolicyService` y `ProveedoresSaludService` para no romper inyección de `GiisBatchService`.

## Verificación

- Tests nom024 para giis-export-api, giis-batch, giis-export-cdt, giis-export-cex, giis-export-les y resto de giis pasan.
- Solo tenants SIRES_NOM024 pueden crear batch y descargar; CLUES resuelta a real o 9998.
- Phase 1 no incluye 3DES/ZIP (solo TXT plano).
