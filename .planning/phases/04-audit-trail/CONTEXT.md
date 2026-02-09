# Phase 4: AuditTrail — Contexto y decisiones

**Objetivo NOM-024 (no negociable):** registro cronológico, trazabilidad/autoría inequívoca, capacidad de reconstrucción fiel a estados anteriores, inalterabilidad post-resguardo, soporte a no repudio.

**Alcance acordado:** documentos clínicos resguardados + accesos (login/fail) + acciones admin/config + acciones de sistema/dispositivo autenticado. Export/validación GIIS deben generar eventos.

**Arquitectura:** documentos resguardados — prohibida edición destructiva; correcciones = nueva versión. Audit trail debe permitir ver before/after o reconstrucción por versiones.

**Entregables:** (a) modelo AuditEvent append-only, (b) versionado de documentos clínicos, (c) API NestJS escribir/consultar, (d) UI mínima consulta por expediente/actor/fecha, (e) export auditoría.

**Criterios de aceptación:** pruebas de reconstrucción de versión previa, no updates destructivos en resguardado, toda acción con actor único, eventos append-only y tamper-evident (definición en fase).

---

## Decisiones finales v1 (bloqueadas)

Referencia única para implementación. Detalle y justificación en las secciones numeradas más abajo.

| ID | Tema | Decisión v1 |
|----|------|-------------|
| **D1** | Lecturas vs escrituras | ✅ Solo escrituras + lecturas sensibles |
| **D2** | Reconstrucción fiel | ✅ Documento completo por versión |
| **D3** | Resguardado e inalterabilidad | ✅ Resguardado = FINALIZADO en proveedor NOM-024 |
| **D4** | No repudio (tamper-evident) | ✅ Append-only + hash por evento + hash anterior (cadena ligera) |
| **D5** | Multi-proveedor | ✅ proveedorSaludId obligatorio en AuditEvent y GiisExportAudit |
| **D6** | Retención / export | ✅ Sin borrado en v1 + export verificable con hashes |
| **D7** | Cobertura de eventos | ✅ Checklist cerrado v1 (extensible) |
| **D8** | Sincronía y fallo | ✅ Síncrono v1 + clases de criticidad (hard-fail / soft-fail) |

---

### D1 — Lecturas vs escrituras
- **Elegido:** Solo escrituras + lecturas sensibles.
- **Lecturas sensibles (sí auditar):** descarga/export de GIIS (ZIP/TXT); descarga/export del Audit Trail.

### D2 — Reconstrucción fiel
- **Elegido:** Documento completo por versión.
- Corrección = nueva versión (snapshot completo). Comparación before/after por versiones.

### D3 — “Resguardado” e inalterabilidad
- **Elegido:** Resguardado = estado FINALIZADO en proveedor NOM-024.
- Prohibido PATCH/PUT destructivo sobre FINALIZADO (NOM-024). Corrección/anulación siempre generan evento y, si aplica, nueva versión.

### D4 — No repudio (tamper-evident)
- **Elegido:** Append-only + hash por evento + hash anterior (cadena ligera).
- Sin firma digital del servidor en v1. Sellado periódico: diferido.

### D5 — Multi-proveedor
- **Elegido:** proveedorSaludId obligatorio en AuditEvent y en GiisExportAudit.
- **Índices mínimos:**  
  `(proveedorSaludId, timestamp)` · `(proveedorSaludId, actorId, timestamp)` · `(proveedorSaludId, resourceType, resourceId, timestamp)`.

### D6 — Retención / export verificable
- **Elegido:** Sin borrado en v1 + export verificable con hashes.
- Archivado automático: diferido. Export incluye `hashEvento` y `hashEventoAnterior`.

### D7 — Cobertura de eventos (checklist v1)
- **Elegido:** Checklist cerrado v1 (extensible).
- **Accesos:** login success / login fail.
- **Docs:** crear borrador, actualizar borrador, finalizar (resguardar), crear corrección/nueva versión, anular.
- **Admin/config (acotado):** cambios de roles/permisos y asignaciones + cambios de configuración SIRES relevantes.
- **Sistema:** jobs (p.ej. export GIIS) como actor SYSTEM.
- **GIIS:** export iniciado, generado por archivo, descargado, validación ejecutada.

### D8 — Sincronía y política ante fallo
- **Elegido:** Síncrono v1 + clases de criticidad.
- **Clase 1 (hard-fail):** finalizar, corrección/nueva versión, anular, export GIIS, cambios roles/permisos → si falla auditoría: falla la operación.
- **Clase 2 (soft-fail):** eventos auxiliares (p.ej. login fail) → si falla auditoría: fallback a audit_outbox + alerta.

