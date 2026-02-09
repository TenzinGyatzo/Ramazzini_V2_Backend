# Phase 1: Exportación GIIS — Context

**Gathered:** 2026-02-04  
**Status:** Ready for planning

---

## Phase Boundary

Implementar exportación GIIS para proveedores SIRES_NOM024: generar archivos por guía (CDT / CEX / LES) con formato correcto y validaciones internas; flujo disparable desde UI o API; tests en `backend/test/nom024/` extendidos. **No incluye** cifrado 3DES ni empaquetado ZIP en esta fase (ver Deferred). Alcance fijado por ROADMAP.md; la discusión define CÓMO implementar dentro de este límite.

---

## Regulatorio (dato clave)

### Guías GIIS aplicables

| Código | Nombre | Acrónimo archivo | Campos |
|-------|--------|-------------------|--------|
| GIIS-B019-04-09 | DETECCIONES | CDT | 92 |
| GIIS-B015-04-11 | CONSULTA EXTERNA | CEX | 106 |
| GIIS-B013-02-03 | LESIONES Y CAUSAS DE VIOLENCIA | LES | 82 |

- Los GIIS son **reportes mensuales**: un archivo por mes por guía, N renglones, un evento por renglón.
- **Estructura TXT:** codificación ANSI (Windows-1252); encabezado obligatorio con nombres de variables (primera línea); separadores: columnas `|`, listas `&`, subatributos `#`.
- **“Todos los campos obligatorios”:** no se omiten columnas; se llenan con valor real o default/vacío según reglas de validación del campo (matriz de reglas por campo).

### CLUES para establecimientos privados sin CLUES real

- Paquete DGIS Anexo 3: sustituta para privados sin CLUES.
- Valores: **CLUES=9998**, institucion=**SMP**, nombre=**SERVICIOS MEDICOS PRIVADOS**, tipologia=**99**, subtipologia=**99**, estatus=**1**.
- **Decisión producto:** soportar SIRES privado sin CLUES usando 9998/SMP; no prometer integración operativa SINBA si hay restricciones externas. Debe quedar reflejado en RegulatoryPolicy y en UI para que el proveedor entienda qué está usando (CLUES real vs modo privado 9998/SMP).

---

## Decisiones propuestas

### 1. Resolución de CLUES en exportación

- Si el proveedor tiene **CLUES real** (catálogo) → usarla en todos los registros del export.
- Si no tiene CLUES (privado) → usar **9998/SMP** (modo privado) en todos los registros.
- **RegulatoryPolicy:** extender (o documentar) un campo/flag que indique “uso CLUES real” vs “uso 9998/SMP” para que el backend y la UI sean consistentes.
- **UI:** el proveedor debe poder ver en su perfil/onboarding qué está usando (CLUES válida vs “Reporte modo privado (9998/SMP)”).

### 2. Cifrado 3DES / ZIP

- **Fuera de Phase 1.** Justificación: entregar primero el flujo end-to-end (generación TXT válido, batch mensual, descarga) y tests; cifrado y empaquetado son capa adicional que puede añadirse en una subfase posterior (ej. 1F) o Phase 2 sin cambiar la arquitectura del pipeline.
- **Decisión:** Phase 1 = archivos TXT planos (o a lo sumo encoding correcto ANSI); cifrado/ZIP queda explícitamente para más adelante.

### 3. Orden de implementación y slice mínimo

- **Orden recomendado:** CDT (B019, 92 campos) → CEX (B015, 106) → LES (B013, 82). Razón: CDT/Detecciones ya tiene transformer y tests en el codebase; permite tener un end-to-end rápido y luego replicar el patrón a CEX y LES.
- **Slice mínimo para “done” por guía:** encabezado correcto (nombres de variables) + al menos 1 fila de datos válida generada desde datos reales o fixtures + test automatizado que verifique estructura y separadores. No exige N eventos reales; exige que el pipeline produzca un archivo válido verificable.

### 4. Unidad de exportación

- **Batch mensual por proveedor + establecimiento (CLUES).** Un “job” de export = un mes + un proveedor + un establecimiento (CLUES o 9998). Un archivo por guía por ese batch (hasta 3 archivos: CDT, CEX, LES).

### 5. Defaults y vacíos

