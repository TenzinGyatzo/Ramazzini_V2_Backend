# Plan 05-04 — Summary

**Status:** Complete  
**Wave:** 3

## Done

- **AuditoriaView.vue:** Added optional filter "Tipo de evento" with a select: "Todos" plus optgroups "Gestión de usuarios" (USER_INVITATION_SENT, USER_ACTIVATED, USER_SUSPENDED, USER_REACTIVATED, USER_DELETED, USER_PASSWORD_CHANGED) and "Perfiles de firmantes" (SIGNER_PROFILE_CREATED, SIGNER_PROFILE_UPDATED). Value is sent as `actionType` in API params.
- **auditAPI.ts:** Already supports `actionType` in QueryAuditParams and passes it to the backend; no change.
- List shows all events returned by the API; new event types appear with their actionType in the "Acción" column. No whitelist restricting display.

## Files modified

- `frontend/src/views/AuditoriaView.vue`

## Verification

- New user/firmante events appear in the audit list when no filter is applied. Selecting a type (e.g. "Cuenta suspendida") filters to that actionType.