---

## Estado actual del código (referencia)

- **Expedientes:** documentos con `estado` (borrador / finalizado / anulado), `fechaFinalizacion`, `finalizadoPor`. Para proveedores MX (NOM-024) ya se bloquean actualizaciones sobre documentos finalizados; no hay versionado (decisión D2: block-updates).
- **GIIS:** existe `GiisExportAudit` (Phase 2C) por generación de CDT/CEX/LES (usuario, periodo, archivo, hash, batchId). No hay `proveedorSaludId` en el schema; el Audit Trail unificado deberá integrar o reutilizar este tipo de evento.

---

## Decisiones forzadas (zonas grises)

Cada bloque: **(A)** Decisión pendiente, **(B)** Opciones, **(C)** Recomendación por defecto SIRES/NOM-024, **(D)** Impacto.

---

### 1. Auditar lecturas (view) vs solo escrituras

**(A) Decisión pendiente:** ¿Se registran en el audit trail las consultas/lecturas (ej. “usuario X vio expediente Y a las Z”) o solo escrituras (crear, actualizar, finalizar, anular, export, login, etc.)?

**(B) Opciones:**

| Opción | Pros | Contras |
|--------|------|---------|
| **Solo escrituras** | Menor volumen, menor costo de almacenamiento y consulta; NOM-024 se centra en trazabilidad de cambios y autoría. | No se puede demostrar quién accedió a qué en qué momento (útil en fugas o disputas de acceso). |
| **Lecturas + escrituras** | Trazabilidad completa de acceso; útil para auditorías de privacidad y no repudio de acceso. | Volumen alto (cada vista de expediente/documento genera evento); índices y retención más costosos. |
| **Lecturas solo para datos sensibles** | Equilibrio: auditoría de acceso a expedientes/exportaciones, no a cada pantalla. | Definir qué es “sensible” y mantener reglas consistentes. |

**(C) Recomendación por defecto (SIRES/NOM-024):** **Solo escrituras por defecto.** **Excepción — registrar lecturas sensibles:** (1) descarga/export de GIIS (ZIP o archivos TXT/CDT/CEX/LES); (2) descarga/export del propio audit trail. El resto de lecturas (vistas de pantalla, listados) no se auditan en esta fase.

**(D) Impacto:** Datos: eventos de tipo “lectura sensible” además de escrituras; `actionType` incluye ej. `giis_export_download`, `audit_export_download`. API: mismo contrato de escritura; filtros por tipo de acción (escrituras + lecturas sensibles). UI: sin cambio en consultas. Migraciones: ninguna. Rendimiento: volumen bajo adicional por descargas sensibles.

---

### 2. Reconstrucción fiel: versionado por documento completo vs delta por campo

**(A) Decisión pendiente:** Para reconstruir un estado anterior de un documento clínico resguardado, ¿se guarda una copia completa del documento por versión o solo deltas (campos modificados)?

**(B) Opciones:**

| Opción | Pros | Contras |
|--------|------|---------|
| **Documento completo por versión** | Reconstrucción trivial (lectura de un documento); verificación simple (hash del blob); alineado a “estado en un punto en el tiempo”. | Más almacenamiento por documento (cada versión es un snapshot completo). |
| **Delta por campo** | Menor almacenamiento si hay muchas versiones con pocos cambios. | Reconstrucción requiere aplicar N deltas en orden; más complejidad y riesgo de error; definición de “campo” y serialización estable. |
| **Híbrido: snapshot periódico + deltas** | Balance almacenamiento vs simplicidad. | Complejidad de implementación y de pruebas de reconstrucción. |

**(C) Recomendación por defecto (SIRES/NOM-024):** **Documento completo por versión**. Garantiza “reconstrucción fiel” sin ambigüedad, pruebas de aceptación claras (recuperar versión N = leer un documento), y defensa en auditoría sencilla. El costo de almacenamiento para documentos clínicos por proveedor SIRES es asumible; si en el futuro crece, se puede evaluar compresión o archivado.

**(D) Impacto:** Datos: colección de versiones (ej. `document_versions` o embebido por tipo) con documento completo por versión; AuditEvent puede referenciar `documentVersionId` o equivalente. API: endpoint “obtener versión N de documento X”. UI: selector de versión y vista before/after. Migraciones: crear esquema de versiones y migrar lógica de “corrección = nueva versión”. Rendimiento: escritura de un snapshot por corrección; lecturas por versión son O(1).

---

### 3. Definición exacta de “resguardado” y qué pasa a inalterable

**(A) Decisión pendiente:** Qué se considera “resguardado” y a partir de qué momento el contenido es inalterable (solo nueva versión permitida).

