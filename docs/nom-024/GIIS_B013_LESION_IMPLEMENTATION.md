# GIIS-B013 Lesion Implementation Notes

## Catalog Validation Status

### Available Catalogs
- **CIE-10 (Diagnosticos)**: ✅ Available - Full validation enabled
  - Used for: `codigoCIEAfeccionPrincipal`, `codigoCIECausaExterna`
  - Catalog file: `catalogs/normalized/diagnosticos.csv`

### Unavailable Catalogs (DGIS Not Publicly Published)
The following GIIS-B013 catalogs are **not publicly available** from DGIS:
- `SITIO_OCURRENCIA` (Sitio de Ocurrencia)
- `AGENTE_LESION` (Agente de Lesión)
- `AREA_ANATOMICA` (Área Anatómica)
- `CONSECUENCIA` (Consecuencia/Gravedad)

**Implementation Approach:**
- These fields are validated for:
  - ✅ Integer type
  - ✅ Basic bounds (>= 1)
  - ✅ Requiredness based on `intencionalidad` business rules
  - ❌ **NOT validated against catalog enumeration** (catalog unavailable)

**Rationale:**
1. DGIS does not publish these catalogs in public repositories
2. Strict catalog validation would block all Lesion records until catalogs are obtained
3. Fields accept numeric codes that will be validated when catalogs become available
4. CIE-10 validation (for diagnoses) remains strict as that catalog IS available

## Validation Rules

### Field-Specific Validation

| Field | Validation |
|-------|------------|
| `sitioOcurrencia` | Integer >= 1, required |
| `agenteLesion` | Integer >= 1, conditional (required if intencionalidad = 1, 4) |
| `areaAnatomica` | Integer >= 1, required |
| `consecuenciaGravedad` | Integer >= 1, required |
| `tipoViolencia` | Array of integers >= 1, conditional (required if intencionalidad = 2, 3) |
| `tipoAtencion` | Array of integers >= 1, required, max 5 elements |

### Conditional Validation by Intencionalidad

- **Accidental (1) or Self-inflicted (4)**:
  - `agenteLesion` is **required**
  
- **Violence (2 or 3)**:
  - `tipoViolencia` is **required** (array)

### CIE-10 Validation
- `codigoCIEAfeccionPrincipal`: Validated against CIE-10 catalog ✅
- `codigoCIECausaExterna`: Must be Chapter XX (V01-Y98) and validated against CIE-10 catalog ✅

## Future Enhancement

When DGIS catalogs become available:
1. Add catalog files to `backend/catalogs/normalized/`
2. Update `CatalogsService` to load and validate against these catalogs
3. Update `validateLesionRules()` to use catalog validation
4. Remove this documentation note

## References
- GIIS-B013 Specification: `docs/nom-024/giis_b013_lesiones.md`
- Implementation: `backend/src/modules/expedientes/schemas/lesion.schema.ts`
- Validation: `backend/src/modules/expedientes/expedientes.service.ts::validateLesionRules()`

