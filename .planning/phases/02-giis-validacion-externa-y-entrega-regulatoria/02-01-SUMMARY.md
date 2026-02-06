# Plan 02-01 — Summary

**Subfase 2A: Validación profunda por campo**

## Completado

- **validation.types.ts:** Interfaces `ValidationError`, `PreValidationResult`, `ExcludedRowReport`, `ValidateAndFilterResult`, `ValidationStatus`.
- **schema-based-validator.ts:** `validateRowAgainstSchema(guide, schema, row, rowIndex, catalogLookup?)` implementa reglas derivadas de validationRaw: required, maxLength, CURP (formato + genérico), CLUES (11 chars o 9998 + catálogo opcional), nombres (A-Z Ñ, especiales permitidos, sin doble especial), fecha dd/mm/aaaa, catálogos PAIS, ENTIDAD FEDERATIVA, TIPO PERSONAL, AFILIACION vía `CatalogLookup`. Regla cruzada: si CURP genérico se omite validación de nombres.
- **GiisValidationService:** `preValidate(proveedorSaludId, yearMonth, guides, establecimientoClues?)` (no escribe TXT; devuelve errores para grid). `validateAndFilterRows(guide, rows, schema, catalogLookup?)` devuelve `validRows`, `excludedReport`, `warnings`.
- **GiisBatchService:** Integración: antes de serializar en generateBatchCdt/Cex/Les se llama a `validateAndFilterRows`; se serializa solo `validRows`; se guarda `excludedReport` y `validationStatus` en el batch (validated / has_warnings / has_blockers). Reporte de excluidos fusionado entre las tres guías.
- **Schema GiisBatch:** Campos `validationStatus`, `excludedReport` (entries + totalExcluded).
- **Controller:** `POST /giis-export/prevalidate` (body: yearMonth, guides); `GET /giis-export/batches/:batchId/excluded-report` (JSON o `?format=csv`). `GET /batches/:batchId` incluye `validationStatus`.
- **Tests:** `test/nom024/giis-validation.nom024.spec.ts` (validador: obligatorio vacío, sync, CURP inválido). Mocks de `GiisValidationService` en giis-batch, giis-export-cdt/cex/les, giis-export-api.

## Notas

- Catálogos opcionales: cuando `CatalogLookup` no tiene implementación o el catálogo no está cargado, la validación de catálogo se omite (no bloquea).
- Roles para excluded-report: mismo gate SIRES y ownership que el resto del controller (Principal/Administrador vía getProveedorSaludIdFromRequest).
