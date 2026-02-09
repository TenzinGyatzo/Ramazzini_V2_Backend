# Phase 3: UI SIRES — Generación de informes GIIS - Context

**Gathered:** 2026-02-05  
**Status:** Ready for planning

---

## Phase Boundary

Ofrecer la **interfaz de usuario** para que un proveedor SIRES pueda **generar y obtener informes GIIS**: elegir período, disparar la generación, ver estado y descargar archivos (CDT, CEX, LES), apoyado en el backend de Phase 1 y 2. Solo se define cómo implementar esta UI dentro de este alcance; capacidades nuevas (ej. programación, notificaciones) son otra fase.

---

## Implementation Decisions

### Ubicación y acceso

- La opción vive en el **menú desplegable** de `LayOut.vue` (nivel principal).
- **Nombre de la opción:** "Exportación GIIS".
- **Visibilidad y acceso:** Solo roles **Principal** y **Administrador** ven la opción y pueden acceder.
- **Si el proveedor no es SIRES:** No mostrar la opción en absoluto (ni en menú ni en rutas).

### Flujo de generación

- **Selección:** Solo mes y año; el establecimiento del proveedor se usa por defecto (sin selector de establecimiento en UI).
- **Concurrencia:** Un job a la vez por proveedor; si hay uno en curso, no se puede lanzar otro hasta que termine.
- **Durante la generación:** Spinner/loading en la misma pantalla con mensaje "Generando informes GIIS…".
- **Al terminar correctamente:** Redirigir o mostrar el listado/historial con el nuevo reporte y opción de descarga (no quedarse solo en enlaces en la misma pantalla).

### Listado e historial

- **Alcance:** Todos los batches del proveedor (todos los meses generados); el más reciente primero en experiencia (orden por defecto: por mes reportado descendente).
- **Columnas por fila:** Mes reportado, fecha de generación, estado (Listo / Error / En proceso), botón/enlace descarga.
- **Estado vacío:** Mensaje "Aún no hay reportes GIIS. Use el botón de arriba para generar el primero" y formulario de generación visible en la misma pantalla.

### Descarga y feedback previo

- **Formato de descarga:** Enlaces separados por archivo: descargar CDT, CEX y LES por separado (no un solo ZIP).
- **Pre-validación:** Si hubo advertencias o excluidos, mostrarlos en pantalla (resumen o enlace a detalle) junto a los botones de descarga.
- **Modo 9998/SMP:** Aviso junto a cada generación o en el listado cuando el batch usó 9998 (ej. "Reporte en modo privado (CLUES 9998)").
- **Comportamiento al descargar:** Descarga directa en el navegador (sin abrir nueva pestaña).

### Estados y errores

- **Cuando falla:** Mensaje de error claro en la misma pantalla y estado del batch en el listado como "Error".
- **Detalle del error:** Sí. En el listado o al hacer clic en la fila con error, mostrar resumen (ej. "3 errores de validación") y/o enlace a detalle (reporte de excluidos o mensajes).
- **Errores bloqueantes:** Estado "Error" en el listado; al abrir detalle, mostrar que hubo errores bloqueantes y enlace/descarga del reporte de excluidos si existe.
- **Job en curso:** Botón "Generar" deshabilitado y mensaje "Hay una generación en curso. Espere a que termine."

### Claude's Discretion

- Diseño exacto del spinner y textos secundarios.
- Estilo visual del listado (tabla vs cards), espaciado y tipografía.
- Cómo se expone el "detalle" de errores (modal, panel lateral, nueva vista).
- Paginación o scroll del historial si el backend lo permite (decisión técnica según cantidad de registros).

---

## Specific Ideas

- Referencia de implementación: menú en `frontend/src/views/LayOut.vue`.
- Roles exactos: "Principal" y "Administrador" (nombres a alinear con el sistema de roles del frontend).

---

## Deferred Ideas

- None — discussion stayed within phase scope.

---

*Phase: 03-ui-sires-generacion-informes-giis*  
*Context gathered: 2026-02-05*
