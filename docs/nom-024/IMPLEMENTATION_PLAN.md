# NOM-024 Phase 1 — Backend Implementation Plan (Draft)

## Objective
Achieve NOM-024-SSA3-2012 **Phase 1 compliance** for data standardization and structure
(semantic interoperability prerequisites) in the backend, without implementing changes yet.

## Scope
Included:
- Minimum person identification dataset alignment
- Catalog-backed fields (INEGI, CLUES, CIE-10, etc.)
- Backend validations and storage constraints
- Baseline immutability strategy for finalized medical events

Excluded (later phases):
- SGSI (GIIS-A004), authentication/authorization hardening, electronic signatures
- Full traceability / non-repudiation implementation

## Inputs (authoritative technical sources)
- `docs/nom-024/nom024_core_requirements.md`
- `docs/nom-024/giis_b013_lesiones.md`
- `docs/nom-024/giis_b019_detecciones.md`
- `docs/nom-024/giis_b015_consulta_externa.md`
- `catalogs/normalized/*`

## Expected Outputs (from repo analysis)
1) Field-by-field compliance matrix (normative → backend)
2) Gap list with severity and dependencies
3) Proposed schema/DTO changes (not implemented)
4) Catalog integration strategy (loading, indexing, validation)
5) Immutability approach recommendation for finalized records

## Proposed Implementation Order (high level)
1) Inventory current entities/DTOs and identify “person” and “medical event” boundaries
2) Align person identification fields and validation rules
3) Integrate mandatory catalogs and replace free-text where required
4) Align medical event variables to GIIS dictionaries
5) Define baseline immutability mechanism for finalized records
