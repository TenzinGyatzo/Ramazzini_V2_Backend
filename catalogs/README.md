# Mandatory Catalogs — NOM-024-SSA3-2012

## Purpose

This folder contains the **mandatory reference catalogs** required to comply with
**NOM-024-SSA3-2012** and the applicable **GIIS** for Phase 1
(Data Standardization and Semantic Interoperability).

These catalogs are used to:
- Validate structured clinical and demographic data
- Enforce semantic interoperability
- Prevent free-text entry where controlled vocabularies are required

They are **not optional** and must be treated as authoritative data sources
by the backend.

---

## Folder Structure
catalogs/
├── source/
│ └── Original catalogs as provided by official sources (XLSX)
├── normalized/
│ └── Normalized versions (CSV) for backend usage
└── README.md


### `source/`
- Contains the original catalog files as published by official authorities
- Preserved for traceability and auditing purposes
- **Not intended for direct runtime use**

### `normalized/`
- Contains processed and normalized versions of the catalogs
- These files represent the **backend source of truth**
- Intended to be loaded, indexed, and referenced by the system

---

## Catalog Usage Rules

- All catalog references in the backend **must point to normalized catalogs**
- Free-text alternatives are not allowed when a catalog applies
- Catalog codes must be stored, not human-readable descriptions
- Descriptions are display-only and must not be used for logic

---

## Mandatory Catalogs (Phase 1)

The following catalogs are required by NOM-024-SSA3-2012 and applicable GIIS
for this system.

### Person Identification & Demographics

| Catalog | Purpose | Normative Source |
|------|--------|------------------|
| ENTIDAD_FEDERATIVA | Birth and residence state keys | INEGI / RENAPO |
| MUNICIPIOS | Municipality keys | INEGI |
| LOCALIDADES | Locality keys | INEGI |
| NACIONALIDADES | Nationality of origin | RENAPO |
| CODIGO_POSTAL | Geographical validation | SEPOMEX / INEGI |

These catalogs are used to validate:
- Place of birth (EDONAC)
- Place of residence (EDO, MUN, LOC)
- Nationality of origin

---

### Clinical Information

| Catalog | Purpose | Normative Source |
|------|--------|------------------|
| DIAGNOSTICOS (CIE-10) | Diagnoses and conditions | WHO / SSA |

- CIE-10 codes are mandatory for diagnoses in:
  - Injuries
  - Screenings
  - Outpatient consultations
- Multiple diagnosis fields may exist per medical event, as defined by GIIS

---

### Establishments & Institutional Data

| Catalog | Purpose | Normative Source |
|------|--------|------------------|
| ESTABLECIMIENTO_SALUD (CLUES) | Health establishment identification | SSA / DGIS |

- CLUES is mandatory to identify the establishment providing care
- Must be referenced using the official code

---

## Normalization Conventions

Normalized catalogs follow these conventions:

- `code`: official catalog code (string)
- `description`: human-readable label
- `source`: issuing authority
- `version`: publication or extraction date
- Optional geographic hierarchy fields (state_code, municipality_code, etc.)

Example:
```csv
code,description,source,version
01,AGUASCALIENTES,INEGI,2025-07

