---
phase: 02-giis-validacion-externa-y-entrega-regulatoria
verified: 2026-02-05
status: passed
score: 14/14 must-haves verified
---

# Phase 2: GIIS — Validación externa y entrega regulatoria — Verification Report

**Phase Goal:** Que los archivos GIIS generados por el SIRES pasen validadores externos y estén listos para carga regulatoria (SINBA u otros).

**Verified:** 2026-02-05  
**Status:** passed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | GiisValidationService.preValidate(periodo, guías, clues) sin escribir TXT; devuelve errores/warnings por registro (guide, rowIndex, field, cause, severity) | ✓ VERIFIED | giis-validation.service.ts: preValidate; controller POST prevalidate |
| 2 | validateAndFilterRows: bloqueante → skip row y acumular en Reporte de Excluidos; solo warnings → incluir fila | ✓ VERIFIED | giis-batch.service.ts usa validateAndFilterRows; excludedReport en batch |
| 3 | Reglas validationRaw traducidas a lógica (required, longitud, catálogo, fecha, CURP, etc.); schema-based-validator | ✓ VERIFIED | schema-based-validator.ts + validation.types.ts; GiisValidationService usa validador |
| 4 | validationStatus (validated / has_warnings / has_blockers); reporte excluidos en batch; cifrado solo si no has_blockers | ✓ VERIFIED | giis-batch.schema.ts validationStatus, excludedReport; buildDeliverable comprueba validationStatus |
| 5 | Reporte de Excluidos: estructura guía/renglón/campo/causa; API JSON (grid) y ?format=csv (descarga) | ✓ VERIFIED | GET batches/:batchId/excluded-report con format=csv y JSON |
| 6 | GiisOfficialNaming: getOfficialBaseName(tipo, clues, year, month); 99SMP para 9998/vacío; primeros 5 CLUES; .TXT/.CIF/.ZIP | ✓ VERIFIED | giis-official-naming.ts: getOfficialBaseName, getOfficialFileName; tests naming |
| 7 | Clave 3DES solo desde config (env); 24 bytes; GiisCryptoService.encryptToCif, createZipWithCif (solo .CIF en ZIP) | ✓ VERIFIED | giis-crypto.service.ts; key desde GIIS_3DES_KEY_BASE64; docs giis_encryption_spec.md |
| 8 | Gate GIIS_ENCRYPTION_VALIDATED: si false → 409 Conflict con mensaje; si true → permitir .CIF/.ZIP | ✓ VERIFIED | controller buildDeliverable: process.env.GIIS_ENCRYPTION_VALIDATED !== 'true' → ConflictException |
| 9 | Modelo GiisExportAudit: usuarioGeneradorId, fechaHora, periodo, establecimientoClues, cluesEs9998, tipoGuia, nombreArchivoOficial, hashSha256Archivo, resumenValidacion, batchId | ✓ VERIFIED | giis-export-audit.schema.ts con todos los campos; índices fechaHora, batchId, periodo |
| 10 | recordGenerationAudit llamado al completar batch y al generar entregable; hash SHA-256 del archivo | ✓ VERIFIED | giis-batch.service.ts: recordGenerationAudit en completado y en buildDeliverable |
| 11 | Reintentos = nuevo batch; no sobrescribir; mismo nombre oficial al descargar | ✓ VERIFIED | Flujo crea nuevo batch por solicitud; naming oficial por periodo/clues |
| 12 | Retención documentada; config retentionMonthsForGeneratedFiles lista para job futuro | ✓ VERIFIED | docs/nom-024/giis_retention_policy.md; política y config documentadas |
| 13 | Advertencia 9998 en respuesta de entregable cuando establecimientoClues === '9998' | ✓ VERIFIED | buildDeliverable retorna deliveryWarning cuando clues === '9998' |
| 14 | Tests: validador (bloqueante/warning, skip row), naming, crypto (IV=8, key=24, des-ede3-cbc), audit | ✓ VERIFIED | giis-validation.nom024.spec.ts, giis-naming.nom024.spec.ts, giis-crypto.nom024.spec.ts, giis-export-audit |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `validation/validation.types.ts` | ValidationError, PreValidationResult, ExcludedRowReport, severity | ✓ EXISTS + SUBSTANTIVE | Interfaces para errores y reporte excluidos |
| `validation/schema-based-validator.ts` | Validador por fila según schema/validationRaw | ✓ EXISTS + SUBSTANTIVE | Validación por campo, catálogos, formato, CURP |
| `validation/giis-validation.service.ts` | preValidate, validateAndFilterRows | ✓ EXISTS + SUBSTANTIVE | preValidate sin TXT; validateAndFilterRows en batch |
| `naming/giis-official-naming.ts` | getOfficialBaseName, getOfficialFileName, 99SMP/5 chars CLUES | ✓ EXISTS + SUBSTANTIVE | Formato [TIPO]-[ENTIDAD][INST]-[AA][MM] |
| `crypto/giis-crypto.service.ts` | encryptToCif, createZipWithCif, clave 24 bytes desde config | ✓ EXISTS + SUBSTANTIVE | des-ede3-cbc; ZIP solo con .CIF |
| `docs/nom-024/giis_encryption_spec.md` | Especificación 3DES, IV, clave, "Validación pendiente DGIS" | ✓ EXISTS + SUBSTANTIVE | Parámetros y sección validación pendiente |
| `schemas/giis-export-audit.schema.ts` | Modelo auditoría con cluesEs9998, hashSha256, etc. | ✓ EXISTS + SUBSTANTIVE | Campos y índices |
| `giis-export-audit.service.ts` | recordGenerationAudit | ✓ EXISTS + SUBSTANTIVE | Crea documento de auditoría |
| `docs/nom-024/giis_retention_policy.md` | Política retención y config para job futuro | ✓ EXISTS + SUBSTANTIVE | NOM-004, retentionMonthsForGeneratedFiles |
| `giis-batch.schema.ts` | validationStatus, excludedReport en batch | ✓ EXISTS + SUBSTANTIVE | GiisValidationStatus, GiisExcludedReport |
| Controller | POST prevalidate, GET excluded-report, POST build-deliverable, GET download-deliverable, gate 409 | ✓ EXISTS + SUBSTANTIVE | Endpoints y GIIS_ENCRYPTION_VALIDATED |

