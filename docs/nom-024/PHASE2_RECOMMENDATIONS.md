# NOM-024 Phase 2 — Recommendations

**Document Version:** 1.0.0  
**Date:** December 2024  
**Status:** PLANNING

---

## Overview

This document outlines recommended next steps following the successful completion of Phase 1. Phase 2 focuses on **GIIS file generation and delivery infrastructure**.

---

## High-Level Objectives

| Objective | Description |
|-----------|-------------|
| File Generation | Convert pipe-delimited strings to physical `.txt` files |
| Encryption | Implement 3DES encryption per DGIS requirements |
| Packaging | ZIP compression with naming conventions |
| Scheduling | Automated export on configurable intervals |
| Delivery | SFTP/HTTPS upload to DGIS |

---

## Recommended Tasks

### P2-1: GIIS File Generation Service

**Effort:** MEDIUM

**Description:**  
Create a service that takes the pipe-delimited output from Task 16's transformation layer and writes it to physical `.txt` files following GIIS naming conventions.

**Expected File Format:**
```
B013_CLUES_YYYYMMDD_SEQ.txt
B019_CLUES_YYYYMMDD_SEQ.txt
```

**Dependencies:**
- Task 16 (GIIS Export Transformation Layer) ✅ Completed

**Evidence Location (post-implementation):**
- `src/modules/giis-export/file-generator.service.ts`

---

### P2-2: 3DES Encryption Implementation

**Effort:** MEDIUM

**Description:**  
Implement 3DES-CBC encryption as specified by DGIS for GIIS file security. The encryption key is provided by DGIS upon registration.

**Technical Notes:**
- Algorithm: 3DES-CBC
- Key management: Secure storage (environment variables or secrets manager)
- IV handling per DGIS specification

**Dependencies:**
- P2-1 (File Generation)

**Evidence Location (post-implementation):**
- `src/modules/giis-export/encryption.service.ts`

---

### P2-3: ZIP Packaging

**Effort:** SMALL

**Description:**  
Package encrypted files into ZIP archives with DGIS-compliant naming.

**Expected Package Format:**
```
CLUES_YYYYMMDD_SEQ.zip
```

**Dependencies:**
- P2-2 (Encryption)

**Evidence Location (post-implementation):**
- `src/modules/giis-export/packaging.service.ts`

---

### P2-4: Automated Scheduling

**Effort:** MEDIUM

**Description:**  
Implement scheduled GIIS export jobs using NestJS `@nestjs/schedule`.

**Configuration Options:**
- Daily/weekly/monthly schedules
- Per-provider scheduling
- Manual trigger support
- Retry on failure

**Dependencies:**
- P2-3 (Packaging)

**Evidence Location (post-implementation):**
- `src/modules/giis-export/scheduler.service.ts`

---

### P2-5: SFTP/HTTPS Delivery

**Effort:** LARGE

**Description:**  
Implement secure file transfer to DGIS endpoints.

**Options:**
1. SFTP upload to DGIS server
2. HTTPS POST to DGIS portal API

**Technical Considerations:**
- Connection pooling
- Certificate management
- Timeout handling
- Error recovery

**Dependencies:**
- P2-4 (Scheduling)

**Evidence Location (post-implementation):**
- `src/modules/giis-export/delivery.service.ts`

---

### P2-6: Acknowledgment Tracking

**Effort:** MEDIUM

**Description:**  
Track DGIS acknowledgment responses and maintain export history.

**Database Schema:**
- Export batch records
- File-level status
- Error logs
- DGIS acknowledgment codes

**Dependencies:**
- P2-5 (Delivery)

**Evidence Location (post-implementation):**
- `src/modules/giis-export/schemas/export-batch.schema.ts`
- `src/modules/giis-export/tracking.service.ts`

---

### P2-7: DGIS Catalog Integration (When Available)

**Effort:** SMALL

**Description:**  
When DGIS publishes the 8 missing catalogs, integrate them into `CatalogsService`.