**(B) Opciones:**

| Opción | Pros | Contras |
|--------|------|---------|
| **Resguardado = documento finalizado (estado FINALIZADO)** | Coherente con el modelo actual (finalizadoPor, fechaFinalizacion); un solo criterio. | Hay que dejar explícito que “finalizado” implica inalterabilidad para NOM-024 (MX). |
| **Resguardado = finalizado + tiempo mínimo o evento externo** | Permite “confirmación” posterior (ej. después de 24 h). | Complejidad y posible conflicto con “inalterabilidad” desde finalización. |
| **Resguardado = finalizado en proveedor con NOM-024** | Solo aplica inalterabilidad donde rige la norma. | Ya existe lógica por proveedor (requiresNOM024Compliance); alinear resguardo a ese mismo ámbito. |

**(C) Recomendación por defecto (SIRES/NOM-024):** **Resguardado = documento en estado FINALIZADO en un contexto donde aplica NOM-024** (proveedor MX). A partir de ese momento: (1) no se permiten updates destructivos (PATCH que borre o sobrescriba esa versión); (2) las correcciones crean una **nueva versión** (nuevo documento o nuevo registro de versión con mismo identificador lógico); (3) el contenido de la versión ya resguardada no se modifica nunca. Dejar documentado en CONTEXT y en reglas de negocio: “documento finalizado en proveedor NOM-024 = resguardado = solo versionado, nunca edición in-place”.

**(D) Impacto:** Datos: flag o derivación “resguardado” = estado finalizado + contexto NOM-024; no cambia esquema de documentos actuales, sí reglas de servicio. API: rechazar PATCH/PUT sobre documento resguardado con 403 o 409; ofrecer “crear corrección (nueva versión)”. UI: en documentos finalizados (MX), ocultar edición directa y mostrar “Agregar corrección/versión”. Migraciones: ninguna de datos; cambios de lógica en expedientes.service. Rendimiento: sin impacto significativo.

---

### 4. Nivel de no repudio: hash chain, firma servidor, sellado periódico

**(A) Decisión pendiente:** Qué mecanismo(s) se usan para que el audit trail sea “tamper-evident” y defendible ante NOM-024 (no repudio).

**(B) Opciones:**

| Opción | Pros | Contras |
|--------|------|---------|
| **Solo append-only + timestamp servidor** | Simple; evita borrados/ediciones. | No demuestra que el orden no fue alterado ni que el contenido no fue modificado. |
| **Hash por evento (incl. hash anterior) — cadena** | Cualquier alteración invalida la cadena; demostrable. | Implementación y consultas más complejas; rotación/archivado de cadena. |
| **Firma del servidor por evento (ej. HMAC o firma digital)** | Autenticidad del emisor y integridad del evento. | Gestión de claves; no garantiza orden entre eventos. |
| **Sellado periódico (hash de bloque de eventos + timestamp)** | Equilibrio: detectar alteraciones de bloques sin firmar cada evento. | Definir período y política de sellado. |

**(C) Recomendación por defecto (SIRES/NOM-024):** **Append-only + hash por evento.** Definición operativa de “tamper-evident”: (1) colección append-only (sin UPDATE/DELETE); (2) **hash canónico:** `hashEvento` = SHA-256(JSON canónico del evento). **JSON canónico:** llaves en orden fijo (definido en spec), timestamps en ISO 8601 UTC, `null` explícito donde aplique, sin campos derivados (el hash se calcula sobre el payload que define el evento, no sobre _id ni hashEvento). (3) Opcional: `hashEventoAnterior` para cadena y detectar reordenación o borrado. “Tamper-evident” = append-only + integridad verificable por este hash canónico.

**(D) Impacto:** Datos: campos `hashEvento`, opcional `hashEventoAnterior`; función de serialización canónica documentada (orden de llaves, formato fechas). API: escritura siempre insert; endpoint de verificación que recalcula SHA-256 del canónico y compara. UI: no obligatoria en v1. Migraciones: ninguna si se diseña desde el inicio. Rendimiento: un SHA-256 por evento (coste bajo).

---

### 5. Multi-proveedor: proveedorSaludId, índices, segregación de consulta

**(A) Decisión pendiente:** Cómo se multi-proveedor el audit trail (proveedorSaludId, índices y segregación de consultas).

**(B) Opciones:**

