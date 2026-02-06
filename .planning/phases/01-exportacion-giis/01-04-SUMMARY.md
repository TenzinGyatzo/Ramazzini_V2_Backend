# Plan 01-04 — Summary

**Subfase 1D: Export LES (B013 Lesiones)**

## Completado

- **transformers/les.mapper.ts:** loadGiisSchema('LES'); mapLesionToLesRow(lesion, context { clues }, trabajador?) → Record con 82 keys desde schema LES. Fuente: documento Lesion + Trabajador (opcional, populate idTrabajador). Fechas en dd/mm/aaaa (toDDMMAAAA), hora HH:MM; tipoAtencion y tipoViolencia como multivalor con "&". Defaults para campos no capturados (-1, 0, 88, 99, 'NO ESPECIFICADO', etc.). Sin listas de campos hardcodeadas; iteración sobre schema.fields.
- **GiisBatchService.generateBatchLes(batchId):** carga batch, Lesion del mes (fechaAtencion en rango), populate idTrabajador, mapper por cada uno → rows, serializa con schema LES, valida filas, escribe exports/giis/{proveedorId}/{yearMonth}/LES.txt, push a batch.artifacts { guide: 'LES', path, rowCount }. Invocable con batch pending o completed (append artifact).
- **Módulo:** Lesion ya estaba en GIISExportModule; GiisBatchService inyecta LesionModel.
- **Tests:** giis-export-les.nom024.spec.ts — integración: crear batch, 1 Lesion + 1 Trabajador en el mes, generateBatchLes → artifact LES, archivo con header + 1 fila de 82 columnas; unit: mapper 82 keys, clues y campos obligatorios.
- **Tests existentes:** giis-batch, giis-export-cdt, giis-export-cex actualizados con Lesion + LesionSchema en el módulo de test (GiisBatchService requiere LesionModel).

## Verificación

- npm run test:nom024 con giis-batch, giis-export-cdt, giis-export-cex y giis-export-les pasan.
- Header y orden solo desde LES.schema.json.
