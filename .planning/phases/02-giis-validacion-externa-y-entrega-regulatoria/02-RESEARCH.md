# Phase 2: GIIS — Validación externa y entrega regulatoria — Research

**Mode:** ecosystem  
**Date:** 2026-02-04  
**Status:** RESEARCH COMPLETE

---

## Objetivo de la fase

Que los archivos GIIS generados por el SIRES pasen validadores externos y estén listos para carga regulatoria (SINBA). Subfases: **2A** validación profunda por campo, **2B** cifrado y empaquetado (3DES, .CIF, .ZIP), **2C** operación y auditoría. Entrega = descarga de ZIP para **carga manual** en portal (no API automática).

---

## Fuentes consultadas

- Guías oficiales: `backend/docs/nom-024/giis_official/` — GIIS-B013 (Lesiones), GIIS-B015 (Consulta Externa), GIIS-B019 (Detecciones); ejemplos: `LES-DFSSA-2201.txt`, `CEX-EJEMPLOS-2410.txt`, `DET-EJEMPLOS-2410.txt`.
- Fragmento GIIS-B019: **Nomenclatura de archivos** — estructura `[TIPO]-[ENTIDAD][INST]-[AA][MM].[EXT]`; posiciones 1–18 definidas; mismo nombre base para .TXT, .CIF y .ZIP.
- Catálogo DGIS: `backend/catalogs/normalized/establecimientos_salud.csv` (CLUES, CLAVE DE LA ENTIDAD, CLAVE DE LA INSTITUCION, ENTIDAD, etc.).
- Frontend: `CLUESAutocomplete.vue` + `PerfilProveedorView.vue`; API catálogos: `getCLUESByCode`, `searchCLUES`.
- Phase 1: `giis-export` (schemas en `giis_schemas/`, serializer, mappers CDT/CEX/LES, `GiisBatchService`, gate SIRES); sin 3DES/ZIP.

---

## Nomenclatura oficial de archivos (2B)

**Fuente:** Guía GIIS-B019, sección "Nomenclatura de archivos".

- **Formato:** `[TIPO]-[ENTIDAD][INST]-[AA][MM].[EXT]`
- **Mismo nombre base** en las tres etapas: generación (.TXT) → cifrado (.CIF) → compresión (.ZIP). Solo cambia la extensión.

Desglose por posiciones (en el nombre base + extensión):

| Posiciones | Segmento   | Ejemplo | Descripción |
|------------|------------|---------|-------------|
| 1–3        | TIPO       | CDT, CEX, LES | Tipo de información (Detecciones, Consulta Externa, Lesiones). |
| 4, 10      | Delimitador | `-`   | Guion entre segmentos. |
| 5–6        | ENTIDAD   | DF      | Entidad federativa (2 caracteres). Nomenclatura CLUES. |
| 7–9        | INST      | SSA     | Institución (3 caracteres). Nomenclatura CLUES. |
| 11–12      | AA        | 24      | Año (2 dígitos). |
| 13–14      | MM        | 10      | Mes (2 dígitos). |
| 15         | `.`       |         | Punto antes de la extensión. |
| 16–18      | EXT       | TXT / CIF / ZIP | Extensión según etapa. |

**Ejemplo completo:** `CDT-DFSSA-2410.TXT` → `CDT-DFSSA-2410.CIF` → `CDT-DFSSA-2410.ZIP`.

**Derivación de [ENTIDAD][INST]:**

- **CLUES en catálogo DGIS (11 caracteres):** los primeros 5 caracteres son `ENTIDAD(2) + INST(3)` (p. ej. `DFSSA`, `ASCIJ`). Usar `CLUES.substring(0, 5)` cuando el establecimiento tenga CLUES válida del catálogo.
- **Modo privado sin CLUES (9998):** usar `99SMP` (SERVICIOS MEDICOS PRIVADOS) como segmento fijo para el nombre de archivo.
- El catálogo `establecimientos_salud.csv` expone `CLAVE DE LA ENTIDAD` (2 dígitos) y `CLAVE DE LA INSTITUCION` (3 letras); la clave de entidad en el archivo es numérica; el **código de 2 letras** para el nombre de archivo coincide con el prefijo del CLUES (primeros 2 caracteres del CLUES de 11). Por tanto, **usar los primeros 5 caracteres del CLUES** cuando exista en catálogo; para 9998, usar `99SMP`.

