# Plan 05-02 — Summary

**Status:** Complete  
**Wave:** 2

## Done

- **register():** After register + sendEmailVerification, record USER_INVITATION_SENT with payload (email, username, role). actorId = user._id, proveedorSaludId from user.
- **verifyAccount():** After activating account, record USER_ACTIVATED with same payload; actorId = user._id.
- **toggleAccountStatus():** After toggle, record USER_SUSPENDED or USER_REACTIVATED; actor from getUserIdFromRequest(req); payload = target user email, username, role.
- **removeUserByEmail():** Find user by email first; after delete, record USER_DELETED with snapshot (email, username, role) and actor from request.
- **updatePassword() (POST forgot-password/:token):** After save, record USER_PASSWORD_CHANGED; actorId = user._id; payload = { userId }.

## Files modified

- `src/modules/users/users.controller.ts`

## Verification

- All five flows call auditService.record with correct actionType and CLASS_1_HARD_FAIL. No password or hash in any payload.