**Catalogs:**
- GIIS-B013: SITIO_OCURRENCIA, AGENTE_LESION, AREA_ANATOMICA, CONSECUENCIA
- GIIS-B019: TIPO_PERSONAL, SERVICIOS_DET, AFILIACION, PAIS

**Current State:**  
Validation methods exist and return `valid: true` (non-blocking) when catalogs are missing. Once CSV files are placed in `catalogs/normalized/`, strict validation activates automatically.

**Dependencies:**
- External (DGIS publication)

---

### P2-8: GIIS-B015 Consulta Externa Entity

**Effort:** LARGE

**Description:**  
Create the GIIS-B015 (Consulta Externa) entity following the same pattern as Lesion (B013) and Deteccion (B019).

**Scope:**
- Schema with ~60 fields
- DTOs with conditional validation
- CRUD service methods
- REST endpoints
- Transformer for pipe-delimited output
- Test suite

**Dependencies:**
- Phase 1 completed ✅

---

## Effort Sizing Legend

| Size | Description |
|------|-------------|
| **SMALL** | 1-2 days, minimal complexity, isolated changes |
| **MEDIUM** | 3-5 days, moderate complexity, some integration points |
| **LARGE** | 1-2 weeks, high complexity, significant integration or new subsystem |

---

## Priority Matrix

| Task | Effort | Priority | Rationale |
|------|--------|----------|-----------|
| P2-1 | MEDIUM | 🔴 HIGH | Foundation for file-based delivery |
| P2-2 | MEDIUM | 🔴 HIGH | DGIS security requirement |
| P2-3 | SMALL | 🔴 HIGH | Required packaging format |
| P2-4 | MEDIUM | 🟡 MEDIUM | Operational automation |
| P2-5 | LARGE | 🟡 MEDIUM | Delivery mechanism |
| P2-6 | MEDIUM | 🟢 LOW | Operational tracking |
| P2-7 | SMALL | 🟢 LOW | Dependent on DGIS |
| P2-8 | LARGE | 🟢 LOW | Additional GIIS format |

---

## Technical Debt to Address

### From Phase 1

1. **Folio Generation Logic**
   - Current: Schema accepts 8-char alphanumeric
   - Recommended: Implement auto-generation based on CLUES + date + sequence

2. **Performance Benchmarks**
   - Add benchmarks for large-scale export operations (10k+ records)

3. **Integration Tests**
   - Expand MongoDB Memory Server usage for service-level integration tests

---

## External Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| GIIS B013/B019 catalogs | DGIS | ⚠️ Not published |
| 3DES encryption key | DGIS | Requires registration |
| SFTP/HTTPS credentials | DGIS | Requires registration |
| DGIS portal access | Organization | Requires application |

---

## Risk Considerations

### Medium Risk

| Risk | Mitigation |
|------|------------|
| DGIS specification changes | Monitor DGIS announcements; design for flexibility |
| Encryption key management | Use secrets manager; implement key rotation |
| Large file handling | Implement streaming; batch processing |

### Low Risk

| Risk | Mitigation |
|------|------------|
| Network failures during delivery | Implement retry with exponential backoff |
| Catalog format changes | Version catalogs; graceful migration |

---

## Success Criteria for Phase 2

✅ GIIS `.txt` files generated with correct naming  
✅ 3DES encryption applied per DGIS specification  
✅ ZIP packages created correctly  
✅ Scheduled exports running reliably  
✅ Files delivered to DGIS (SFTP or HTTPS)  
✅ Acknowledgments tracked and logged  

---

## Related Documentation

| Document | Path |
|----------|------|
| Phase 1 Final Report | `docs/nom-024/PHASE1_FINAL_REPORT.md` |
| GIIS Export Layer | `docs/nom-024/analysis/GIIS_EXPORT_LAYER.md` |
| Test Coverage Matrix | `docs/nom-024/TEST_COVERAGE_MATRIX.md` |

---

**Prepared by:** Development Team  
**Date:** December 2024

