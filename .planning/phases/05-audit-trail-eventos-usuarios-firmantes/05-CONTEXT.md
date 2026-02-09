# Phase 5: Audit Trail — eventos de usuarios y perfiles firmantes — Context

**Gathered:** 2026-02-09  
**Status:** Ready for planning

<domain>

## Phase Boundary

Extender el sistema de Audit Trail existente (Phase 4) con el registro de **nuevos tipos de evento** que la app ya realiza:

1. **Gestión de usuarios:** creación (invitación + activación), suspensión, reactivación, eliminación (hard delete), cambio de contraseña (solo por el propio usuario).
2. **Perfiles de firmantes de documentos clínicos:** tres entidades (medicoFirmante, enfermeraFirmante, tecnicoFirmante), relación 1:1 con usuario; creación y actualización.

No se añaden nuevas capacidades de negocio; solo se instrumenta el audit para estas acciones ya existentes.

</domain>

<decisions>

## Implementation Decisions

### 1. Eventos de usuarios — qué cuenta como cada acción

- **Creación:** Dos eventos distintos: (1) **invitación enviada** (usuario pendiente de activar), (2) **usuario activado/creado** (cuando la cuenta queda activa).
- **Suspensión / Reactivación:** Dos tipos de evento separados para que en el trail quede inequívoco: p. ej. `USER_SUSPENDED` y `USER_REACTIVATED`. La UI usa un solo botón que alterna según `cuentaActiva` (vistas ManagePermissionsView, RemoveUsersView; componente UserItem — botón "Suspender" / "Reactivar").
- **Eliminación:** Hard delete. Un solo evento "usuario eliminado" con identificador del usuario afectado.
- **Cambio de contraseña:** Solo cuando el usuario cambia su propia contraseña. Un evento por ese cambio. No se audita reset por admin ni intentos fallidos.

### 2. Perfiles de firmantes — alcance y entidad

- **Entidades:** Tres modelos distintos: `MedicoFirmante`, `EnfermeraFirmante`, `TecnicoFirmante` (schemas en `medicos-firmantes`, `enfermeras-firmantes`, `tecnicos-firmantes`). Relación 1:1 con User; el rol del usuario determina cuál puede tener (médico → medicoFirmante, enfermero/a → enfermeraFirmante, técnico → tecnicoFirmante).
- **Creación / actualización:** El usuario puede crear o actualizar su perfil desde el menú principal o es redirigido por `ModalDatosProfesionales.vue` si intenta crear/modificar un documento sin perfil de firmante.
- **Actualización — payload:** El evento debe incluir **antes y después** en el payload (formato concreto a criterio del implementador; ver sección Payload más abajo).
- **Alcance:** Solo firmantes de documentos clínicos (estas tres entidades). No otros tipos de documento en esta fase.

### 3. Payload y datos por evento

- **Eventos de usuario:** Incluir datos no sensibles en el payload (email, nombre, rol) para poder leer el trail sin consultar otras tablas. Identificador del usuario afectado siempre presente.
- **Exclusiones globales:** Nunca guardar en ningún payload: contraseñas, hashes de contraseña; tampoco binarios de firma (campos `firma`, `firmaConAntefirma`). Para firma: solo referencia o indicador tipo "presente" / "actualizado".
- **Perfil firmante — creación:** Snapshot del perfil sin binarios (nombre, cédula, CURP, tipoPersonalId, etc.); firma como "presente" u omitida.
- **Perfil firmante — actualización:** Payload debe dejar claro el **antes y el después**. Formato (objetos completos vs solo campos modificados): **a criterio del implementador**.

### 4. Visibilidad y filtros en la UI de auditoría

- **Lista de eventos:** Una sola lista/timeline con todos los tipos de evento (documentos, accesos, usuarios, firmantes, GIIS, etc.). Filtros opcionales por tipo para acotar.
- **Permisos:** Mismos roles que ya pueden ver el audit trail (Phase 4), p. ej. Principal/Administrador. No restricción adicional por tipo de evento (eventos de usuarios y de firmantes visibles para los mismos roles que el resto del trail).
- **Resumen por fila:** A criterio del implementador; mantener consistencia con el resto de eventos ya mostrados en la UI de auditoría.

### Claude's Discretion

- Formato exacto de before/after en evento de actualización de perfil firmante (objetos completos vs solo campos modificados).
- Diseño del resumen por fila para estos eventos en la UI de auditoría (texto, campos mostrados).
- Nombres exactos de `actionType` / códigos de evento (p. ej. USER_SUSPENDED / USER_REACTIVATED vs USER_STATUS_CHANGED con detalle en payload), manteniendo que quede claro si se suspendió o se reactivó.

</decisions>

<specifics>

## Specific Ideas

- **Usuarios:** Vistas `ManagePermissionsView.vue`, `RemoveUsersView.vue`; componente `UserItem.vue` (líneas 68–82: botón Suspender/Reactivar según `cuentaActiva`). Escritura en BD: `cuentaActiva: true | false`.
- **Firmantes:** Modal `ModalDatosProfesionales.vue` redirige a crear/actualizar perfil; menú principal permite ir a la vista de perfil de firmante. Schemas: `backend/src/modules/medicos-firmantes/schemas/medico-firmante.schema.ts`, `enfermeras-firmantes/.../enfermera-firmante.schema.ts`, `tecnicos-firmantes/.../tecnico-firmante.schema.ts`. Todos tienen `idUser`, datos profesionales, `curp`, `tipoPersonalId`, y opcionalmente `firma` / `firmaConAntefirma` (no incluir binarios en payload).

</specifics>

<deferred>

## Deferred Ideas

- Auditar reset de contraseña por admin o intentos fallidos de cambio de contraseña — fuera de alcance Phase 5.
- Firmantes para otros tipos de documento (no clínicos) — fase posterior si aplica.

</deferred>

---

*Phase: 05-audit-trail-eventos-usuarios-firmantes*  
*Context gathered: 2026-02-09*
