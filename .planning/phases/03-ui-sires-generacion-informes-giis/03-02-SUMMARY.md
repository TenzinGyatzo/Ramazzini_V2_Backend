# Plan 03-02 — Summary

**Status:** Complete  
**Completed:** 2026-02-05

## Changes

- **giisExportAPI.ts:** listBatches(), createBatch(yearMonth), getBatch(batchId), downloadFile(batchId, guide, filename) with blob + link for direct download, downloadExcludedReportCsv(batchId). Uses @/lib/axios (Bearer token attached).
- **router:** Added path "/exportacion-giis", name "exportacion-giis", component ExportacionGiisView.vue under LayOut children.
- **LayOut.vue:** Added "Exportación GIIS" link in dropdown with v-if="(Principal || Administrador) && proveedorSaludStore.giisExportEnabled"; added 'exportacion-giis' to route names that show the menu.
- **ExportacionGiisView.vue:** Form (month input → YYYY-MM), Generar button disabled when generating or hasGeneratingBatch; spinner "Generando informes GIIS…"; list table with Mes reportado, Fecha generación, Estado, Descargas (CDT, CEX, LES) and excluded report link; 9998 notice per row; empty state message; access restricted to Principal/Administrador and giisExportEnabled (messages for no permission / not SIRES).

## must_haves

- [x] Menú LayOut: opción "Exportación GIIS", visible solo Principal/Administrador y giisExportEnabled; ruta en condición del menú.
- [x] Ruta /exportacion-giis con vista; acceso validado en vista por rol y SIRES.
- [x] Vista: formulario mes/año, Generar, spinner, listado con columnas y descargas por CDT/CEX/LES, errores y reporte de excluidos, aviso 9998, estado vacío.
- [x] API cliente con listBatches, createBatch, getBatch, downloadFile (blob), downloadExcludedReportCsv.
- [x] Un job a la vez: botón deshabilitado durante petición y si hay batch en generating.

## Verification

- Principal/Administrador con tenant SIRES ve el menú y puede generar y descargar.
- Sin rol o sin SIRES: mensaje en vista o menú oculto.
- Listado ordenado por backend (yearMonth desc); descarga directa sin nueva pestaña.
