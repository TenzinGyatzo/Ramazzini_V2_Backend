---
status: complete
phase: 05-audit-trail-eventos-usuarios-firmantes
source: 05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md
started: "2026-02-09"
updated: "2026-02-09"
---

## Current Test

[testing complete]

## Tests

### 1. Vista de auditoría y filtro por tipo de evento
expected: Ver vista Auditoría con filtro "Tipo de evento" (desplegable con Todos + Gestión de usuarios + Perfiles de firmantes). Buscar sin tipo muestra todos; elegir tipo y buscar filtra.
result: pass

### 2. Evento al registrar usuario (invitación)
expected: Tras registrar un nuevo usuario (flujo de registro que envía email de verificación), en la lista de auditoría aparece un evento con acción USER_INVITATION_SENT (o texto equivalente), sin necesidad de refrescar.
result: issue
reported: "Si lo veo, pero está tomando como actor al usuario a quien se le envia la invitación, en realidad deberia tomar como actor al usuario quien ENVIA la invitación. El payload debe de quedar igual, mostrando email, username y role de quien recibe la invitación"
severity: major

### 3. Evento al activar cuenta
expected: Tras activar una cuenta con el enlace de verificación del email, en la lista de auditoría aparece un evento USER_ACTIVATED para ese usuario.
result: pass

### 4. Evento al suspender cuenta
expected: Desde la gestión de usuarios (ManagePermissions o RemoveUsers), al suspender una cuenta el trail muestra un evento de tipo USER_SUSPENDED (o "Cuenta suspendida") con el usuario afectado identificable (email o ID).
result: pass

### 5. Evento al reactivar cuenta
expected: Al reactivar una cuenta previamente suspendida, el trail muestra un evento USER_REACTIVATED (o "Cuenta reactivada").
result: pass

### 6. Evento al eliminar usuario
expected: Al eliminar un usuario desde la app, en el trail aparece un evento USER_DELETED con datos no sensibles del usuario eliminado (ej. email) en el payload o resumen.
result: pass

### 7. Evento al cambiar contraseña (forgot-password)
expected: Cuando un usuario completa el flujo "Olvidé mi contraseña" (email + link + nueva contraseña), en el trail aparece un evento USER_PASSWORD_CHANGED. No debe aparecer contraseña ni hash en el evento.
result: pass

### 8. Evento al crear perfil de firmante
expected: Tras crear un perfil de médico, enfermera o técnico firmante (desde la vista correspondiente), en el trail aparece un evento SIGNER_PROFILE_CREATED con resourceType medicoFirmante, enfermeraFirmante o tecnicoFirmante según corresponda.
result: pass

### 9. Evento al actualizar perfil de firmante
expected: Tras actualizar un perfil de firmante existente, en el trail aparece un evento SIGNER_PROFILE_UPDATED; el payload o detalle debe reflejar que hubo un cambio (antes/después o equivalente).
result: pass

### 10. Filtro por tipo reduce la lista
expected: En la vista de Auditoría, al seleccionar un tipo concreto (ej. "Cuenta suspendida" o "Perfil firmante creado") y pulsar Buscar, la lista muestra solo eventos de ese tipo (o vacía si no hay ninguno en el rango de fechas).
result: pass
reported: "funciona perfecto con los tipos de evento nuevos, pero no hay opción para seleccionar tipos de evento de la phase 4, agregarlos estaría genial"

## Summary

total: 10
passed: 9
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "USER_INVITATION_SENT tiene como actor al usuario que ENVÍA la invitación (ej. admin), no al invitado; payload sigue con email/username/role del destinatario"
  status: failed
  reason: "User reported: está tomando como actor al usuario a quien se le envia la invitación, en realidad deberia tomar como actor al usuario quien ENVIA la invitación. El payload debe de quedar igual"
  severity: major
  test: 2
  root_cause: "register() usaba actorId = user._id siempre. Fix: @Req() req en register(); si hay Bearer token usar getUserIdFromRequest(req) como actorId, si no (autoregistro) mantener user._id."
  artifacts:
    - path: backend/src/modules/users/users.controller.ts
      issue: "actorId en USER_INVITATION_SENT"
  missing: []
  debug_session: ""

- truth: "Filtro Tipo de evento incluye también los tipos de la Phase 4 (documentos, login, GIIS, etc.)"
  status: failed
  reason: "User reported: funciona perfecto con los tipos nuevos, pero no hay opción para seleccionar tipos de evento de la phase 4, agregarlos estaría genial"
  severity: minor
  test: 10
  root_cause: "Filtro solo tenía opciones Phase 5. Fix: añadidos optgroups Documentos, Accesos, Admin/asignaciones, GIIS/sistema con todos los actionType de Phase 4."
  artifacts:
    - path: frontend/src/views/AuditoriaView.vue
      issue: "opciones filtro tipo evento"
  missing: []
  debug_session: ""

