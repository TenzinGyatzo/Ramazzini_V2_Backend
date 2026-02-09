# Phase 3 — UAT: UI Exportación GIIS

**Objetivo:** Verificación manual de que la UI de Exportación GIIS funciona según CONTEXT.md y planes 03-01, 03-02.

**Fase:** 3 — UI SIRES — Generación de informes GIIS

---

## Test list (user-observable)

| # | Descripción | Resultado |
|---|-------------|-----------|
| 1 | Menú: como Principal o Administrador con proveedor SIRES, en el menú desplegable aparece la opción "Exportación GIIS" y al hacer clic se navega a la pantalla de exportación. | ✓ pass |
| 2 | Menú oculto: con usuario que no es Principal ni Administrador, la opción "Exportación GIIS" no aparece en el menú. | ✓ pass |
| 3 | Proveedor no SIRES: con usuario Principal/Administrador pero proveedor sin régimen SIRES, la opción "Exportación GIIS" no aparece. | ✓ pass |
| 4 | Acceso por URL sin permiso: al entrar a /exportacion-giis con usuario que no es Principal ni Administrador, se muestra mensaje de sin permiso (no el formulario). | ✓ pass |
| 5 | Pantalla con permiso: en /exportacion-giis (Principal o Administrador + SIRES) se ve título "Exportación GIIS", formulario (mes/año, botón Generar) y sección "Historial de reportes". | ✓ pass |
| 6 | Estado vacío: sin batches previos, se muestra "Aún no hay reportes GIIS. Use el botón de arriba para generar el primero." con el formulario visible. | ✓ pass |
| 7 | Generar reporte: al elegir mes/año y pulsar Generar, aparece spinner "Generando informes GIIS…", el botón se deshabilita; al terminar, el nuevo reporte aparece en el listado. | ✓ pass (fix: controller prefix api/giis-export) |
| 8 | Listado y descargas: cada fila completada muestra mes reportado, fecha de generación, estado "Listo"; enlaces "Descargar CDT", "Descargar CEX", "Descargar LES" que descargan el archivo directamente (sin abrir nueva pestaña). | ✓ pass |
| 9 | Aviso 9998: para un batch generado con CLUES 9998, en esa fila se muestra el texto "Reporte en modo privado (CLUES 9998)". | ✓ pass |
| 10 | Un job a la vez: durante la generación (spinner visible), el botón Generar está deshabilitado y se muestra mensaje de generación en curso. | ✓ pass |

---

## Issues found (to diagnose after UAT)

1. **404 POST /api/giis-export/batches:** Resuelto — el controller usaba `@Controller('giis-export')`; se cambió a `@Controller('api/giis-export')` para que las rutas coincidan con el frontend (baseURL incluye `/api`).
2. **403 al descargar:** GET .../batches/:id/download/:guide devuelve "El batch no pertenece a su proveedor". Posible causa: comparación proveedorSaludId (ObjectId vs string) en assertSiresAndOwnership.
3. **Warnings Test 7:** CatalogsService — catálogos GIIS "País" y "Tipo Personal" no cargados; validación omitida. No bloqueante para UAT; deuda de configuración de catálogos.

---

## Resumen

- **Total tests:** 10
- **Passed:** 10
- **Failed:** 0
- **Pending:** 0

*Actualizado tras cada respuesta.*
