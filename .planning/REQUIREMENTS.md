# Requirements — Milestone SIRES_NOM024

**Project:** Ramazzini — features exclusivas SIRES_NOM024  
**Core value:** Exportación de información según las 3 guías GIIS aplicables para tenants SIRES.

---

## v1 Requirements (este milestone)

### Exportación GIIS

- [ ] **GIIS-01**: Un tenant con régimen SIRES_NOM024 puede exportar la información de expedientes/documentos según las **3 guías GIIS aplicables** (formato, campos y reglas definidas por cada guía; salida usable por el ecosistema regulatorio).

### Audit Trail

- [ ] **AUDIT-01**: Existe un registro de auditoría (audit trail) para acciones/documentos relevantes en contexto SIRES, de forma que se pueda rastrear quién hizo qué y cuándo en los flujos sujetos a NOM-024.

---

## v2 (diferido)

- Ninguno definido para este milestone; posibles mejoras post-GIIS (ej. más guías, reportes adicionales) quedan para otro hito.

---

## Out of Scope

- **Exigencia retroactiva** — Al cambiar un tenant de SIN_REGIMEN a SIRES_NOM024, no se exigen cumplimientos sobre datos/documentos creados antes del cambio.
- **Otras regulaciones** — Solo NOM-024 / SIRES en este alcance.
- **Cambio SIRES → SIN_REGIMEN** — No requerido en este milestone.

---

## Traceability (fases → requisitos)

| Phase | Goal | REQ-IDs |
|-------|------|---------|
| 1 | Exportación GIIS (3 guías aplicables) | GIIS-01 |
| 2 | Audit Trail | AUDIT-01 |

---

*Last updated: 2025-02-04 after project initialization*
