# NOM-024 CIE-10 Migration Scripts

## Overview

These scripts are **READ-ONLY** tools for analyzing legacy free-text diagnosis data to support optional CIE-10 migration reviews.

> ⚠️ **IMPORTANT**: These scripts do NOT modify any data. They are for analysis and export only.

---

## Prerequisites

1. Node.js 18+ with TypeScript support
2. MongoDB connection string with read access
3. The `--confirm-readonly` flag is REQUIRED for all scripts

---

## Scripts

### 1. `analyze-diagnosis-migration.ts`

Analyzes the distribution of diagnosis data across MX providers.

**Usage:**
```bash
# Set environment
export MONGODB_URI="mongodb://readonly-user:password@host:27017/database"

# Run analysis
npx ts-node scripts/migration/analyze-diagnosis-migration.ts --confirm-readonly
```

**Output:**
- JSON summary of diagnosis statistics per MX provider
- Human-readable console summary
- Top 10 most frequent free-text diagnoses per provider

---

### 2. `export-diagnosis-for-review.ts`

Exports unique diagnosis texts to CSV for medical team review.

**Usage:**
```bash
# Basic export (all MX providers, all dates)
npx ts-node scripts/migration/export-diagnosis-for-review.ts --confirm-readonly

# With filters
npx ts-node scripts/migration/export-diagnosis-for-review.ts \
  --confirm-readonly \
  --provider-ids "67890abc,12345def" \
  --from-date 2024-01-01 \
  --to-date 2024-12-31 \
  --min-frequency 5 \
  --limit 1000 \
  --output ./exports/diagnosis-review.csv
```

**Options:**
| Flag | Description | Default |
|------|-------------|---------|
| `--confirm-readonly` | REQUIRED safety flag | - |
| `--provider-ids` | Comma-separated provider IDs | All MX providers |
| `--from-date` | Start date (YYYY-MM-DD) | No limit |
| `--to-date` | End date (YYYY-MM-DD) | No limit |
| `--min-frequency` | Minimum occurrences to include | 1 |
| `--limit` | Maximum diagnoses to export | No limit |
| `--output` | Output file path | `./migration-output/diagnosis-export.csv` |

**Output CSV Columns:**
- `diagnosis_text` - Original diagnosis text
- `normalized_text` - Normalized for comparison
- `frequency` - Number of occurrences
- `collections` - Source collections (NotaMedica, Audiometria, etc.)
- `sample_doc_ids` - Up to 5 sample document IDs for reference
- `first_seen` / `last_seen` - Date range of occurrences
- `cie10_code` - Empty (for medical reviewer to fill)
- `reviewed_by` - Empty (for medical reviewer)
- `review_date` - Empty (for medical reviewer)
- `notes` - Empty (for medical reviewer)

---

## Safety Features

### 1. Mandatory Safety Flag
All scripts require `--confirm-readonly` to run. Without it, scripts exit immediately.

### 2. Write Guard Protection
Scripts install guards that block all write operations:
- `updateOne`, `updateMany`
- `insertOne`, `insertMany`
- `deleteOne`, `deleteMany`
- `bulkWrite`, `save`

If any write is attempted, the script throws an error.

### 3. Recommended Setup

```bash
# Create a read-only MongoDB user
db.createUser({
  user: "nom024_readonly",
  pwd: "secure_password",
  roles: [{ role: "read", db: "your_database" }]
})

# Use read replica preference in connection string
MONGODB_URI="mongodb://nom024_readonly:password@host:27017/db?readPreference=secondaryPreferred"
```

### 4. Backup Before Running
```bash
# Full backup (recommended)
mongodump --uri="mongodb://admin:pass@host:27017/db" --out=/backup/before-analysis
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |

---

## Output Directory

Scripts create output in `./migration-output/` by default. This directory is created automatically if it doesn't exist.

---

## Related Documentation

- [CIE-10 Migration Strategy](../../docs/nom-024/CIE10_MIGRATION_STRATEGY.md)
- [Diagnosis Mapping Template](../../docs/nom-024/DIAGNOSIS_MAPPING_TEMPLATE.csv)
- [NOM-024 Analysis](../../docs/nom-024/analysis/)

---

## Troubleshooting

### Script won't start
- Ensure `--confirm-readonly` flag is present
- Check `MONGODB_URI` environment variable is set

### Connection errors
- Verify MongoDB URI is correct
- Ensure user has read permissions
- Check network/firewall access

### No data exported
- Verify MX providers exist with `pais: 'MX'`
- Check if trabajadores are linked to proveedores via centros de trabajo
- Review date range filters

---

## Support

For questions about these scripts, contact the development team.