---

## CLUES en establecimientos privados (Anexo 3 NOM-024)

**Fuente:** Anexo 3 – Consideraciones generales del paquete informativo DGIS para certificación NOM-024-SSA3-2012 (trámite SIRES).

### Uso permitido de 9998 para registro

Para **fines de registro de información**, si el establecimiento de salud es **privado y no cuenta con una CLUES**, podrá utilizar los siguientes datos:

| Campo | Valor |
|-------|--------|
| **CLUES** | 9998 |
| **CLAVE DE LA INSTITUCION** | SMP |
| **NOMBRE DE LA INSTITUCION** | SERVICIOS MEDICOS PRIVADOS |
| **CLAVE DE TIPOLOGIA** | 99 |
| **NOMBRE DE TIPOLOGIA** | NO ESPECIFICADO |
| **CLAVE DE SUBTIPOLOGIA** | 99 |
| **NOMBRE DE SUBTIPOLOGIA** | NO ESPECIFICADO |
| **CLAVE ESTATUS DE OPERACION** | 1 |
| **ESTATUS DE OPERACION** | EN OPERACION |

Esto permite al SIRES **capturar y almacenar** datos de establecimientos privados que aún no tienen CLUES asignada (registro interno, expedientes, generación de TXT con 9998 en el campo CLUES y nombre de archivo con `99SMP`).

### Requisito para reporte de información

**Nota del Anexo 3:** *"Es importante mencionar que, para el **reporte de información** forzosamente debe contar con una **CLUES válida**."*

Es decir:

- **Registro de información** (captura, almacenamiento, generación técnica de archivos): se permite 9998/SMP según la tabla anterior.
- **Reporte de información** (entrega regulatoria, carga en portal SINBA): la norma indica que **debe** contarse con una **CLUES válida**. En la práctica, la DGIS puede rechazar o no aceptar archivos identificados con 9998 en el reporte oficial.

### Implicaciones para Phase 2

1. **Generación y naming:** Seguir permitiendo CLUES 9998 para generar TXT y nombrar archivos con `99SMP` (como en Phase 1), de modo que establecimientos privados sin CLUES puedan usar el sistema y obtener archivos técnicamente correctos.
2. **Transparencia hacia el usuario:** En la pantalla o flujo de “entrega regulatoria” (descarga del ZIP para subir a SINBA), cuando `establecimientoClues === '9998'`, mostrar una **advertencia explícita**: que según el Anexo 3 el reporte de información requiere CLUES válida, que el archivo generado usa 9998/SMP y podría ser rechazado por la DGIS, y que debe gestionar la obtención de una CLUES válida si desea reportar oficialmente. No bloquear por defecto la descarga (el proveedor puede necesitar el archivo para trámites o correcciones), pero sí dejar claro el límite normativo.
3. **Auditoría (2C):** Registrar en el log si el batch se generó con CLUES 9998 vs CLUES válida del catálogo, para trazabilidad y para soporte/auditoría.
4. **No asumir aceptación con 9998:** No dar por hecho que SINBA/DGIS aceptará archivos con 9998; la nota del Anexo 3 deja claro que el reporte exige CLUES válida. La implementación debe soportar 9998 en el flujo técnico y advertir sobre el requisito de reporte.

---

## Standard Stack

- **Validación por campo (2A):** Reglas derivadas de los schemas existentes en `backend/docs/nom-024/giis_schemas/` (CDT, CEX, LES). Cada campo tiene **validationRaw** (texto en español con la regla normativa) y metadatos (requiredColumn, type.maxLength, type.kind). Esos textos deben **convertirse en lógica ejecutable**: implementar en código el equivalente a lo que describe cada validationRaw (obligatorio, longitud, catálogo, formato fecha, caracteres permitidos, validación CURP, rangos de edad, reglas cruzadas), no solo "leer" el texto para mostrar. Usar validationRaw como especificación; implementación por tipo de regla (catálogos vía CatalogsService, formato, rangos, etc.). **No añadir una librería de validación genérica nueva:** módulo de validación que consuma el schema y aplique las reglas implementadas. Reporte de errores: estructura `{ guía, renglón, campo, causa }`; salida en grid + CSV.
- **Cifrado 3DES (2B):** Usar **Node.js `crypto`** (módulo nativo). 3DES es soportado (ej. `createCipheriv` / `createDecipheriv` con algoritmo `des-ede3-cbc`). No implementar 3DES a mano. Si la DGIS publica especificación exacta de IV/padding/formato .CIF, seguirla al pie de la letra.
- **Empaquetado ZIP (2B):** Usar **`archiver`** o **`adm-zip`**. `archiver` es estándar para crear ZIPs desde streams; permite añadir el .CIF con el nombre oficial sin cambiar nombre base.
- **Hash para auditoría (2C):** Usar **`crypto.createHash('sha256')`** sobre el contenido del archivo (TXT o ZIP según lo que se entregue al usuario) y almacenar el hex en el log de auditoría.
- **Catálogos y CLUES:** Reutilizar **`CatalogsService`** (getCLUESEntry, searchCLUES) y el CSV normalizado. No duplicar carga de catálogos; el backend ya expone `/catalogs/clues/:code`. Para naming, si se tiene solo el código CLUES del proveedor, obtener entrada con getCLUESEntry y usar `code.substring(0, 5)`; si es 9998, usar `99SMP`.

