# Resumen Plan 04-05 — Export verificable

## Completado

- **AuditService.exportEvents(proveedorSaludId, from, to, format):** Devuelve Buffer con eventos en rango [from, to] ordenados por timestamp asc. JSON: array de objetos con proveedorSaludId, actorId, timestamp, actionType, resourceType, resourceId, payload, hashEvento, hashEventoAnterior. CSV: cabecera y filas con los mismos datos; Content-Disposition y tipo fijados en controller.
- **AuditService.verifyExport(proveedorSaludId, from, to):** Obtiene eventos en rango ordenados por timestamp; por cada uno reconstruye payload canónico, recalcula hash (computeCanonicalHash), compara con hashEvento almacenado; verifica cadena (hashEventoAnterior del evento i === hashEvento del evento i-1). Devuelve `{ valid, errors? }`.
- **GET /api/audit/export:** Query from, to, format (json|csv). Obtiene proveedorSaludId del usuario; registra AUDIT_EXPORT_DOWNLOAD (Class 1) antes de devolver el archivo; sirve buffer con Content-Type y Content-Disposition.
- **GET /api/audit/verify:** Query from, to. Devuelve resultado de verifyExport para el proveedor del usuario.
- **Frontend:** auditAPI.exportBlob({ from, to, format }), auditAPI.verifyExport({ from, to }). En AuditoriaView: selector JSON/CSV, botón "Exportar auditoría" (descarga blob), botón "Verificar cadena" (muestra valid/errors).

## Archivos modificados

- backend: `audit.service.ts`, `audit.controller.ts`
- frontend: `auditAPI.ts`, `AuditoriaView.vue`

## Criterios verificados

- Export incluye hashEvento y hashEventoAnterior.
- Verificación recalcula hashes y cadena; devuelve valid/errors.
- Descarga del export registra evento AUDIT_EXPORT_DOWNLOAD (Class 1).