| Opción | Pros | Contras |
|--------|------|---------|
| **proveedorSaludId obligatorio en cada evento; índices compuestos (proveedorSaludId, fecha, actor, recurso)** | Consultas siempre por proveedor; sin fugas entre proveedores. | Todo código que escribe eventos debe recibir/pasar proveedorSaludId. |
| **Solo índices por fecha/actor; filtrar proveedor en aplicación** | Menos cambios en esquema. | Riesgo de olvidar filtro; menos eficiente. |
| **Partición o colección por proveedor** | Aislamiento fuerte. | Más complejidad operativa y de consultas globales (auditoría interna). |

**(C) Recomendación por defecto (SIRES/NOM-024):** **proveedorSaludId obligatorio en cada evento; índices compuestos (proveedorSaludId, fecha), (proveedorSaludId, actor), (proveedorSaludId, recurso/expediente)**. Todas las consultas de la API y de la UI deben estar siempre filtradas por proveedor (y por usuario/rol según política). Segregación explícita y defendible en auditoría.

**(D) Impacto:** Datos: campo `proveedorSaludId` (ObjectId o string); índices compuestos. API: todos los list/query de audit reciben proveedorSaludId (del token o contexto) y no exponen otros proveedores. UI: solo eventos del proveedor actual. Migraciones: si ya existieran eventos sin proveedorSaludId, migración de rellenado o exclusión de histórico. Rendimiento: consultas indexadas por proveedor.

---

### 6. Retención, archivado y export verificable

**(A) Decisión pendiente:** Política de retención del audit trail, archivado y formato de export (incl. verificabilidad).

**(B) Opciones:**

| Opción | Pros | Contras |
|--------|------|---------|
| **Sin borrado; export CSV/JSON por rango** | Simple; cumple “registro cronológico” y trazabilidad. | Crecimiento ilimitado; export no necesariamente verificable. |
| **Retención mínima por política (ej. N años); después archivado o solo export)** | Control de crecimiento; alineado a requisitos legales. | Definir N y proceso de archivado. |
| **Export con hashes (y opcionalmente firma) para verificación externa** | Auditor puede verificar integridad del export. | Formato y documentación del proceso de verificación. |

**(C) Recomendación por defecto (SIRES/NOM-024):** **Retención:** no borrado de eventos en línea durante el período que defina la política (ej. mínimo 5 años para NOM-024 si aplica; dejar documentado). **Archivado:** fase 4 no implementa archivado automático; se documenta como evolución. **Export:** ofrecer export (CSV/JSON) por rango de fechas y filtros (proveedorSalud, actor, expediente); incluir en el export las columnas necesarias para verificación (timestamp, actor, acción, recurso, `hashEvento`, `hashEventoAnterior` si existe) para que un proceso externo pueda recomprobar hashes. Definir en la fase el formato exacto del export verificable.

**(D) Impacto:** Datos: posible índice por fecha para purgas/archivado futuro. API: endpoint “export audit” con filtros y formato documentado. UI: botón/acción “Exportar auditoría” (rango, formato). Migraciones: ninguna en v1. Rendimiento: export por lotes para rangos grandes.

---

### 7. Cobertura de eventos: admin + SIRES (export/validación GIIS)

**(A) Decisión pendiente:** Qué eventos concretos se registran para acciones de administración/config y para flujos SIRES (export/validación GIIS).

**(B) Opciones:**

| Opción | Pros | Contras |
|--------|------|---------|
| **Lista mínima acotada (login/fail, finalizar doc, crear versión, export GIIS)** | Implementación rápida y clara. | Puede faltar algo que auditoría requiera después. |
| **Lista exhaustiva (todas las mutaciones + login + cambios config)** | Cobertura máxima. | Más puntos de instrumentación y mantenimiento. |
| **Lista definida en fase (checklist) y extensible por tipo de evento** | Equilibrio y trazabilidad de qué está cubierto. | Requiere documentar el checklist y mantenerlo. |

**(C) Recomendación por defecto (SIRES/NOM-024):** **AuditEvent es la fuente unificada.** **GiisExportAudit** se mantiene como detalle (datos específicos por archivo CDT/CEX/LES); se agrega **proveedorSaludId** a su schema. **Siempre emitir AuditEvent** por hitos GIIS: export iniciado, generado por archivo (por cada CDT/CEX/LES), descargado (por archivo o ZIP), validación ejecutada (éxito/fallo). Checklist: (1) **Accesos:** login exitoso, login fallido. (2) **Documentos:** finalizar, corrección/nueva versión, anular. (3) **Admin/config:** cambios roles/permisos y lista acotada. (4) **Sistema:** acciones automáticas con actor “sistema”. (5) **GIIS:** export iniciado, generado por archivo, descargado, validación ejecutada — todos como AuditEvent; GiisExportAudit sigue registrando detalle con proveedorSaludId.

