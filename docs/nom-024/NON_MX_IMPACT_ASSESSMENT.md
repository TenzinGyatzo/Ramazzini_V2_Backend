# Non-MX Provider Impact Assessment

**Document Version:** 1.0.0  
**Date:** December 2024  
**Related Task:** Task 2, Task 17

---

## Purpose

This document assesses the impact of NOM-024 compliance implementation on non-Mexican providers. The system implements **conditional enforcement** to maintain backward compatibility for international deployments.

---

## Enforcement Mechanism

### Detection Logic

```typescript
// Simplified logic in services
const isMXProvider = proveedorSalud.pais === 'MX';

if (isMXProvider) {
  // Strict validation - throw BadRequestException on violations
} else {
  // Permissive validation - log warnings, allow save
}
```

**Evidence:** `src/utils/nom024-compliance.util.ts`

---

## Impact by Feature

### Legend

| Icon | Meaning |
|------|---------|
| ✅ | No change for non-MX |
| ⚠️ | Warning logged, but operation succeeds |
| ❌ | Would fail (MX only) |

---

### Person Identification

| Feature | MX Provider | Non-MX Provider | Evidence |
|---------|-------------|-----------------|----------|
| CURP required | ❌ Error if missing | ✅ Optional | `trabajadores.service.ts` |
| CURP format validation | ❌ Error if invalid | ⚠️ Warning if provided but invalid | `curp-validator.util.ts` |
| Name uppercase normalization | ✅ Applied | ✅ Applied | `normalization.ts` |
| Name max length (50) | ❌ Error if exceeded | ⚠️ Warning | `name-validator.util.ts` |
| Name abbreviation rejection | ❌ Error if found | ⚠️ Warning | `name-validator.util.ts` |
| Entidad nacimiento required | ❌ Error if missing | ✅ Optional | `trabajadores.service.ts` |
| Nacionalidad required | ❌ Error if missing | ✅ Optional | `trabajadores.service.ts` |

---

### Professional Identification

| Feature | MX Provider | Non-MX Provider | Evidence |
|---------|-------------|-----------------|----------|
| MedicoFirmante CURP required | ❌ Error if missing | ✅ Optional | `medicos-firmantes.service.ts` |
| EnfermeraFirmante CURP required | ❌ Error if missing | ✅ Optional | `enfermeras-firmantes.service.ts` |
| TecnicoFirmante CURP required | ❌ Error if missing | ✅ Optional | `tecnicos-firmantes.service.ts` |
| Professional CURP format | ❌ Error if invalid | ⚠️ Warning if provided but invalid | `*-firmantes.service.ts` |

---

### Provider Identification

| Feature | MX Provider | Non-MX Provider | Evidence |
|---------|-------------|-----------------|----------|
| CLUES required | ❌ Error if missing | ✅ Optional | `proveedores-salud.service.ts` |
| CLUES format validation | ❌ Error if invalid | ⚠️ Warning if provided but invalid | `catalogs.service.ts` |

---

### Document Management

| Feature | MX Provider | Non-MX Provider | Evidence |
|---------|-------------|-----------------|----------|
| Document state tracking | ✅ Active | ✅ Active | `expedientes.service.ts` |
| Immutability enforcement | ❌ Error on update after finalization | ⚠️ Warning, update allowed | `expedientes.service.ts` |
| Finalization metadata | ✅ Recorded | ✅ Recorded | `expedientes.service.ts` |

---

### Vital Signs Validation

| Feature | MX Provider | Non-MX Provider | Evidence |
|---------|-------------|-----------------|----------|
| Range validation (BP, temp, etc.) | ❌ Error if out of range | ⚠️ Warning | `vital-signs-validator.util.ts` |
| BP consistency (sys > dia) | ❌ Error if violated | ⚠️ Warning | `vital-signs-validator.util.ts` |
| IMC consistency | ❌ Error if violated | ⚠️ Warning | `vital-signs-validator.util.ts` |

---

### Diagnosis Validation

| Feature | MX Provider | Non-MX Provider | Evidence |
|---------|-------------|-----------------|----------|
| CIE-10 code required | ❌ Error if missing | ✅ Optional (free text allowed) | `expedientes.service.ts` |
| CIE-10 format validation | ❌ Error if invalid | ⚠️ Warning if provided but invalid | `catalogs.service.ts` |

---

### GIIS Entities (Lesion, Deteccion)

