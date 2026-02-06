# Plan 02-03 — Summary

**Subfase 2C: Operación y auditoría**

## Completado

- **Schema GiisExportAudit:** usuarioGeneradorId, fechaHora, periodo, establecimientoClues, cluesEs9998, tipoGuia, nombreArchivoOficial, hashSha256Archivo, resumenValidacion, batchId, versionInterna. Índices: fechaHora, batchId, periodo.
- **GiisExportAuditService:** `recordGenerationAudit(payload)` crea documento; cluesEs9998 = (clues === '9998'). Registrado en giis-export.module.
- **Integración en flujo:** Al completar generación (después de generateBatchLes) se llama `recordBatchCompletionAudit`: un registro por guía con resumen "N procesados, M excluidos", nombreArchivoOficial = nombre TXT. Al completar buildDeliverable se registra un documento por artifact con ZIP (nombreArchivoOficial, hashSha256Archivo). Usuario desde controller (createdByUserId en options del batch para batch completion; usuarioGeneradorId pasado a buildDeliverable).
- **Reintentos:** Sin cambio; cada "crear batch" es un nuevo documento; mismo nombre oficial al descargar.
- **Retención:** `docs/nom-024/giis_retention_policy.md` con NOM-004, recomendación de depuración tras X meses, referencia a config. `config/giis-export.config.ts`: `retentionMonthsForGeneratedFiles` desde env `RETENTION_MONTHS_GIIS_FILES`; sin job de limpieza en este plan.
