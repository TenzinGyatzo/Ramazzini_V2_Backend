# NOM-024 Test Coverage Matrix

This document maps each NOM-024 Phase 1 task to its corresponding test files and coverage.

## Coverage Summary

| Category | Test Files | Estimated Tests |
|----------|------------|-----------------|
| Catalog Integration | 1 | ~20 |
| CURP Validation | 1 | ~25 |
| Name Validation | 1 | ~30 |
| Vital Signs | 1 | ~35 |
| Document State | 1 | ~15 |
| Lesion (GIIS-B013) | 1 | ~25 |
| Deteccion (GIIS-B019) | 1 | ~25 |
| GIIS Export | 1 | ~30 |
| **Total NOM-024** | **8** | **~205** |

## Detailed Task-to-Test Mapping

### Task 1: Create Catalog Integration Service

**Test File:** `test/nom024/catalogs.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Load base catalogs | CIE-10, INEGI, CLUES, Nacionalidades | ✅ |
| Handle missing files | Graceful fallback for missing CSVs | ✅ |
| Validate CIE-10 codes | Format and lookup validation | ✅ |
| Validate CLUES codes | 11-char format validation | ✅ |
| Validate INEGI codes | Estado, Municipio, Localidad | ✅ |
| Search catalog entries | Query by code/description | ✅ |

### Task 2: Implement Conditional NOM-024 Enforcement

**Test File:** `test/nom024/catalogs.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| MX provider enforcement | Strict validation | ✅ |
| Non-MX provider warnings | Permissive with warnings | ✅ |

### Task 3: Enhance CURP Validation

**Test File:** `test/nom024/curp-validation.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Valid CURP formats | 18-char RENAPO format | ✅ |
| Invalid length | Reject != 18 chars | ✅ |
| Invalid sex character | Only H or M | ✅ |
| Invalid date positions | Numbers in date section | ✅ |
| Checksum validation | RENAPO algorithm | ✅ |
| Generic CURP detection | XXXX patterns | ✅ |
| Null/undefined handling | Edge cases | ✅ |
| Case normalization | Lowercase → uppercase | ✅ |

### Task 4: Add Trabajador Person Identification Fields

**Test File:** `test/fixtures/trabajador.fixtures.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| MX Trabajador fixture | All NOM-024 fields | ✅ |
| Non-MX Trabajador fixture | Optional fields | ✅ |
| EntidadNacimiento | INEGI code | ✅ |
| Nacionalidad | RENAPO code | ✅ |

### Task 5: Add CLUES to ProveedorSalud

**Test File:** `test/nom024/catalogs.nom024.spec.ts`, `test/fixtures/proveedor-salud.fixtures.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| MX provider with CLUES | 11-char CLUES code | ✅ |
| MX provider without CLUES | Missing CLUES error | ✅ |
| Invalid CLUES format | Reject invalid format | ✅ |

### Task 6: Implement Document State Management

**Test File:** `test/nom024/document-state.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| BORRADOR state | Draft documents | ✅ |
| FINALIZADO state | Finalized documents | ✅ |
| CANCELADO state | Cancelled documents | ✅ |
| Valid transitions | BORRADOR → FINALIZADO | ✅ |
| Invalid transitions | FINALIZADO → BORRADOR | ✅ |

### Task 7: Enforce Document Immutability

**Test File:** `test/nom024/document-state.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Mutable states | Only BORRADOR | ✅ |
| Immutable states | FINALIZADO, CANCELADO | ✅ |
| Finalization metadata | fechaFinalizacion, finalizadoPor | ✅ |

### Task 8: Integrate CIE-10 Diagnosis Validation

**Test File:** `test/nom024/catalogs.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Valid CIE-10 format | A00, A00.0, B99 | ✅ |
| Invalid CIE-10 format | INVALID, 123, A | ✅ |
| Chapter XX external cause | V01-Y98 | ✅ |
| CIE-10 search | Query by description | ✅ |

### Task 9: Add Professional CURP Fields

**Test File:** `test/nom024/curp-validation.nom024.spec.ts`, `test/fixtures/professional.fixtures.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| MedicoFirmante CURP | Valid format required for MX | ✅ |
| EnfermeraFirmante CURP | Valid format required for MX | ✅ |
| TecnicoFirmante CURP | Valid format required for MX | ✅ |
| Non-MX professionals | CURP optional | ✅ |

### Task 10: Name Format Validation

**Test File:** `test/nom024/name-validation.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Detect abbreviations | DR., ING., LIC., SR., SRA. | ✅ |
| Remove abbreviations | Clean name output | ✅ |
| Max length (50 chars) | Validation limit | ✅ |
| Trailing periods | Remove/reject | ✅ |
| Uppercase normalization | Convert to uppercase | ✅ |
| Accented characters | ÁÉÍÓÚÜÑ support | ✅ |
| MX strict validation | Errors for violations | ✅ |
| Non-MX warnings | Non-blocking warnings | ✅ |