---

## Architecture Patterns

- **Validación separada de la exportación:** Un **GiisValidationService** (o módulo equivalente) que:
  - Recibe periodo + guía(s) + CLUES (o batchId).
  - Opción "solo pre-validación": no escribe TXT; devuelve lista de errores/advertencias por renglón (guía, renglón, campo, causa).
  - Opción "validación en generación": el pipeline de export (existente) llama al validador por cada fila; las filas que fallen reglas "hard" se omiten (skip row); se acumula un "Reporte de Excluidos" (mismo formato guía/renglón/campo/causa).
- **Naming como servicio:** Una función o clase **`GiisOfficialNaming`** que, dado `{ tipoGuia, clues, year, month }`, devuelva el nombre base (sin extensión) y el nombre con extensión (.TXT, .CIF, .ZIP). Regla: CLUES de 11 chars → primeros 5 para [ENTIDAD][INST]; 9998 → `99SMP`. Tipo de guía → TIPO (CDT, CEX, LES).
- **Pipeline 2B:** Tras generar TXT validado (sin errores bloqueantes): 1) Guardar TXT con nombre oficial; 2) Cifrar contenido con 3DES → .CIF (mismo nombre base); 3) Crear ZIP con el .CIF (nombre oficial dentro del ZIP); 4) Opcionalmente adjuntar Reporte de Excluidos en el ZIP. No cambiar el nombre base entre TXT/CIF/ZIP.
- **Auditoría (2C):** Por cada generación (nuevo batch), persistir en tabla/colección de auditoría: usuario, fecha/hora, periodo, CLUES, tipo guía, nombre archivo generado, hash SHA-256 del archivo entregado, resumen de validación (ej. "N procesados, M excluidos"). No sobrescribir; cada generación es un evento distinto (versionado interno v1, v2; nombre externo siempre el oficial).

---

## Don't Hand-Roll

- **3DES:** Usar `crypto` (Node). No implementar cifrado simétrico propio.
- **ZIP:** Usar `archiver` o `adm-zip`. No construir ZIP manualmente.
- **SHA-256:** Usar `crypto.createHash('sha256')`. No implementar hash propio.
- **Búsqueda de CLUES / catálogo:** Usar `CatalogsService.getCLUESEntry` y el CSV normalizado. No cargar el CSV fuera del módulo de catálogos.
- **Validación contra catálogos (códigos CIE, entidad, etc.):** Reutilizar catálogos ya cargados o expuestos por el backend; no duplicar lógica de validación de códigos en el validador GIIS más allá de "valor en conjunto permitido".

---

## Common Pitfalls