| Feature | MX Provider | Non-MX Provider | Evidence |
|---------|-------------|-----------------|----------|
| Lesion entity available | ✅ Yes | ✅ Yes | `lesion.schema.ts` |
| Lesion MX-specific validation | ❌ Strict | ⚠️ Permissive | `expedientes.service.ts` |
| Deteccion entity available | ✅ Yes | ✅ Yes | `deteccion.schema.ts` |
| Deteccion age/sex block validation | ❌ Strict | ⚠️ Permissive | `expedientes.service.ts` |
| GIIS export | ✅ MX only | ❌ Skipped (no CLUES) | `giis-export.service.ts` |

---

### Catalog Validation

| Feature | MX Provider | Non-MX Provider | Evidence |
|---------|-------------|-----------------|----------|
| INEGI geographic codes | ❌ Error if invalid | ⚠️ Warning or skipped | `catalogs.service.ts` |
| RENAPO nationality codes | ❌ Error if invalid | ⚠️ Warning or skipped | `catalogs.service.ts` |
| GIIS catalog validation | ⚠️ Best-effort (catalogs optional) | ⚠️ Same behavior | `catalogs.service.ts` |

---

## Behavioral Summary

### For MX Providers (`pais === 'MX'`)

1. **Strict Validation:** All NOM-024 rules enforced
2. **Blocking Errors:** Validation failures prevent save
3. **Required Fields:** CURP, CLUES, entidadNacimiento, nacionalidad
4. **Immutability:** Finalized documents cannot be updated
5. **GIIS Export:** Full export capability

### For Non-MX Providers (`pais !== 'MX'`)

1. **Permissive Validation:** Rules applied but non-blocking
2. **Warnings Only:** Validation issues logged but save proceeds
3. **Optional Fields:** NOM-024 specific fields not required
4. **Flexible Documents:** Updates allowed even after finalization (with warning)
5. **No GIIS Export:** Skipped due to missing CLUES context

---

## Test Evidence

Tests covering MX vs Non-MX behavior:

| Test File | Coverage |
|-----------|----------|
| `test/nom024/curp-validation.nom024.spec.ts` | CURP optional for non-MX |
| `test/nom024/name-validation.nom024.spec.ts` | Name warnings for non-MX |
| `test/nom024/vital-signs.nom024.spec.ts` | Vital signs warnings for non-MX |
| `test/nom024/document-state.nom024.spec.ts` | Immutability permissive for non-MX |
| `test/nom024/lesion-giis-b013.nom024.spec.ts` | Lesion validation permissive |
| `test/nom024/deteccion-giis-b019.nom024.spec.ts` | Deteccion validation permissive |
| `src/modules/medicos-firmantes/medicos-firmantes.service.spec.ts` | Professional CURP optional |
| `src/modules/enfermeras-firmantes/enfermeras-firmantes.service.spec.ts` | Professional CURP optional |
| `src/modules/tecnicos-firmantes/tecnicos-firmantes.service.spec.ts` | Professional CURP optional |

---

## Migration Considerations

### Existing Non-MX Deployments

1. **No Breaking Changes:** Existing data remains valid
2. **No Required Migrations:** New fields are optional
3. **Warnings Logged:** Review logs for potential data quality improvements

### New Non-MX Deployments

1. **Full Feature Access:** All entities and endpoints available
2. **Recommended:** Populate NOM-024 fields where applicable for future compliance
3. **GIIS Entities:** Can be used for internal tracking even without MX requirements

---

## Logging Behavior

### Warning Format

```
[WARN] NOM-024 Validation: {rule} violated for non-MX provider {providerId}. 
Data saved but may require correction for MX compliance.
```

### Log Locations

- Service-level warnings: `*.service.ts`
- Validator warnings: `src/utils/*.util.ts`

---

## Recommendations for Non-MX Providers

1. **Optional Compliance:** Populate NOM-024 fields for data quality even if not required
2. **Review Warnings:** Periodically review NOM-024 warnings for data improvement opportunities
3. **Future-Proofing:** If expansion to MX is planned, begin populating required fields early
4. **CURP Alternative:** Use local identification systems in CURP field if applicable

---

## Related Documentation

| Document | Path |
|----------|------|
| Conditional Enforcement Utility | `src/utils/nom024-compliance.util.ts` |
| Phase 1 Final Report | `docs/nom-024/PHASE1_FINAL_REPORT.md` |
| Test Coverage Matrix | `docs/nom-024/TEST_COVERAGE_MATRIX.md` |

---

**Prepared by:** Development Team  
**Date:** December 2024