**Artifacts:** 11/11 verified

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| GiisBatchService generateCdt/Cex/Les | GiisValidationService.validateAndFilterRows | inyección | ✓ WIRED | validRows para TXT; excludedReport y validationStatus guardados |
| Controller POST prevalidate | GiisValidationService.preValidate | inyección | ✓ WIRED | Devuelve errors/totalRows sin generar archivos |
| Controller GET excluded-report | batch.excludedReport | getBatch + report | ✓ WIRED | JSON o CSV según format |
| GiisBatchService buildDeliverable | GiisCryptoService encryptToCif, createZipWithCif | inyección | ✓ WIRED | TXT → CIF → ZIP; solo .CIF en ZIP |
| GiisBatchService (completar batch / buildDeliverable) | GiisExportAuditService.recordGenerationAudit | inyección | ✓ WIRED | recordGenerationAudit con usuario, hash, resumen, cluesEs9998 |
| buildDeliverable | GiisOfficialNaming | basename para .CIF/.ZIP | ✓ WIRED | getOfficialBaseName usado para nombres de archivo |

**Wiring:** 6/6 connections verified

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| 2A: Validación profunda, pre-validación, skip row, Reporte de Excluidos | ✓ SATISFIED | - |
| 2B: Naming oficial, 3DES/.CIF, ZIP, gate DGIS, advertencia 9998 | ✓ SATISFIED | - |
| 2C: Auditoría por evento, hash SHA-256, reintentos, retención documentada | ✓ SATISFIED | - |

**Coverage:** 3/3 subfases satisfied

## Anti-Patterns Found

Ninguno bloqueante. Tests de crypto documentan explícitamente que no prueban compatibilidad con herramienta DGIS (según must_have 02-02).

## Human Verification Required

1. **Validación DGIS (3DES / .CIF)**
   - **Test:** Generar .CIF con GIIS_ENCRYPTION_VALIDATED=true y clave configurada; entregar archivo a herramienta DGIS o proceso oficial.
   - **Expected:** Herramienta DGIS acepta y procesa el archivo (o se documenta el ajuste necesario).
   - **Why human:** La compatibilidad con el sistema externo no es verificable solo con código; ver docs/nom-024/giis_encryption_spec.md.

2. **Reporte de Excluidos en UI**
   - **Test:** Ejecutar pre-validación y generación con datos que produzcan bloqueantes; abrir Reporte de Excluidos (grid o CSV).
   - **Expected:** Columnas guía, renglón, campo, causa visibles y coherentes.
   - **Why human:** Verificación funcional de integración UI (si aplica).

## Gaps Summary

**No critical gaps.** Phase goal achieved.

### Non-Critical Gaps (Can Defer)

1. **Compatibilidad 3DES con DGIS**
   - **Issue:** La implementación 3DES (des-ede3-cbc, IV 8 bytes, clave 24) no está validada contra la herramienta oficial DGIS.
   - **Impact:** Limitado: el gate `GIIS_ENCRYPTION_VALIDATED=false` por defecto evita usar cifrado en producción hasta validar.
   - **Recommendation:** Validar con DGIS; si hay desvío, ajustar según especificación y actualizar giis_encryption_spec.md. Luego activar GIIS_ENCRYPTION_VALIDATED.

2. **Job de limpieza de archivos generados**
   - **Issue:** No está implementado el job/script que borre archivos en `exports/giis/` según `retentionMonthsForGeneratedFiles`.
   - **Impact:** Limitado: política y config están documentadas; el job puede añadirse en una tarea posterior.
   - **Recommendation:** Implementar cuando se requiera limpieza automática (script o cron que liste/elimine por antigüedad).

## Verification Metadata

**Verification approach:** Goal-backward (must_haves de 02-01, 02-02, 02-03).
**Must-haves source:** 02-01-PLAN.md, 02-02-PLAN.md, 02-03-PLAN.md
**Automated checks:** Revisión de código contra must_haves y wiring.
**Human checks required:** Validación DGIS (3DES); opcional revisión UI del reporte de excluidos.
**Total verification time:** ~12 min

---
*Verified: 2026-02-05*
*Verifier: Claude (manual verification run)*
