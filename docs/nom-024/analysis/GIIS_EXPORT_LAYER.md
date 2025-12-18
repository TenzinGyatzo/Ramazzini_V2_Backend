# GIIS Export Transformation Layer

## Overview

The GIIS Export Transformation Layer converts internal Ramazzini documents (Lesion, Deteccion) to GIIS pipe-delimited format for NOM-024 compliance.

**Module Path:** `backend/src/modules/giis-export/`

## Capabilities

| Feature | Status |
|---------|--------|
| Transform Lesion → GIIS-B013 | ✅ Implemented |
| Transform Deteccion → GIIS-B019 | ✅ Implemented |
| MX-only filtering | ✅ Implemented |
| Date range filtering | ✅ Implemented |
| File creation | ❌ Not implemented |
| 3DES Encryption | ❌ Not implemented |
| Compression | ❌ Not implemented |
| Scheduling/Delivery | ❌ Not implemented |

**Note:** File creation, encryption, compression, and scheduling are deferred to a future phase when DGIS requirements are finalized.

## Architecture

```
giis-export/
├── formatters/
│   ├── date.formatter.ts      # Date formatting (YYYYMMDD, DD/MM/YYYY)
│   ├── sexo.formatter.ts      # Sexo mapping (H/M, 1/2/3)
│   └── field.formatter.ts     # Generic field handling
├── transformers/
│   ├── lesion.transformer.ts  # GIIS-B013 (78 fields)
│   └── deteccion.transformer.ts # GIIS-B019 (91 fields)
├── giis-export.service.ts     # Main export service
└── giis-export.module.ts      # NestJS module
```

## Public Service Methods

### `exportLesionesGIIS(params?: GIISExportParams): Promise<GIISExportResult>`

Exports Lesion records to GIIS-B013 format.

```typescript
// Example usage
const result = await giisExportService.exportLesionesGIIS({
  proveedorSaludId: '...', // Optional: filter by provider
  fechaDesde: new Date('2024-01-01'),
  fechaHasta: new Date('2024-12-31'),
  onlyFinalized: true,
});

// Result
{
  records: ['CLUES|FOLIO|...', 'CLUES|FOLIO|...'],
  totalProcessed: 10,
  skipped: 2,
  metadata: {
    exportDate: Date,
    giisVersion: 'B013-2023',
    fieldCount: 78
  }
}
```

### `exportDeteccionesGIIS(params?: GIISExportParams): Promise<GIISExportResult>`

Exports Deteccion records to GIIS-B019 format.

```typescript
// Example usage
const result = await giisExportService.exportDeteccionesGIIS({
  proveedorSaludId: '...',
  fechaDesde: new Date('2024-01-01'),
  onlyFinalized: true,
});
```

## Sexo Mapping

The system uses **numeric codes** as the default GIIS export format:

| Internal Value | GIIS Numeric | GIIS H/M |
|----------------|--------------|----------|
| `Masculino` | `1` | `H` |
| `Femenino` | `2` | `M` |
| `Intersexual` | `3` | N/A |

**Rationale:** GIIS-B013 and GIIS-B019 specifications use numeric codes (1/2/3) for sexo fields. The H/M format is available for legacy compatibility but not used by default.

## Timezone Handling

All date formatting uses **UTC** to ensure consistent output regardless of server timezone:

```typescript
// Using UTC getters
const year = date.getUTCFullYear();
const month = date.getUTCMonth() + 1;
const day = date.getUTCDate();
```

**Rationale:** GIIS exports must be deterministic. Using UTC prevents issues where a date like `2024-03-15T00:00:00Z` might be formatted as a different day depending on server timezone.

## Field Count

| GIIS Form | Field Count | Pipe Count |
|-----------|-------------|------------|
| B013 (Lesion) | 78 | 77 |
| B019 (Deteccion) | 91 | 90 |

## MX-Only Enforcement

The export service **only processes records for MX providers**:

```typescript
// Internal filtering
if (proveedorSalud.pais !== 'MX') {
  // Skip - non-MX provider
  continue;
}
```

Non-MX providers are silently skipped and counted in the `skipped` field of the result.

## Catalog Handling

Some GIIS fields reference DGIS catalogs that are not publicly available:

| Catalog | Status | Handling |
|---------|--------|----------|
| SITIO_OCURRENCIA | Not available | Store as numeric code |
| AGENTE_LESION | Not available | Store as numeric code |
| AREA_ANATOMICA | Not available | Store as numeric code |
| TIPO_PERSONAL | Not available | Store as numeric code |
| CIE-10 | Available | Full validation |

**Approach:** Fields are exported as-is (numeric codes). When catalogs become available, validation can be added without changing the export format.

## GIIS Version Assumptions

| Form | Version | Notes |
|------|---------|-------|
| GIIS-B013 | 2023 | Lesiones y Causas de Violencia |
| GIIS-B019 | 2023 | Detección Integrada / Tamizaje |

These versions are documented in transformer files. Field positions and counts may change in future DGIS releases.

## Validation

Transformers include validation helpers:

```typescript
import { validateGIISB013Record } from './transformers/lesion.transformer';

const validation = validateGIISB013Record(record);
// { isValid: true, fieldCount: 78, errors: [] }
```

## Testing

Run formatter and transformer tests:

```bash
npm test -- --testPathPattern="giis-export"
```

## Future Enhancements

When DGIS finalizes requirements:

1. **File Creation:** Generate `.txt` files with headers
2. **Encryption:** Implement 3DES encryption
3. **Compression:** ZIP file packaging
4. **Scheduling:** Automated export jobs
5. **Delivery:** SFTP/API submission to DGIS

---

**Last Updated:** December 2024
**Status:** Transformation layer complete; file/encryption deferred

