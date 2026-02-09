# Plan 05-03 — Summary

**Status:** Complete  
**Wave:** 2

## Done

- **Helper:** `src/utils/signer-audit-payload.util.ts` — `toSignerPayloadSnapshot(doc)` returns plain object without firma/firmaConAntefirma binaries; adds `firma: 'presente'` / `firmaConAntefirma: 'presente'` when present.
- **MedicosFirmantes:** Module imports AuditModule, UsersModule. Controller: create → SIGNER_PROFILE_CREATED (resourceType medicoFirmante); update → SIGNER_PROFILE_UPDATED with payload.before and payload.after.
- **EnfermerasFirmantes:** Same pattern; resourceType enfermeraFirmante.
- **TecnicosFirmantes:** Same pattern; resourceType tecnicoFirmante.
- actorId from getUserIdFromRequest(req), proveedorSaludId from usersService.getIdProveedorSaludByUserId(actorId). All events CLASS_1_HARD_FAIL.

## Files modified

- `src/utils/signer-audit-payload.util.ts` (new)
- `src/modules/medicos-firmantes/medicos-firmantes.module.ts`, `medicos-firmantes.controller.ts`
- `src/modules/enfermeras-firmantes/enfermeras-firmantes.module.ts`, `enfermeras-firmantes.controller.ts`
- `src/modules/tecnicos-firmantes/tecnicos-firmantes.module.ts`, `tecnicos-firmantes.controller.ts`

## Verification

- Create/update in each firmante module records the corresponding audit event with snapshot (no binaries). Update payload has before/after.