- **Entidad/Institución en el nombre:** No usar "CLAVE DE LA ENTIDAD" numérica (01, 02) en el nombre de archivo. El nombre exige 2 letras + 3 letras (p. ej. DF, SSA). Derivar siempre desde los primeros 5 caracteres del CLUES o 99SMP para 9998.
- **Encoding del TXT:** Las guías exigen Windows-1252 (ANSI). Asegurar que el serializer/stream use ese encoding antes de cifrar y comprimir; si se cifra UTF-8 por error, el validador DGIS puede rechazar.
- **Nombre base único en todo el flujo:** El mismo nombre base (ej. `CDT-DFSSA-2410`) debe usarse para .TXT, .CIF y .ZIP. No añadir sufijos (v1, timestamp) al nombre oficial del archivo descargado.
- **Pre-validación vs generación:** En "solo reporte" no se debe escribir TXT ni incrementar contadores de "archivos generados". En generación con skip row, el Reporte de Excluidos debe incluir todos los renglones omitidos y la causa por cada uno.
- **Errores bloqueantes vs advertencias:** Bloqueantes = estructura, obligatorios, catálogo. Advertencias = reglas de negocio (p. ej. % CURP genérica). El paso a cifrado solo si no hay bloqueantes; con advertencias se puede permitir con confirmación explícita del usuario.
- **CLUES 9998 y reporte regulatorio:** El Anexo 3 NOM-024 permite 9998/SMP para **registro** de información (establecimientos privados sin CLUES), pero indica que para **reporte** de información se requiere CLUES válida. No asumir que la DGIS aceptará archivos con 9998 en la carga al portal; implementar advertencia en el flujo de entrega cuando el proveedor use 9998 y registrar en auditoría si el batch fue generado con 9998.

---

## Code Examples

**Naming (pseudocódigo):**

```ts
function getOfficialBaseName(tipo: 'CDT'|'CEX'|'LES', clues: string, year: number, month: number): string {
  const aa = String(year).slice(-2);
  const mm = String(month).padStart(2, '0');
  const entidadInst = (clues === '9998' || !clues) ? '99SMP' : clues.trim().toUpperCase().slice(0, 5);
  return `${tipo}-${entidadInst}-${aa}${mm}`;
}
// Archivos: base + '.TXT' | '.CIF' | '.ZIP'
```

**Uso de CLUES desde catálogo:** El proveedor ya tiene `clues` (desde PerfilProveedorView + CLUESAutocomplete). El batch tiene `establecimientoClues`. Para naming usar esa cadena; si es 9998 → 99SMP; si es CLUES de 11 caracteres → primeros 5.

**Validación existente (Phase 1):** Los mappers (cdt.mapper, cex.mapper, les.mapper) ya aplican defaults y formateo. El validador 2A debe aplicar las mismas reglas que el schema (required, longitud, catálogo) y devolver errores estructurados sin modificar el flujo de escritura del TXT hasta que se decida skip row.

**Ejemplos oficiales de nombre en proyecto:**  
- `backend/docs/nom-024/giis_official/examples/LES-DFSSA-2201.txt` → tipo LES, ENTIDAD+INST DFSSA, año 22, mes 01.  
- CEX y DET usan `CEX-EJEMPLOS-2410`, `DET-EJEMPLOS-2410` (EJEMPLOS es placeholder; en producción se usa el segmento derivado del CLUES).

---

## Resumen para planificación

| Subfase | Qué usar | Qué no hacer |
|--------|----------|--------------|
| 2A     | Schemas CDT/CEX/LES, CatalogsService, estructura de reporte guía/renglón/campo/causa | No validación genérica externa pesada; no cambiar mappers Phase 1 para "validar", solo añadir capa de validación que consuma schema + catálogos. |
| 2B     | Node `crypto` (3DES, SHA-256), `archiver` o `adm-zip`, nombre oficial desde CLUES (primeros 5 o 99SMP) | No 3DES/ZIP a mano; no nombre de archivo con timestamp o versión en el nombre oficial. |
| 2C     | Log de auditoría por evento, hash del archivo, resumen de validación, nuevo batch por generación | No sobrescribir eventos; no omitir hash ni usuario en el registro. |

---

## Confianza y límites

- **Alta:** Nomenclatura oficial (guía B019), estructura del nombre, mismo base para TXT/CIF/ZIP, uso de primeros 5 del CLUES o 99SMP, entrega manual (portal), skip row + reporte de excluidos (CONTEXT.md). Anexo 3: 9998/SMP permitido para registro; reporte de información exige CLUES válida (nota explícita).
- **Media:** Algoritmo exacto 3DES (modo, IV, padding) para .CIF — confirmar con especificación DGIS si está disponible; en su defecto usar 3DES estándar y validar con herramienta DGIS si existe. Aceptación real por DGIS de archivos con 9998 en reporte no está garantizada por el Anexo 3.
- **Baja:** Si existiera API pública de SINBA para validar archivos antes de subir, no está referida en las guías citadas; no asumir integración automática.

---

*Last updated: 2026-02-04*
