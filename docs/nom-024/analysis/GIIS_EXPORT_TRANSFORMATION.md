# GIIS Export Transformation Layer

## Overview

The GIIS Export module provides a **backend-only transformation layer** that converts internal medical record entities (`Lesion` for GIIS-B013 and `Deteccion` for GIIS-B019) into GIIS-compliant pipe-delimited string records.

**Important:** This module handles **transformation only**. It does NOT:
- Create files
- Implement encryption (3DES)
- Handle compression
- Perform scheduling or delivery
- Modify internal storage formats

## Module Location

```
backend/src/modules/giis-export/
├── giis-export.module.ts
├── giis-export.service.ts
├── formatters/
│   ├── date.formatter.ts       # Date/time formatting utilities
│   ├── date.formatter.spec.ts
│   ├── sexo.formatter.ts       # Sex/gender code mapping
│   ├── sexo.formatter.spec.ts
│   ├── field.formatter.ts      # Multi-value and null handling
│   └── field.formatter.spec.ts
└── transformers/
    ├── lesion.transformer.ts   # GIIS-B013 record transformer
    ├── lesion.transformer.spec.ts
    ├── deteccion.transformer.ts # GIIS-B019 record transformer
    └── deteccion.transformer.spec.ts
```

## GIIS Specification Versions

| Entity | GIIS Format | Field Count | Notes |
|--------|-------------|-------------|-------|
| Lesion | GIIS-B013 | 78 fields | Injury/violence reporting |
| Deteccion | GIIS-B019 | 91 fields | Screening/detection reporting |

## Formatters

### Date Formatter (`date.formatter.ts`)

| Function | Input | Output | Example |
|----------|-------|--------|---------|
| `toAAAAMMDD(date)` | Date/string/null | `YYYYMMDD` or `""` | `"20240315"` |
| `toDDMMAAAA(date)` | Date/string/null | `DD/MM/YYYY` or `""` | `"15/03/2024"` |
| `toHHMM(time)` | `HH:mm` string/null | `HHMM` or `""` | `"1430"` |

**Timezone Handling:**
- All dates use **UTC getters** (`getUTCFullYear`, etc.) to ensure deterministic output
- Stored Date objects are treated as UTC to avoid server timezone offset surprises
- This is critical for GIIS compliance where dates must be consistent

### Sexo Formatter (`sexo.formatter.ts`)

Two mapping schemes are supported for flexibility:

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `toGIISHM(sexo)` | Various | `'H'`, `'M'`, `'I'`, `''` | Letter codes |
| `toGIISNumeric(sexo)` | Various | `'1'`, `'2'`, `'3'`, `''` | Numeric codes |

**Supported Input Formats:**
- String: `'Masculino'`, `'Femenino'`, `'Intersexual'` (case-insensitive)
- String: `'M'`, `'F'`, `'H'`, `'I'` (single-letter codes)
- Number: `1` (male), `2` (female), `3` (intersex)
- Schema value: `'Masculino' | 'Femenino' | 'Otro'`

**GIIS Mapping:**
| Internal | H/M Format | Numeric Format |
|----------|------------|----------------|
| Masculino | `H` (Hombre) | `1` |
| Femenino | `M` (Mujer) | `2` |
| Intersexual/Otro | `I` | `3` |

### Field Formatter (`field.formatter.ts`)

| Function | Description | Example |
|----------|-------------|---------|
| `toSafeString(value)` | Null-safe string conversion | `null` → `""`, `123` → `"123"` |
| `toMultiValueString(arr)` | Array to `&`-joined string | `[1,2,3]` → `"1&2&3"` |
| `toGIISBoolean(value)` | Tri-state boolean | `true` → `"1"`, `false` → `"0"`, `null` → `""` |

## Transformers

### Lesion Transformer (GIIS-B013)

```typescript
transformLesionToGIIS(
  lesionDoc: any,
  trabajadorDoc: any,
  proveedorDoc: any
): string
```