### Task 11: Vital Signs Range Validation

**Test File:** `test/nom024/vital-signs.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| BP systolic range | 60-250 mmHg | ✅ |
| BP diastolic range | 30-150 mmHg | ✅ |
| Heart rate range | 30-220 lpm | ✅ |
| Temperature range | 34-42°C | ✅ |
| SpO2 range | 70-100% | ✅ |
| Weight range | 20-300 kg | ✅ |
| Height range | 0.5-2.5 m | ✅ |
| BP consistency | Systolic > Diastolic | ✅ |
| IMC consistency | peso/(altura²) | ✅ |
| MX strict validation | Errors for out-of-range | ✅ |
| Non-MX warnings | Non-blocking warnings | ✅ |

### Task 12: Obtain GIIS-B013 Catalogs

**Test File:** `test/nom024/lesion-giis-b013.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Missing catalog handling | No failure on missing CSV | ✅ |
| Best-effort validation | Integer + basic bounds | ✅ |
| sitioOcurrencia | Integer >= 1 | ✅ |
| agenteLesion | Integer >= 1 (conditional) | ✅ |
| areaAnatomica | Integer >= 1 | ✅ |
| consecuenciaGravedad | Integer >= 1 | ✅ |

### Task 13: Create GIIS-B013 Lesion Entity

**Test File:** `test/nom024/lesion-giis-b013.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Required fields | All mandatory fields | ✅ |
| CLUES format | 11 alphanumeric | ✅ |
| Folio format | 8 digits | ✅ |
| CURP validation | Patient and responsible | ✅ |
| Sexo enum | 1, 2, 3 | ✅ |
| Intencionalidad enum | 1, 2, 3, 4 | ✅ |
| Conditional agenteLesion | Required for 1, 4 | ✅ |
| Conditional tipoViolencia | Required for 2, 3 | ✅ |
| CIE-10 codes | Principal and external | ✅ |
| Temporal validation | fechaNac <= fechaEvento <= fechaAtencion | ✅ |
| Document state | BORRADOR, FINALIZADO | ✅ |

### Task 14: Obtain GIIS-B019 Catalogs

**Test File:** `test/nom024/deteccion-giis-b019.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Missing catalog handling | No failure on missing CSV | ✅ |
| Best-effort validation | Integer type | ✅ |
| tipoPersonal | Integer validation | ✅ |
| servicioAtencion | Integer validation | ✅ |

### Task 15: Create GIIS-B019 Deteccion Entity

**Test File:** `test/nom024/deteccion-giis-b019.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Required fields | All mandatory fields | ✅ |
| CLUES format | 11 alphanumeric | ✅ |
| CURP prestador | Valid format | ✅ |
| Vital signs ranges | peso, talla, BP, glucemia | ✅ |
| BP consistency | Systolic > Diastolic | ✅ |
| Mental health block | Age >= 10 | ✅ |
| Chronic diseases block | Age >= 20 | ✅ |
| Geriatrics block | Age >= 60 | ✅ |
| Female-only fields | Cancer screening, violence | ✅ |
| Male-only fields | Prostate | ✅ |
| Result values | -1, 0, 1 | ✅ |
| Document state | BORRADOR, FINALIZADO | ✅ |

### Task 16: Create GIIS Export Transformation Layer

**Test File:** `test/nom024/giis-export.nom024.spec.ts`

| Test Case | Description | Status |
|-----------|-------------|--------|
| Date formatter YYYYMMDD | toAAAAMMDD() | ✅ |
| Date formatter DD/MM/YYYY | toDDMMAAAA() | ✅ |
| Time formatter HHMM | toHHMM() | ✅ |
| Sexo formatter H/M | toGIISHM() | ✅ |
| Sexo formatter numeric | toGIISNumeric() | ✅ |
| Safe string conversion | toSafeString() | ✅ |
| Multi-value strings | toMultiValueString() | ✅ |
| GIIS boolean | toGIISBoolean() | ✅ |
| Lesion transformer | 78 fields, 77 pipes | ✅ |
| Deteccion transformer | 91 fields, 90 pipes | ✅ |
| Deterministic output | Same input = same output | ✅ |

## Running Tests

```bash
# All NOM-024 tests
npm run test:nom024

# With coverage
npm run test:nom024 -- --coverage

# Specific test file
npm run test:nom024 -- --testPathPattern="curp-validation"
```

## Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Statement Coverage | 80% | TBD |
| Branch Coverage | 75% | TBD |
| Function Coverage | 80% | TBD |
| Line Coverage | 80% | TBD |

## Notes

1. **Missing Catalogs:** Tests are designed to pass even when optional GIIS catalog CSV files are missing.

2. **MX vs Non-MX:** Both scenarios are tested to ensure correct conditional behavior.

3. **Fixtures:** All test data is in `test/fixtures/` for reusability.

4. **Utilities:** MongoDB Memory Server and testing helpers are in `test/utils/`.

