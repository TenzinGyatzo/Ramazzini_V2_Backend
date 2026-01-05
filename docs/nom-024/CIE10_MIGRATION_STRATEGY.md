# NOM-024 CIE-10 Migration Strategy

## Executive Summary

This document outlines the strategy for handling legacy free-text diagnosis data in relation to NOM-024 CIE-10 compliance requirements.

**Key Principle**: NOM-024 CIE-10 compliance is **forward-looking only** for MX providers. Historical records are NOT required to be retroactively compliant.

---

## 1. Compliance Approach

### 1.1 Forward-Only Enforcement

- **New records** (created after NOM-024 module activation) MUST include valid CIE-10 codes for MX providers
- **Existing records** with free-text diagnosis are grandfathered and remain valid
- No automatic migration or modification of historical data will be performed

### 1.2 Rationale

1. **Medical Accuracy**: Retrospective CIE-10 coding requires medical expertise and cannot be automated safely
2. **Data Integrity**: Modifying historical medical records carries legal and compliance risks
3. **Audit Trail**: Original diagnosis text must be preserved for medical/legal purposes
4. **Regulatory Alignment**: NOM-024 establishes requirements for new data capture, not retroactive correction

---

## 2. Migration Scripts (Read-Only Analysis)

Two analysis scripts are provided for optional use by medical teams:

### 2.1 `analyze-diagnosis-migration.ts`

**Purpose**: Generate statistics about legacy diagnosis data distribution

**Output**:
- Count of documents per provider
- Documents with free-text only vs CIE-10 codes
- Top N most frequent free-text diagnoses
- Per-collection breakdown

**Usage**:
```bash
# Set environment
export MONGODB_URI="mongodb://readonly-user:password@host:27017/database"

# Run analysis
npx ts-node scripts/migration/analyze-diagnosis-migration.ts --confirm-readonly
```

### 2.2 `export-diagnosis-for-review.ts`

**Purpose**: Export unique diagnosis texts for medical team review

**Output**: CSV file with:
- Unique diagnosis text values
- Frequency counts
- Sample document IDs (for reference only)
- Columns for manual CIE-10 mapping

**Usage**:
```bash
# Basic export
npx ts-node scripts/migration/export-diagnosis-for-review.ts --confirm-readonly

# With filters
npx ts-node scripts/migration/export-diagnosis-for-review.ts \
  --confirm-readonly \
  --from-date 2024-01-01 \
  --to-date 2024-12-31 \
  --min-frequency 5 \
  --output ./exports/diagnosis-review-2024.csv
```

---

## 3. Recommended Process

### 3.1 Optional Historical Review Workflow

If an organization decides to enrich historical records (entirely optional):

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Export    │────▶│   Medical    │────▶│   Mapping   │────▶│   Optional   │
│   Script    │     │   Review     │     │   Approval  │     │   Backfill   │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
     Read-Only           Manual            Supervisor          Future Phase
```

1. **Export** - Run `export-diagnosis-for-review.ts` to generate CSV
2. **Medical Review** - Medical coders map diagnoses to CIE-10 codes
3. **Mapping Approval** - Supervisory review of mappings
4. **Optional Backfill** - If ever needed, implement with full audit trail

### 3.2 Timeline Guideline (If Elected)

| Phase | Duration | Activity |
|-------|----------|----------|
| 1 | Week 1 | Run analysis scripts, assess volume |
| 2 | Week 2-4 | Medical team reviews high-frequency diagnoses |
| 3 | Week 4-5 | Quality assurance on mappings |
| 4 | Future | Optional backfill (separate project) |

**Note**: This timeline is a guideline only. Many organizations may choose never to backfill historical data.

---

## 4. Operational Safety Guidelines

### 4.1 Script Execution Requirements

1. **Read-Only Database User**
   ```bash
   # Create read-only user in MongoDB
   db.createUser({
     user: "nom024_readonly",
     pwd: "secure_password",
     roles: [{ role: "read", db: "production_db" }]
   })
   ```

2. **Run on Staging or Dump**
   - Prefer running scripts against a database dump or staging environment
   - Avoid running directly against production unless necessary

3. **Backup Before Any Operation**
   ```bash
   # Full backup
   mongodump --uri="mongodb://..." --out=/backup/before-analysis
   ```

4. **Mandatory Safety Flag**
   - All scripts require `--confirm-readonly` flag
   - Scripts will refuse to run without this flag

### 4.2 Write Guard Protection

Both scripts implement best-effort write guards that:
- Override Mongoose write methods to throw errors
- Log warning if write operations are attempted
- Block: `updateOne`, `updateMany`, `insertOne`, `insertMany`, `deleteOne`, `deleteMany`, `bulkWrite`, `save`

### 4.3 Connection String Safety

```bash
# Use read replica preference
MONGODB_URI="mongodb://user:pass@host:27017/db?readPreference=secondaryPreferred"

# Or connect to secondary only
MONGODB_URI="mongodb://user:pass@secondary-host:27017/db?readPreference=secondary"
```

---

## 5. Data Considerations

### 5.1 Diagnosis Fields by Collection

| Collection | Field | CIE-10 Fields |
|------------|-------|---------------|
| NotaMedica | `diagnostico` | `codigoCIE10Principal`, `codigosCIE10Complementarios` |
| Audiometria | `diagnosticoAudiometria` | (none - specialty specific) |
| ExamenVista | `diagnosticoRecomendaciones` | (none - specialty specific) |
| Lesion | `diagnosticoLesion` | Embedded CIE-10 support |
| Deteccion | (various) | GIIS-B019 format |

### 5.2 Text Normalization

The export script normalizes diagnosis text for deduplication:
- Convert to uppercase
- Collapse whitespace
- Remove trailing punctuation
- Trim

Original text is preserved in the CSV for medical review.

---

## 6. Legal and Compliance Notes

### 6.1 Historical Data Policy

- Original diagnosis text is **never deleted**
- CIE-10 codes, if added retroactively, are stored as **additional** fields
- All modifications require audit trail with user, timestamp, and reason

### 6.2 NOM-024 Compliance Statement

Per NOM-024-SSA3-2012 implementation guidelines:
- New medical records must comply with established formats
- Existing records maintain validity under prior standards
- System provides tools for optional retrospective enrichment without mandate

---

## 7. Technical Implementation Notes

### 7.1 Schema Design

The system supports both legacy and NOM-024 compliant data:

```typescript
// NotaMedica schema excerpt
{
  // Legacy field (preserved)
  diagnostico: String,
  
  // NOM-024 compliant fields
  codigoCIE10Principal: {
    codigo: String,      // e.g., "J06.9"
    descripcion: String, // e.g., "INFECCIÓN RESPIRATORIA..."
  },
  codigosCIE10Complementarios: [{
    codigo: String,
    descripcion: String,
  }],
  
  // Audit fields
  fechaCreacion: Date,
  usuarioCreador: ObjectId,
}
```

### 7.2 Validation Behavior

- **MX Providers**: CIE-10 fields required on new records
- **Non-MX Providers**: Free-text diagnosis allowed (backward compatible)
- **All Providers**: Free-text diagnosis preserved if provided alongside CIE-10

---

## 8. Contact and Support

For questions about this migration strategy:
- Technical: Development team
- Medical Coding: Medical informatics team
- Compliance: Regulatory affairs

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024-12 | NOM-024 Team | Initial strategy document |

