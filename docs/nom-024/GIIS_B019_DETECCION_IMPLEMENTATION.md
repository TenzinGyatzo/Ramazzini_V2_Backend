# GIIS-B019 Detection Implementation Notes

## Catalog Validation Status

### Available Catalogs
- **CIE-10 (Diagnosticos)**: ✅ Available - Full validation enabled
- **CLUES (Establecimientos)**: ✅ Available - Full validation enabled
- **RENAPO (CURP)**: ✅ Available - Format and checksum validation

### Unavailable Catalogs (DGIS Not Publicly Published)

The following GIIS-B019 catalogs are **not publicly available** from DGIS:

| Catalog | Description | Usage |
|---------|-------------|-------|
| `TIPO_PERSONAL` | Tipo de Personal de Salud | Determines valid detection types per role |
| `SERVICIOS_DET` | Servicios de Detección | Validates age restrictions per service |
| `AFILIACION` | Derechohabiencia | Insurance/affiliation codes |
| `PAIS` | Países de Procedencia | Required for international migrants |
| `DIRECTORIO_SERVICIOS_AMIGABLES` | Servicios Amigables Directory | Age 10-19 specific services |

## Implementation Approach

**Current Status:** Best-effort validation without strict catalog enforcement.

When GIIS-B019 detection entities are implemented, fields referencing these catalogs will be validated for:
- ✅ Integer type
- ✅ Basic bounds (>= 0 or >= 1 as appropriate)
- ✅ Requiredness based on business rules (age, sex, role)
- ❌ **NOT validated against catalog enumeration** (catalogs unavailable)

## Rationale

1. **External Regulatory Dependency**: DGIS does not publish these catalogs in public repositories
2. **No Technical Gap**: The system architecture supports catalog validation; only the data is missing
3. **Graceful Degradation**: When catalogs become available, strict validation can be enabled
4. **MX-Only Feature**: GIIS-B019 detections are only required for Mexican healthcare providers

## Business Rules (Documented for Future Implementation)

### Tipo de Personal Restrictions
- If `tipoPersonal == 30` (Trabajador Social):
  - Most clinical detections are **disabled**
  - Affected: Depression, Anxiety, ITS, Chronic diseases, Cancer screenings, Spirometry
  - These fields should report `-1` (Not Applicable)

### Age/Sex Conditional Fields
| Detection Type | Sex | Age Range |
|----------------|-----|-----------|
| Prostate screening | Male (1) | >= 40 years |
| VPH detection | Female (2) | 35-64 years |
| CaCu detection | Female (2) | 25-64 years |
| Geriatric block | Any | >= 60 years |
| Friendly services | Any | 10-19 years |
| Chronic diseases | Any | >= 20 years |

### Vital Signs Validation
- `peso`: 1-400 kg (use `999` or `0` if not applicable)
- `talla`: Valid height range
- `cintura`: 20-300 cm
- `sistolica` >= `diastolica` (blood pressure consistency)
- `glucemia`: 20-999 (if > 0, fasting type is required)

## Future Enhancement

When DGIS catalogs become available:

1. **Obtain catalog files** from official DGIS sources
2. **Add to catalog directory**: `backend/catalogs/normalized/`
3. **Update CatalogsService** to load GIIS-B019 specific catalogs:
   - `tipo_personal.csv`
   - `servicios_det.csv`
   - `afiliacion.csv`
   - `pais.csv`
4. **Update validation logic** to use catalog validation
5. **Remove this limitation documentation**

## Impact Assessment

| Component | Impact |
|-----------|--------|
| Schema validation | None - not yet implemented |
| DTO validation | None - not yet implemented |
| Service logic | None - not yet implemented |
| Export functionality | Future - will use catalog codes |

## This is NOT a Technical Gap

This limitation is an **external regulatory dependency**:
- The technical infrastructure to support catalog validation exists
- Only the official catalog data is missing
- DGIS is the authoritative source for these catalogs
- No fake or guessed values should be used

## Implementation Status

**Implemented in Task 15 (December 2024)**

### Files Created/Modified

| File | Description |
|------|-------------|
| `backend/src/modules/expedientes/schemas/deteccion.schema.ts` | Mongoose schema with GIIS-B019 fields |
| `backend/src/modules/expedientes/dto/create-deteccion.dto.ts` | Create DTO with validation |
| `backend/src/modules/expedientes/dto/update-deteccion.dto.ts` | Update DTO (partial) |
| `backend/src/modules/expedientes/expedientes.service.ts` | CRUD + finalize + validation methods |
| `backend/src/modules/expedientes/expedientes.controller.ts` | REST endpoints |
| `backend/src/modules/expedientes/expedientes.module.ts` | Model registration |
| `backend/src/modules/expedientes/deteccion-validation.spec.ts` | Unit tests |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expedientes/:trabajadorId/documentos/deteccion` | Create detection |
| GET | `/api/expedientes/:trabajadorId/documentos/deteccion/:id` | Get by ID |
| GET | `/api/expedientes/:trabajadorId/documentos/detecciones/:trabajadorId` | List by worker |
| PATCH | `/api/expedientes/:trabajadorId/documentos/deteccion/:id` | Update |
| DELETE | `/api/expedientes/:trabajadorId/documentos/deteccion/:id` | Delete |
| POST | `/api/expedientes/:trabajadorId/documentos/deteccion/:id/finalizar` | Finalize |

### Validation Summary

| Validation | MX Provider | Non-MX Provider |
|------------|-------------|-----------------|
| Core fields (CURP, tipoPersonal, etc.) | **Required** | Optional |
| BP consistency (sys >= dia) | **Error** | Warning |
| Age-based blocks | **Error** | Warning |
| Sex-based restrictions | **Error** | Warning |
| Trabajador Social exclusions | **Error** | Warning |
| Vitals ranges | **Error** | Warning |
| Catalog codes | Best-effort | Best-effort |

## References

- GIIS-B019 Specification: `docs/nom-024/giis_b019_detecciones.md`
- GIIS-B013 Implementation Notes: `docs/nom-024/GIIS_B013_LESION_IMPLEMENTATION.md`
- Catalog Service: `backend/src/modules/catalogs/catalogs.service.ts`

---

**Last Updated**: December 2024
**Status**: Implemented with best-effort validation (awaiting official DGIS catalog publication)

