# Phase 4 AuditTrail — Deuda diferida (fuera de alcance v1)

Todo lo siguiente queda **fuera del alcance de Phase 4**. No implementar en v1; evolución futura.

---

## Auditar lecturas genéricas

Vistas de pantalla, listados, consultas a expedientes que no sean "descarga/export".  
**CONTEXT D1:** En v1 solo se auditan escrituras + lecturas sensibles (descarga GIIS, descarga audit trail).

---

## Firma digital del servidor / sellado periódico

Firma por evento (HMAC/firma digital) o sellado periódico de bloques.  
**CONTEXT D4:** v1 usa append-only + hash por evento + cadena ligera; sin firma ni sellado.

---

## Archivado automático por antigüedad

Purgas, movimiento a frío o archivado por política de retención.  
**CONTEXT D6:** v1 sin borrado; archivado automático diferido.

---

## Versionado por delta

Guardar solo campos modificados entre versiones en lugar de snapshot completo.  
**CONTEXT D2:** v1 = documento completo por versión; delta diferido.

---

## Proceso de drenado de audit_outbox

Worker o job que reintente escribir en AuditEvent los eventos Clase 2 que fallaron y quedaron en outbox.  
**CONTEXT D8:** v1 solo escribe en outbox + alerta; proceso de drenado/reintento fuera de alcance.
