# Roadmap — Milestone SIRES_NOM024

**Project:** Ramazzini  
**Milestone:** Features exclusivas SIRES_NOM024 — prioridad exportación GIIS.

---

## Phase 1: Exportación GIIS (3 guías aplicables)

**Goal:** Que un tenant SIRES pueda exportar la información según las 3 guías GIIS aplicables (formato y reglas correctos, salida usable por el ecosistema regulatorio).

**Requirements:** GIIS-01

**Success criteria:**
1. Identificación y documentación de las 3 guías GIIS aplicables y sus formatos/campos.
2. Backend: generación de export(s) que cumplan cada guía (o un flujo unificado que cubra las 3).
3. Tenant SIRES puede disparar la exportación desde la UI (o API) y obtener archivos/formato válido.
4. Validación o pruebas que confirmen que la salida cumple las guías (tests existentes en `backend/test/nom024/` extendidos o cubiertos).

**Status:** Completed  
**Verification:** `phases/01-exportacion-giis/01-VERIFICATION.md` (passed, 2026-02-05)

---

## Phase 2: GIIS — Validación externa y entrega regulatoria

**Goal:** Que los archivos GIIS generados por el SIRES pasen validadores externos y estén listos para carga regulatoria (SINBA u otros).

**Depends on:** Phase 1

**Status:** Completed  
**Verification:** `phases/02-giis-validacion-externa-y-entrega-regulatoria/02-VERIFICATION.md` (passed, 2026-02-05)

**Plans:** 3 plans (02-01, 02-02, 02-03)

Plans:
- [x] 02-01 — 2A: Validación profunda (pre-validación, skip row, Reporte de Excluidos, bloqueantes vs warnings)
- [x] 02-02 — 2B: Naming oficial, 3DES/.CIF, ZIP, advertencia 9998
- [x] 02-03 — 2C: Auditoría por evento, versionado/reintentos, retención documentada

**Details:**

Subfases (separadas):

- **Phase 2A — Validación profunda por campo**
  - Implementar reglas exactas de validación del diccionario: defaults vs vacío, rangos, longitudes, catálogos.
  - Reporte de errores estructurado: guía, renglón, campo, causa.
  - Decisión explícita: fail fast vs skip row.
  - Aquí se cumple el cumplimiento fino; bien separada de export.

- **Phase 2B — Cifrado y empaquetado**
  - Implementar: 3DES, .CIF, .ZIP.
  - Soportar: módulo DGIS o wrapper compatible.
  - Naming oficial de archivos.

- **Phase 2C — Operación y auditoría**
  - Versionado de batches.
  - Reintentos.
  - Retención / limpieza.
  - Evidencia para auditoría (quién, cuándo, con qué reglas).

---

## Phase 3: UI SIRES — Generación de informes GIIS

**Goal:** UI para que el tenant SIRES genere y obtenga informes GIIS: elegir período, disparar generación, ver estado y descargar CDT/CEX/LES (apoyado en Phase 1 y 2).
**Depends on:** Phase 2
**Plans:** 2 plans (03-01, 03-02)

Plans:
- [x] 03-01 — Backend: listar batches GIIS del tenant (GET /giis-export/batches)
- [x] 03-02 — Frontend: menú, ruta y vista Exportación GIIS (LayOut, ExportacionGiisView)

**Status:** Completed  
**Verification:** `phases/03-ui-sires-generacion-informes-giis/03-VERIFICATION.md` (passed, 2026-02-05)  
**UAT:** `phases/03-ui-sires-generacion-informes-giis/03-UAT.md` — 10/10 tests passed.

**Details:**
- Entrada en menú desplegable LayOut.vue, solo roles Principal/Administrador y tenant SIRES. Nombre "Exportación GIIS". Descarga por archivo (CDT, CEX, LES), listado con mes, fecha, estado, errores y aviso 9998. Un job a la vez. Context: `phases/03-ui-sires-generacion-informes-giis/CONTEXT.md`.

---

## Summary

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Exportación GIIS | Export según 3 guías GIIS para tenant SIRES | GIIS-01 | Completed ✓ |
| 2 | GIIS validación externa y entrega regulatoria | Archivos GIIS pasan validadores y listos para SINBA/regulatorio | — | Completed ✓ |
| 3 | UI SIRES — Generación de informes GIIS | UI generar/descargar informes GIIS (menú, listado, descargas) | — | Completed ✓ |

**Total:** 3 phases | 2 requirements mapped ✓

---

---

*Last updated: 2026-02-05*