**(D) Impacto:** Datos: enum `actionType` incluyendo hitos GIIS; GiisExportAudit con campo proveedorSaludId; doble escritura donde aplique (AuditEvent + GiisExportAudit para GIIS). API: un solo servicio/contrato para AuditEvent; flujos GIIS llaman a ambos. UI: filtros por tipo. Migraciones: añadir proveedorSaludId a GiisExportAudit y rellenar si hay datos históricos. Rendimiento: más puntos de emisión; Clase 1/2 según decisión 8.

---

### 8. Sincronía: logging síncrono vs asíncrono y garantías

**(A) Decisión pendiente:** Si la escritura del evento de auditoría es síncrona (en la misma transacción o request que la acción) o asíncrona (cola, worker), y qué garantías se dan.

**(B) Opciones:**

| Opción | Pros | Contras |
|--------|------|---------|
| **Síncrono (mismo request)** | Orden garantizado; si la acción se confirma, el evento existe. | Latencia adicional por request; si audit falla, ¿falla la acción? |
| **Asíncrono (cola + worker)** | No impacta latencia del usuario; puede reintentar. | Posible retraso o pérdida si la cola falla; orden más difícil de garantizar. |
| **Híbrido: críticos síncrono, resto asíncrono** | Balance. | Dos caminos y criterio “crítico” a mantener. |

**(C) Recomendación por defecto (SIRES/NOM-024):** **Audit síncrono en v1, con clasificación por criticidad.**  
- **Clase 1 (hard-fail):** finalizar documento, corrección/nueva versión, anular, export GIIS (disparo y descargas), cambios de roles/permisos. Si falla la escritura del evento de audit ⇒ **falla la operación** (mismo request).  
- **Clase 2 (soft-fail):** eventos auxiliares (ej. login fallido, otros no críticos). Si falla la escritura del evento ⇒ **fallback a audit_outbox** (buffer para reintento asíncrono) + **alerta** para que el evento no se pierda y se pueda recuperar.  

Garantía defendible: los eventos críticos (mutaciones resguardadas, export, permisos) nunca se confirman sin evento; los auxiliares tienen vía de recuperación vía outbox.

**(D) Impacto:** API: AuditService.record() con flag o clasificación (Clase 1 vs 2); en Clase 1, excepción de audit propaga y devuelve error al cliente; en Clase 2, en fallo se escribe en audit_outbox y se dispara alerta. Infra: componente audit_outbox (tabla/cola) y proceso de drenado/reintento. Rendimiento: Clase 1 añade latencia al request; Clase 2 no debe bloquear. Migraciones: ninguna para lógica; opcional migración para outbox si ya existieran eventos.

---

## Ideas diferidas (fuera de alcance Phase 4)

- Auditar lecturas genéricas (vistas de pantalla, listados) — decisión 1: solo escrituras + lecturas sensibles (GIIS export, audit export).
- Firma digital del servidor o sellado periódico — ver decisión 4 (evolución).
- Archivado automático por antigüedad — ver decisión 6.
- Versionado por delta — ver decisión 2.

---

## Resumen de recomendaciones (alineado a decisiones finales v1)

| # | Tema | Decisión v1 (bloqueada) |
|---|------|-------------------------|
| D1 | Lecturas vs escrituras | Solo escrituras + lecturas sensibles (descarga/export GIIS, descarga/export audit trail) |
| D2 | Reconstrucción | Documento completo por versión; before/after por versiones |
| D3 | Resguardado | FINALIZADO en proveedor NOM-024; prohibido PATCH/PUT destructivo; corrección/anulación → evento + nueva versión si aplica |
| D4 | No repudio | Append-only + hash por evento + hash anterior (cadena ligera); sin firma/sellado en v1 |
| D5 | Multi-proveedor | proveedorSaludId obligatorio; índices (proveedorSaludId, timestamp), (proveedorSaludId, actorId, timestamp), (proveedorSaludId, resourceType, resourceId, timestamp) |
| D6 | Retención/export | Sin borrado v1; export verificable con hashEvento y hashEventoAnterior; archivado diferido |
| D7 | Cobertura | Checklist v1: accesos, docs (borrador/finalizar/corrección/anular), admin/config, sistema (SYSTEM), GIIS (iniciado/por archivo/descargado/validación) |
| D8 | Sincronía | Síncrono v1; Clase 1 hard-fail (finalizar, corrección, anular, export GIIS, roles) → falla op.; Clase 2 soft-fail → audit_outbox + alerta |

---

*Decisiones finales v1 bloqueadas. Planes: 04-01 a 04-07. Deuda diferida (fuera de Phase 4): ver DEFERRED.md en esta carpeta.*
