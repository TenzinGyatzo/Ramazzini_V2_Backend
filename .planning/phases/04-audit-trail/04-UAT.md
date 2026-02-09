# UAT — Phase 4: AuditTrail

**Phase:** 4  
**Goal:** Registro cronológico NOM-024, trazabilidad, no repudio, inalterabilidad.

---

## Test list (user-observable)

| # | Test | Result |
|---|------|--------|
| 1 | Menú: con usuario Principal o Administrador, aparece la entrada "Auditoría" en el menú. | Pass |
| 2 | Navegación: al abrir la ruta /auditoria se carga la vista "Trail de auditoría" con filtros (Desde, Hasta, Actor, Recurso) y tabla de eventos. | Pass |
| 3 | Consulta: con fechas Desde/Hasta y pulsar "Buscar" se muestran eventos en la tabla (o mensaje "Sin resultados"). | Pass |
| 4 | Paginación: si hay más resultados que el límite, botones Anterior/Siguiente permiten cambiar de página. | Pass |
| 5 | Exportar: con Desde y Hasta elegidos, selector JSON o CSV y botón "Exportar auditoría" descarga un archivo (audit-export.json o .csv). | Pass |
| 6 | Verificar: con Desde y Hasta, botón "Verificar cadena" muestra "Cadena válida" o "Errores encontrados" con detalle. | Pass |
| 7 | Segregación: usuario solo ve eventos de su proveedor (no aparecen eventos de otro proveedor). | Pass |

---

## Session

- **Started:** 2026-02-06
- **Status:** Completed