- Definir **matriz de reglas por campo** (por guía): valor por defecto si falta dato, o “vacío” permitido según especificación de la guía. Instrumentar con mappers por campo con fuente y default; no asumir sin documentar. Si una decisión depende del contenido exacto de la guía, implementar con mappers configurables y documentar fuente (nombre/código de variable de la guía).

### 6. Normalización de textos

- Definir reglas explícitas: mayúsculas/minúsculas, eliminación de acentos donde la guía lo exija, longitud máxima por campo. Aplicar en el serializer/formatter; no dejar criterios implícitos.

### 7. CURP genérica

- Si la guía o el validador externo imponen límites al uso de CURP genérica (XXXX999999XXXXXX99), documentar y reflejar en el validador de export (ej. rechazar filas con CURP genérica para cierto tipo de registro, o marcar y excluir). Decisión explícita antes de ejecutar: permitida en export sí/no y para qué guías/campos.

---

## Arquitectura y componentes

### Pipeline propuesto

```
eventos canónicos (desde BD: detecciones, lesiones, consulta externa)
    → mapper por guía (CDT / CEX / LES)
    → serializer (TXT: header + filas, separadores | & #, encoding Windows-1252)
    → validator (estructura, obligatorios, defaults)
    → artifacts (archivos por guía, guardados y/o devueltos)
```

- **Canonical event:** modelo interno ya existente o DTO normalizado por tipo de evento (detección, lesión, consulta externa). Reutilizar schemas/servicios actuales (`backend/src/modules/expedientes/`, `giis-export/transformers`).
- **Mapper por guía:** un transformer por guía (CDT, CEX, LES) que mapea evento → objeto plano de campos según la guía; usa formatters existentes (date, sexo, field) y nuevos según necesidad.
- **Serializer:** convierte objeto plano → línea TXT (encoding ANSI, separadores); primera línea = encabezado con nombres de variables.
- **Validator:** comprueba que cada línea (o el conjunto) cumple reglas de la guía (campos obligatorios, formatos); puede marcar filas inválidas o fallar el batch según política (decisión: fall fast vs recopilar errores).
- **Artifacts:** archivos guardados en disco y/o referenciados en la colección de batches (paths, checksum opcional); API devuelve descarga o URLs.

### Esquema / colección para batches y exports

- **Propuesta:** colección (o subdocumento) `GiisBatch` o `giisBatches` con al menos:
  - `proveedorSaludId` 
  - `establecimientoClues` (CLUES real o `"9998"`)
  - `yearMonth` (periodo, ej. `"2025-01"`)
  - `status`: `pending` | `generating` | `completed` | `failed`
  - `artifacts`: array de `{ guide: 'CDT'|'CEX'|'LES', path: string, rowCount?: number }`
  - `startedAt`, `completedAt`, `errorMessage?`
  - `options` (ej. onlyFinalized) por si se necesita auditoría de parámetros.
- Los archivos físicos pueden vivir en un directorio por proveedor y periodo (ej. `exports/giis/{proveedorId}/{yearMonth}/`) o en almacenamiento configurado; paths en BD relativos o absolutos según convención del proyecto.

### Riesgos y decisiones pendientes antes de ejecutar

1. **Catálogos oficiales:** versión, descarga y almacenamiento (¿se usan los CSV en `backend/catalogs/normalized/`? ¿actualización periódica?). Definir fuente de verdad por catálogo usado en GIIS (CLUES, CIE-10, etc.) y si hay que bloquear export cuando falte catálogo.
2. **Matriz defaults vs vacíos:** por cada guía, tabla campo → “obligatorio sí/no”, “default si ausente”, “formato vacío permitido”. Resolver antes de implementar serialización completa.
3. **Normalización de nombres y textos:** mayúsculas, sin acentos, trim, longitud máxima. Documentar por guía y centralizar en formatters.
4. **CURP genérica:** si aplica límite en validación (ej. no permitir en ciertos campos para export), definirlo y reflejarlo en validator/mapper.
5. **Idempotencia y reejecución:** ¿un batch ya “completed” se puede regenerar (overwrite) o se crea nueva versión? Decisión de producto para estado y nombres de archivo.

---

## API endpoints sugeridos

- **POST** `/api/giis-export/batches` (o `/api/proveedores-salud/:id/giis-batches`)  
  Body: `{ yearMonth: "2025-01", onlyFinalized?: boolean }`  
  Crea un job de batch mensual para el proveedor (y establecimiento resuelto por CLUES/9998). Devuelve `batchId` y status `pending`/`generating`. Solo permitido si `regulatoryPolicy.regime === 'SIRES_NOM024'`.

