# Phase 5 — Verification

**Phase:** 5 — Audit Trail: eventos de usuarios y perfiles firmantes  
**Date:** 2026-02-09  
**Status:** passed

## Goal (from ROADMAP)

Extender el sistema de Audit Trail existente con el registro de eventos que la app ya efectúa: gestión de usuarios (creación/invitación, activación, suspensión, reactivación, eliminación, cambio de contraseña) y perfiles de firmantes (medicoFirmante, enfermeraFirmante, tecnicoFirmante — creación y actualización).

## must_haves verified

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Nuevos actionType (USER_*, SIGNER_*) en audit-action-type.ts y CLASS_1 en audit-event-class.ts | ✓ |
| 2 | register → USER_INVITATION_SENT; verifyAccount → USER_ACTIVATED | ✓ |
| 3 | toggleAccountStatus → USER_SUSPENDED / USER_REACTIVATED | ✓ |
| 4 | removeUserByEmail → USER_DELETED (snapshot previo); updatePassword → USER_PASSWORD_CHANGED | ✓ |
| 5 | Medicos/Enfermeras/Tecnicos firmantes: create → SIGNER_PROFILE_CREATED; update → SIGNER_PROFILE_UPDATED con before/after | ✓ |
| 6 | Payload sin contraseñas ni binarios de firma; snapshot firmante con indicador "presente" para firma | ✓ |
| 7 | UI de auditoría muestra nuevos eventos; filtro opcional por tipo de evento (Phase 5 types) | ✓ |

## Plans executed

- 05-01: Tipos de evento y clases — Done
- 05-02: Instrumentación usuarios — Done
- 05-03: Instrumentación firmantes — Done
- 05-04: UI auditoría — Done

## Build

- Backend: `npm run build` — OK

## Notes

- removeUserByEmail: actor/proveedorSaludId from request (admin); delete is hard delete.
- Firmantes: actor from getUserIdFromRequest(req); proveedorSaludId from UsersService.getIdProveedorSaludByUserId(actorId).