Generates a **78-field** pipe-delimited record for injury/violence reporting.

**Key Fields Mapped:**
- CLUES (establishment ID)
- Folio (internal record number)
- Patient CURP and demographics
- Event information (date, location, intentionality)
- Injury agent and violence type (conditional)
- Care information (date, type, anatomical area)
- CIE-10 diagnoses (principal and external cause)
- Responsible professional CURP

### Deteccion Transformer (GIIS-B019)

```typescript
transformDeteccionToGIIS(
  deteccionDoc: any,
  trabajadorDoc: any,
  proveedorDoc: any
): string
```

Generates a **91-field** pipe-delimited record for screening/detection reporting.

**Key Field Blocks:**
- Core linkage (CLUES, date, professional CURP)
- Service identifiers (tipoPersonal, servicioAtencion)
- Vital signs/measurements (peso, talla, blood pressure, glucemia)
- Mental health results (age >= 10)
- Geriatrics results (age >= 60)
- Chronic disease results (age >= 20)
- Addictions screening
- STI results
- Cancer screening (sex-dependent)
- Violence detection

## Service API

### `GiisExportService`

```typescript
// Export all Lesion records for a MX provider
exportLesionesGIIS(params: {
  proveedorSaludId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}): Promise<string[]>

// Export all Deteccion records for a MX provider
exportDeteccionesGIIS(params: {
  proveedorSaludId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}): Promise<string[]>
```

**Filtering:**
- Only exports records where `proveedorSalud.pais === 'MX'`
- Supports date range filtering
- Returns empty array for non-MX providers (no error thrown)

## MX-Only Processing

The export service **only processes records from Mexican providers**:

```typescript
// Internal check
if (proveedorSalud?.pais !== 'MX') {
  return []; // Silent skip for non-MX
}
```

This ensures GIIS exports are only generated for entities subject to NOM-024 compliance.

## Output Format

Each transformer returns a **single pipe-delimited string**:

```
CLUE123456A|00000001|ROAJ850102HDFLRN08|19850102|H|20240315|1430|1|1|...
```

- Fields are separated by `|`
- Empty/null fields result in empty strings between pipes: `||`
- Multi-value fields use `&` as separator: `1&2&3`
- Full field count is preserved (78 for B013, 91 for B019)

## Testing

The module includes comprehensive unit tests:

```bash
# Run GIIS Export tests only
npm test -- --testPathPattern="giis-export"
```

**Test Coverage:**
- Date formatter: all formats, edge cases, invalid inputs
- Sexo formatter: all input variations, invalid values
- Field formatter: null handling, arrays, type coercion
- Lesion transformer: full record transformation, pipe count validation
- Deteccion transformer: full record transformation, conditional blocks

## Known Limitations

1. **Missing DGIS Catalogs:** Some GIIS catalog validations (SITIO_OCURRENCIA, AGENTE_LESION, TIPO_PERSONAL, etc.) are not available from DGIS. Fields use best-effort numeric validation.

2. **No File Generation:** This module does not create physical files. File generation, encryption, and delivery are separate concerns.

3. **No Real-time Export:** This is a pull-based API, not an automated scheduler.

## Future Enhancements

When ready to implement full GIIS file generation:

1. Add file writer service (to generate `.txt` files)
2. Add 3DES encryption layer (per GIIS spec)
3. Add compression (if required)
4. Add scheduler for automated exports
5. Add delivery mechanism (SFTP, email, etc.)

## References

- NOM-024-SSA3-2012 (Mexican Standard)
- GIIS-B013 Specification: `docs/nom-024/giis_b013_lesiones.md`
- GIIS-B019 Specification: `docs/nom-024/giis_b019_detecciones.md`
- Lesion Implementation: `backend/docs/nom-024/GIIS_B013_LESION_IMPLEMENTATION.md`
- Detección Implementation: `backend/docs/nom-024/GIIS_B019_DETECCION_IMPLEMENTATION.md`