- **GET** `/api/giis-export/batches/:batchId`  
  Devuelve estado del batch y lista de artifacts (guía, path o URL de descarga, rowCount).

- **GET** `/api/giis-export/batches/:batchId/download/:guide`  
  Descarga del archivo TXT de la guía (CDT | CEX | LES). Headers: Content-Type text/plain; Content-Disposition attachment; filename con periodo y guía.

- (Opcional) **GET** `/api/giis-export/batches?proveedorSaludId=&yearMonth=`  
  Listado de batches para filtro (historial).

---

## Plan de subfases internas (1A–1E)

Cada subfase es verificable de forma independiente (MVP slice) y produce evidencia (tests/fixtures) antes de pasar a la siguiente.

| Subfase | Objetivo | Definición de “done” | Guía |
|---------|----------|----------------------|------|
| **1A** | Pipeline base + batch y esquema | Esquema `GiisBatch` creado; servicio que acepta periodo y proveedor y crea registro en estado `pending`/`generating`; sin archivos aún. Test: crear batch y leer estado. | — |
| **1B** | Export CDT (B019 Detecciones) end-to-end | Mapper CDT + serializer TXT (header + 1 fila); validator básico; artifact guardado y asociado al batch. Test: fixture 1 detección → 1 archivo TXT con estructura correcta (encoding, separadores). | CDT (B019) |
| **1C** | Export CEX (B015 Consulta externa) | Mismo patrón que 1B para CEX; 106 campos; tests con 1 fila válida. | CEX (B015) |
| **1D** | Export LES (B013 Lesiones) | Mismo patrón para LES; 82 campos; reutilizar/adaptar transformer existente de lesiones; tests con 1 fila válida. | LES (B013) |
| **1E** | UI/API y CLUES | Endpoints de creación de batch y descarga; resolución CLUES (real vs 9998/SMP) en pipeline y en RegulatoryPolicy/UI; proveedor puede disparar export y descargar. Tests E2E o integración: crear batch desde API y descargar al menos CDT. | Todas |

**Orden de guías:** CDT primero (ya hay base en codebase), luego CEX, luego LES.

**Qué queda explícitamente fuera de Phase 1**

- Cifrado 3DES y empaquetado ZIP: **fuera**; se puede abordar en una subfase posterior (ej. 1F) o Phase 2.
- Integración operativa con SINBA u otro sistema externo: no prometida; solo generación de archivos válidos según guías.

---

## Evidencia / tests para considerar la phase completada

- **Unit:** por guía, transformer + serializer producen línea(s) TXT correctas (header + 1 fila) a partir de fixtures; formatters (fecha, sexo, etc.) con tests existentes extendidos si hace falta.
- **Integration:** servicio de export recibe batch (proveedor + periodo + CLUES/9998), genera archivos, actualiza estado del batch y guarda paths; test con MongoDB (o in-memory) y fixtures de detección/lesión/consulta.
- **E2E o API:** al menos un flujo: crear batch vía API → esperar completed → descargar un archivo (ej. CDT) y verificar contenido mínimo (encabezado + separadores).
- **CLUES:** test que con CLUES real se use en export y con “sin CLUES” se use 9998/SMP en el archivo generado.
- **Regulatory:** export solo permitido cuando `regulatoryPolicy.regime === 'SIRES_NOM024'`; test que rechace o no exponga export para proveedor SIN_REGIMEN.

---

## Claude's Discretion

- Estructura exacta de carpetas en disco para artifacts.
- Estrategia de reintentos si falla la generación a mitad (reintentar todo el batch vs marcar failed y permitir retry manual).
- Formato de nombre de archivo (ej. `CDT_2025-01_9998.txt`).
- Si el validator debe fallar todo el batch ante una fila inválida o solo registrar y excluir la fila (según guía y política de producto).

---

## Deferred Ideas

- **Cifrado 3DES y ZIP:** Phase 1 no lo incluye; documentado para subfase posterior (1F) o Phase 2.
- **Integración SINBA / envío automático:** fuera de alcance; solo generación y descarga de archivos.
- **Reportes multi-mes o históricos:** Phase 1 = un mes por batch; agregados o históricos en fases futuras si aplica.

---

*Phase: 01-exportacion-giis*  
*Context gathered: 2026-02-04*
