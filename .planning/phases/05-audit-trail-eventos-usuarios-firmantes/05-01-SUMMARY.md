# Plan 05-01 — Summary

**Status:** Complete  
**Wave:** 1

## Done

- Added 8 new action types to `audit-action-type.ts`: USER_INVITATION_SENT, USER_ACTIVATED, USER_SUSPENDED, USER_REACTIVATED, USER_DELETED, USER_PASSWORD_CHANGED, SIGNER_PROFILE_CREATED, SIGNER_PROFILE_UPDATED.
- Mapped all 8 to CLASS_1_HARD_FAIL in `audit-event-class.ts` (ACTION_TYPE_TO_CLASS).

## Files modified

- `src/modules/audit/constants/audit-action-type.ts`
- `src/modules/audit/constants/audit-event-class.ts`

## Verification

- TypeScript compiles; AuditActionTypeValue includes new keys; ACTION_TYPE_TO_CLASS covers all new types.
