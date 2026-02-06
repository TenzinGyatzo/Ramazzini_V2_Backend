# Plan 01-03 — Summary

**Subfase 1C: Export CEX (B015 Consulta externa)**

## Completado

- **transformers/cex.mapper.ts:** loadGiisSchema('CEX'); mapNotaMedicaToCexRow(consulta, context { clues }, trabajador?) → Record con 106 keys desde schema CEX. extractCieCode() para "CODE - DESC" → CODE. Fuente: NotaMedica (consulta externa) + Trabajador (paciente); defaults para campos sin valor (-1, 0, XX, R69X, etc.). Sin listas de campos hardcodeadas; iteración sobre schema.fields.
- **GiisBatchService.generateBatchCex(batchId):** carga batch, NotaMedica del mes (fechaNotaMedica en rango), populate idTrabajador, mapper por cada uno → rows, serializa con schema CEX, valida filas, escribe exports/giis/{proveedorId}/{yearMonth}/CEX.txt, push a batch.artifacts { guide: 'CEX', path, rowCount }. Invocable con batch pending o completed (append artifact).
- **Módulo:** NotaMedica + NotaMedicaSchema registrados en GIISExportModule; GiisBatchService inyecta NotaMedicaModel.
- **Tests:** giis-export-cex.nom024.spec.ts — integración: crear batch, 1 NotaMedica + 1 Trabajador en el mes, generateBatchCex → artifact CEX, archivo con header + 1 fila de 106 columnas; unit: mapper 106 keys, clues y campos obligatorios, extractCieCode.
- **Fixtures:** test/fixtures/nota-medica.fixtures.ts (validNotaMedicaCex); tests de batch y CDT actualizados con NotaMedica en el módulo de test.

## Verificación

- npm run test:nom024 con giis-batch, giis-export-cdt y giis-export-cex pasan.
- Header y orden solo desde CEX.schema.json.
