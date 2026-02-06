# Ramazzini — Milestone: Features exclusivas SIRES_NOM024

## What This Is

Ramazzini es una plataforma de expedientes médicos ocupacionales multi-tenant. Los proveedores de salud pueden operar en **SIN_REGIMEN** (sin obligación regulatoria NOM-024) o en **SIRES_NOM024** (cumplimiento NOM-024). Las features exclusivas de SIRES solo se muestran y aplican cuando `regulatoryPolicy.regime === 'SIRES_NOM024'`. Este milestone continúa la implementación de esas features, con prioridad en la **exportación de información según las 3 guías GIIS aplicables** y, en segundo término, el **Audit Trail**.

## Core Value

Que un tenant con régimen SIRES_NOM024 pueda **exportar la información de acuerdo a las 3 guías GIIS aplicables**, de forma correcta y usable por el ecosistema regulatorio. Sin esto, el cumplimiento NOM-024 no está operativo para reporte.

## Requirements

### Validated

<!-- Features SIRES ya implementadas y en uso. -->

- ✓ Timeout de sesión (`sessionTimeoutEnabled`) — solo SIRES
- ✓ Inmutabilidad de documentos — estados finalizado/anulado no editables; solo notas aclaratorias
- ✓ UI SIRES — interfaz y mensajes específicos de cumplimiento
- ✓ Notas aclaratorias habilitadas (aclarar/corregir sin modificar documento original)
- ✓ Campo CLUES visible y obligatorio en onboarding cuando se elige SIRES
- ✓ Consentimiento informado diario obligatorio para crear ciertos documentos (guard solo aplica a SIRES)
- ✓ Validaciones más estrictas en SIRES: CURP obligatorio (firmantes y trabajadores), CIE-10 principal requerido, campos geográficos requeridos para trabajadores
- ✓ Cambio de régimen: tenant puede pasar de SIN_REGIMEN a SIRES_NOM024; sin exigencia retroactiva (las exigencias aplican desde el momento del cambio en adelante)

### Active

<!-- Alcance de este milestone. -->

- [ ] **Exportación GIIS** — Un tenant SIRES puede exportar información según las **3 guías GIIS aplicables** (formato, campos y reglas definidas por las guías).
- [ ] **Audit Trail** — Registro de auditoría para acciones/documentos relevantes en contexto SIRES (alcance a refinar en planificación).

### Out of Scope

- Exigencia retroactiva al cambiar de régimen — los datos/documentos creados antes del cambio a SIRES no deben verse obligados a cumplir ex post las exigencias SIRES.
- Otras regulaciones distintas a NOM-024 / SIRES para este milestone.
- Cambio de SIRES → SIN_REGIMEN (no requerido en este alcance).

## Context

- **Stack:** Backend NestJS (MongoDB, Mongoose), frontend Vue 3 (Pinia, Vite). Ver `.planning/codebase/STACK.md` y `ARCHITECTURE.md`.
- **Regulación:** Política por proveedor (`regulatoryPolicy`) en backend (`regulatory-policy.service.ts`) y frontend (composables, stores); módulos `nom024-compliance`, `giis-export`, `consentimiento-diario` ya existen; tests NOM-024 en `backend/test/nom024/`.
- **GIIS:** Ya hay estructura y tests para Lesión (GIIS-B013) y Detección (GIIS-B019); faltan completar exportación según las 3 guías aplicables y flujo end-to-end para el tenant.
- **Deuda conocida:** Ver `.planning/codebase/CONCERNS.md` (userId hardcodeado en importación, texto consentimiento, etc.); no bloquean este milestone pero pueden abordarse en fases posteriores.

## Constraints

- **Compatibilidad:** Los tenants en SIN_REGIMEN deben seguir funcionando sin cambios; las features exclusivas SIRES no deben afectar su flujo.
- **No retroactividad:** Al pasar de SIN_REGIMEN a SIRES_NOM024, las exigencias aplican solo a datos y acciones a partir del cambio.
- **Tech stack:** Mantener NestJS + Vue 3 + MongoDB; las guías GIIS se implementan dentro del módulo `giis-export` y servicios asociados.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cambio de régimen SIN_REGIMEN → SIRES_NOM024 permitido, sin exigencia retroactiva | Cumplimiento regulatorio desde el cambio; no reabrir documentos históricos | — Pending |
| Prioridad del milestone: exportación según 3 guías GIIS | Hace operativo el cumplimiento NOM-024 para reporte oficial | — Pending |
| Audit Trail en alcance pero después de GIIS | Trazabilidad importante; GIIS es el entregable crítico primero | — Pending |

---
*Last updated: 2025-02-04 after project initialization (brownfield, SIRES milestone)*
