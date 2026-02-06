# Plan 02-02 — Summary

**Subfase 2B: Cifrado, empaquetado y naming oficial**

## Completado

- **Gate GIIS_ENCRYPTION_VALIDATED:** Variable de entorno; por defecto no "true". Si no es `true`, `POST batches/:batchId/build-deliverable` responde **409 Conflict** con mensaje que referencia `docs/nom-024/giis_encryption_spec.md`. Solo con `true` se ejecuta cifrado y ZIP.
- **GiisOfficialNaming:** `naming/giis-official-naming.ts` con `getEntidadInst`, `getOfficialBaseName(tipo, clues, year, month)`, `getOfficialFileName(baseName, ext)`. Regla: 9998 o vacío → 99SMP; si no, primeros 5 caracteres del CLUES. Formato `[TIPO]-[ENTIDAD][INST]-[AA][MM]`.
- **giis_encryption_spec.md:** Algoritmo des-ede3-cbc, IV 8 bytes, clave 24 bytes, padding PKCS7, sección "Validación pendiente DGIS".
- **GiisCryptoService:** `encryptToCif(plainBuffer, key, iv?)` (valida key 24 bytes), `decryptFromCif` (tests), `createZipWithCif(cifBuffer, officialBaseName)` (ZIP con una sola entrada .CIF), `sha256Hex(buffer)`. Clave solo desde config (env GIIS_3DES_KEY_BASE64).
- **buildDeliverable:** En GiisBatchService: comprueba validationStatus (has_blockers → Conflict; has_warnings sin confirmWarnings → Conflict). Clave desde GIIS_3DES_KEY_BASE64 (24 bytes base64). Por cada artifact TXT: lee con latin1, cifra, escribe .CIF, crea ZIP solo con .CIF, guarda zipPath y hashSha256 en artifact.
- **Controller:** `POST batches/:batchId/build-deliverable` (body confirmWarnings); `GET batches/:batchId/download-deliverable/:guide` (descarga ZIP con nombre oficial; header X-Delivery-Warning cuando CLUES 9998). Respuesta build-deliverable incluye deliveryWarning cuando clues === '9998'.
- **Artifacts:** zipPath y hashSha256 en GiisBatchArtifact.
- **Tests:** `test/nom024/giis-naming.nom024.spec.ts`, `test/nom024/giis-crypto.nom024.spec.ts` (roundtrip, IV 8 / key 24, ZIP, SHA-256; nota en spec: no prueban compatibilidad DGIS). Mocks GiisCryptoService en specs que usan GiisBatchService.

## Notas

- Dependencia añadida: `archiver` para creación de ZIP.
- Reporte de Excluidos no va dentro del ZIP; se expone por endpoint/CSV aparte (02-01).
