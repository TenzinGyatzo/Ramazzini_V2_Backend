# Plan 01-02 — Summary

**Subfase 1B: Serializer schema-driven + export CDT (B019)**

## Completado

- **schema-loader.ts:** loadGiisSchema('CDT'|'CEX'|'LES') desde docs/nom-024/giis_schemas/{guide}.schema.json; retorna encoding, delimiter, fields (ordenados por id). Sin listas de campos hardcodeadas.
- **GiisSerializerService:** serialize(schema, rows) → primera línea = header (nombres del schema), filas con mismo orden; serializeToBuffer para escritura.
- **validators/giis-row.validator.ts:** validateRow(schema, row[]) — conteo de columnas y requiredColumn no vacíos.
- **transformers/cdt.mapper.ts:** mapDeteccionToCdtRow(deteccion, context { clues }, trabajador?) → Record con 92 keys desde schema CDT; clues desde contexto; defaults para required (XX, 142, 0, 19000101, etc.).
- **GiisBatchService.generateBatchCdt(batchId):** carga batch, detecciones del mes, mapper → rows, serializa, valida filas, escribe exports/giis/{proveedorId}/{yearMonth}/CDT.txt, actualiza batch (artifacts, status completed).
- **Tests:** giis-serializer.nom024.spec.ts (header solo, 1 fila con 92 columnas); giis-export-cdt.nom024.spec.ts (crear batch, 1 detección, generar CDT, verificar status completed, artifact CDT, archivo con header + 92 columnas).

## Verificación

- npm run test:nom024 con giis-serializer y giis-export-cdt pasan.
- Header y orden solo desde CDT.schema.json.
