# NOM-024-SSA3-2012 — Phase 1 (Backend Technical Interpretation)

## Purpose

This folder contains the **technical, software-oriented interpretation** of the
Mexican Official Standard **NOM-024-SSA3-2012** and its applicable
**Guías de Intercambio de Información en Salud (GIIS)**, specifically for:

- A **SIRES** (Sistema de Información de Registro Electrónico para la Salud)
- Focused on **Occupational Health**
- Backend analysis only
- **Phase 1: Data Standardization and Structure (Semantic Interoperability Prerequisites)**

These documents are intended to be used by backend engineers and automated
analysis tools (e.g., BrainGrid) to perform **compliance analysis, gap detection,
and implementation planning**, not legal interpretation.

---

## Scope

### Included in scope (Phase 1)
- Minimum person identification dataset (Table 1 concepts)
- Mandatory data structures and variables
- Use of fundamental catalogs (CIE-10, INEGI, CLUES, etc.)
- Rules for structured and inalterable electronic documents
- Backend data modeling and validation implications
- Mapping between normative requirements and backend entities

### Explicitly excluded from scope (for now)
- SGSI / security governance implementation details (GIIS-A004)
- Authentication, authorization, electronic signature
- Operational policies of healthcare providers
- Traceability and non-repudiation beyond baseline immutability concepts

These topics will be addressed in later implementation phases.

---

## Applicable GIIS Documents

The following GIIS apply to this system based on its registered functionality
(Occupational Health services):

| GIIS Code | Description |
|---------|-------------|
| GIIS-B013 | Injury and external causes reporting (Lesiones) |
| GIIS-B019 | Screenings and detections reporting (Detecciones / Tamizajes) |
| GIIS-B015 | Outpatient / general consultation reporting (Consulta Externa) |

Each GIIS document in this folder extracts **only the variables, validation rules,
and technical implications relevant to software implementation**.

---

## Files in This Folder

### Core normative interpretation
- `nom024_core_requirements.md`  
  Technical interpretation of NOM-024-SSA3-2012 relevant to backend design and
  Phase 1 compliance.

### GIIS technical extractions
- `giis_b013_lesiones.md`  
- `giis_b019_detecciones.md`  
- `giis_b015_consulta_externa.md`  

Each GIIS file includes:
- Functional scope
- Mandatory variables and catalogs
- Validation and formatting rules
- Implicit software entities

---

## How These Documents Should Be Used

These `.md` files represent the **authoritative technical source** for Phase 1
compliance analysis in this repository.

When performing analysis or planning:
1. Treat these documents as the normative technical reference
2. Compare them against current backend schemas, DTOs, services and validators
3. Identify gaps, partial compliance and missing structures
4. Propose schema changes, validations and catalog integrations
5. **Do not implement changes directly unless explicitly requested**

---

## System Context

The system using these documents is:
- A SIRES used by private and internal occupational health providers
- Registers medical events such as:
  - Injuries
  - Screenings / detections
  - General outpatient consultations
- Required to comply with NOM-024-SSA3-2012 and report to SINAIS using GIIS formats

---

## Notes

- PDF versions of the NOM and GIIS are intentionally excluded from direct analysis.
- These markdown files are curated, technical abstractions designed for software
  engineering workflows.
- Any ambiguity should be resolved by extending these documents, not by inferring
  from the original PDFs directly.

