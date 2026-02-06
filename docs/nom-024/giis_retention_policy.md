# Política de retención — archivos GIIS generados

**Referencia:** NOM-004 (conservación de información fuente); archivos GIIS son vehículos de transmisión.

## Obligación sobre información fuente

La NOM-004 y normativa aplicable exigen conservar la **información fuente** (expedientes clínicos, registros que dieron origen a los datos) durante al menos **5 años**. Esa obligación aplica a la base de datos y registros fuente, no a los archivos .TXT/.CIF/.ZIP generados para entrega.

## Archivos generados (TXT, CIF, ZIP)

Los archivos generados en `exports/giis/` son **vehículos de transmisión** para carga en el portal regulatorio. No constituyen el expediente fuente. Por tanto:

- Es **recomendable** definir una retención (ej. X meses) tras la cual se puedan depurar (borrar) para ahorrar espacio.
- La **información fuente** debe mantenerse según NOM-004 con independencia de si se borran o no los archivos generados.

## Configuración en esta codebase

- **Variable o config:** `retentionMonthsForGeneratedFiles` (número de meses tras los cuales se considera que los archivos generados pueden depurarse, o `null`/no definido = no aplicar limpieza automática).
- Un **job o script** de limpieza (listar/eliminar archivos en `exports/giis/` más antiguos que X meses) puede implementarse en el futuro usando esta config; en esta fase solo se documenta la política y se deja la config lista para ese uso.
