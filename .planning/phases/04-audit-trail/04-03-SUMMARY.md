# Plan 04-03 — Summary

**Status:** Completed (instrumentación principal)  
**Date:** 2026-02-06

## Delivered

- **AuditService.record():** Obtiene último evento del proveedor para hashEventoAnterior, construye payload canónico, computeCanonicalHash, insert en AuditEvent. Clase 1: relanza excepción. Clase 2: escribe en AuditOutbox y log.warn.
- **Auth (login):** UsersController: LOGIN_SUCCESS tras res.json({ token }); LOGIN_FAIL en cada UnauthorizedException (usuario no existe, no verificado, suspendido, contraseña incorrecta). Todos CLASS_2_SOFT_FAIL con .catch para no bloquear respuesta.
- **Expedientes:** finalizarDocumento recibe proveedorSaludId opcional; antes de guardar llama auditService.record(DOC_FINALIZE, CLASS_1_HARD_FAIL). ExpedientesModule importa AuditModule.
- **GIIS:** createBatchForExport: tras crear batch, record(GIIS_EXPORT_STARTED). recordBatchCompletionAudit: proveedorSaludId en recordGenerationAudit + record(GIIS_EXPORT_FILE_GENERATED) por artifact. buildDeliverable: proveedorSaludId en recordGenerationAudit. Controller downloadDeliverable y downloadArtifact: record(GIIS_EXPORT_DOWNLOADED) antes de enviar archivo. GiisExportAudit.payload incluye proveedorSaludId.
- **Actor SYSTEM:** documentado; usado cuando createdByUserId no está (GIIS).

## Pendiente (fuera de este ciclo)

- Hooks en Users (roles/permisos): ADMIN_ROLES_PERMISSIONS en users.service al actualizar permisos (requiere localizar endpoint).
- GIIS_VALIDATION_EXECUTED: llamar record tras validación batch (cuando se ejecute validate o similar).
- Crear corrección/nueva versión (document_versions + DOC_CREATE_CORRECTION) y DOC_ANULATE en expedientes (lógica de corrección y anulación con record).
- AUDIT_EXPORT_DOWNLOAD en plan 04-05 al implementar export.

## Verification

- Build pasa. Login, finalizar documento y export GIIS emiten eventos cuando se ejecutan (verificación manual o tests en 04-06).
