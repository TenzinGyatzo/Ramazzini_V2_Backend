/**
 * NOM-024 CIE-10 Diagnosis Export Script
 *
 * SAFETY: This script is READ-ONLY. It does NOT modify any data.
 *
 * Purpose:
 * - Export unique diagnosis_text values (deduplicated)
 * - Include frequencies and sample document references (IDs only)
 * - Support filtering by provider ID(s) and date range
 * - Output CSV for medical review team
 *
 * Usage:
 *   npx ts-node scripts/migration/export-diagnosis-for-review.ts --confirm-readonly [options]
 *
 * Options:
 *   --provider-ids <ids>  Comma-separated provider IDs to filter (optional)
 *   --from-date <date>    Start date (YYYY-MM-DD) for date range filter (optional)
 *   --to-date <date>      End date (YYYY-MM-DD) for date range filter (optional)
 *   --limit <n>           Limit number of unique diagnoses to export (default: all)
 *   --min-frequency <n>   Only export diagnoses with at least N occurrences (default: 1)
 *   --output <path>       Output file path (default: ./migration-output/diagnosis-export.csv)
 *
 * Environment Variables:
 *   MONGODB_URI - MongoDB connection string (required)
 *
 * Example:
 *   MONGODB_URI="mongodb://..." npx ts-node scripts/migration/export-diagnosis-for-review.ts \
 *     --confirm-readonly \
 *     --from-date 2024-01-01 \
 *     --min-frequency 5
 *
 * @author NOM-024 Compliance Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// SAFETY GUARDS
// ============================================================================

const READONLY_FLAG = '--confirm-readonly';
const args = process.argv.slice(2);

if (!args.includes(READONLY_FLAG)) {
  console.error(`
╔══════════════════════════════════════════════════════════════════╗
║  SAFETY CHECK FAILED                                             ║
║                                                                  ║
║  This script requires the ${READONLY_FLAG} flag to run.          ║
║  This confirms you understand this is a READ-ONLY operation.     ║
║                                                                  ║
║  Usage:                                                          ║
║    npx ts-node scripts/migration/export-diagnosis-for-review.ts \\║
║      ${READONLY_FLAG} [options]                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

/**
 * Write operation guard - throws if any write method is invoked
 */
function installWriteGuards(connection: mongoose.Connection): void {
  const forbiddenMethods = [
    'insertOne',
    'insertMany',
    'updateOne',
    'updateMany',
    'replaceOne',
    'findOneAndUpdate',
    'findOneAndReplace',
    'findOneAndDelete',
    'deleteOne',
    'deleteMany',
    'bulkWrite',
    'save',
  ];

  const originalCollection = connection.collection.bind(connection);
  connection.collection = function (name: string) {
    const col = originalCollection(name);
    for (const method of forbiddenMethods) {
      const original = col[method];
      if (typeof original === 'function') {
        col[method] = function () {
          throw new Error(
            `[SAFETY GUARD] Write operation "${method}" is BLOCKED. ` +
              'This script is READ-ONLY.',
          );
        };
      }
    }
    return col;
  };

  console.log('✅ Write guards installed - all write operations are blocked');
}

// ============================================================================
// ARGUMENT PARSING
// ============================================================================

function parseArgs(): {
  providerIds: string[];
  fromDate: Date | null;
  toDate: Date | null;
  limit: number;
  minFrequency: number;
  output: string;
} {
  const result = {
    providerIds: [] as string[],
    fromDate: null as Date | null,
    toDate: null as Date | null,
    limit: 0, // 0 = no limit
    minFrequency: 1,
    output: './migration-output/diagnosis-export.csv',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--provider-ids' && args[i + 1]) {
      result.providerIds = args[++i].split(',').map((s) => s.trim());
    } else if (arg === '--from-date' && args[i + 1]) {
      const date = new Date(args[++i]);
      if (!isNaN(date.getTime())) {
        result.fromDate = date;
      }
    } else if (arg === '--to-date' && args[i + 1]) {
      const date = new Date(args[++i]);
      if (!isNaN(date.getTime())) {
        result.toDate = date;
      }
    } else if (arg === '--limit' && args[i + 1]) {
      result.limit = parseInt(args[++i], 10) || 0;
    } else if (arg === '--min-frequency' && args[i + 1]) {
      result.minFrequency = parseInt(args[++i], 10) || 1;
    } else if (arg === '--output' && args[i + 1]) {
      result.output = args[++i];
    }
  }

  return result;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required');
  process.exit(1);
}

// Collections with diagnosis fields
const DIAGNOSIS_COLLECTIONS = [
  {
    name: 'notamedicas',
    diagnosisField: 'diagnostico',
    dateField: 'fechaNotaMedica',
    trabajadorField: 'idTrabajador',
  },
  {
    name: 'audiometrias',
    diagnosisField: 'diagnosticoAudiometria',
    dateField: 'fechaAudiometria',
    trabajadorField: 'idTrabajador',
  },
  {
    name: 'examenvistas',
    diagnosisField: 'diagnosticoRecomendaciones',
    dateField: 'fechaExamenVista',
    trabajadorField: 'idTrabajador',
  },
];

// ============================================================================
// TYPES
// ============================================================================

interface DiagnosisEntry {
  diagnosisText: string;
  normalizedText: string;
  frequency: number;
  collections: string[];
  sampleDocIds: string[];
  firstSeen: Date | null;
  lastSeen: Date | null;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize diagnosis text for comparison and deduplication
 */
function normalizeDiagnosisText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:]+$/, '')
    .trim();
}

/**
 * Escape a CSV field (handle commas, quotes, newlines)
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

async function getTrabajadorIdsByProviders(
  db: mongoose.Connection,
  providerIds: string[],
): Promise<Set<string>> {
  const result = new Set<string>();

  // Get centros de trabajo
  const centrosCollection = db.collection('centrostrabajos');

  const query: any = {};
  if (providerIds.length > 0) {
    query.proveedorSalud = {
      $in: providerIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  const centros = await centrosCollection
    .find(query)
    .project({ _id: 1 })
    .toArray();

  const centroIds = centros.map((c) => c._id);

  // Get trabajadores
  const trabajadoresCollection = db.collection('trabajadors');
  const trabajadores = await trabajadoresCollection
    .find({ idCentroTrabajo: { $in: centroIds } })
    .project({ _id: 1 })
    .toArray();

  trabajadores.forEach((t) => result.add(t._id.toString()));

  return result;
}

async function getMXProviderIds(db: mongoose.Connection): Promise<string[]> {
  const proveedoresCollection = db.collection('proveedorsaluds');
  const providers = await proveedoresCollection
    .find({ pais: 'MX' })
    .project({ _id: 1 })
    .toArray();

  return providers.map((p) => p._id.toString());
}

async function collectDiagnoses(
  db: mongoose.Connection,
  options: ReturnType<typeof parseArgs>,
): Promise<Map<string, DiagnosisEntry>> {
  const diagnosisMap = new Map<string, DiagnosisEntry>();

  // Get provider IDs (filter to MX if not specified)
  let providerIds = options.providerIds;
  if (providerIds.length === 0) {
    console.log('No provider IDs specified - using all MX providers');
    providerIds = await getMXProviderIds(db);
  }

  console.log(`Filtering by ${providerIds.length} providers`);

  // Get trabajador IDs for these providers
  const trabajadorIds = await getTrabajadorIdsByProviders(db, providerIds);
  console.log(`Found ${trabajadorIds.size} trabajadores for these providers`);

  if (trabajadorIds.size === 0) {
    console.warn('No trabajadores found - check provider IDs');
    return diagnosisMap;
  }

  const trabajadorObjectIds = Array.from(trabajadorIds).map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  // Process each collection
  for (const collectionConfig of DIAGNOSIS_COLLECTIONS) {
    console.log(`Processing collection: ${collectionConfig.name}`);

    const collection = db.collection(collectionConfig.name);

    // Build query
    const query: any = {
      [collectionConfig.trabajadorField]: { $in: trabajadorObjectIds },
    };

    // Date range filter
    if (options.fromDate || options.toDate) {
      query[collectionConfig.dateField] = {};
      if (options.fromDate) {
        query[collectionConfig.dateField].$gte = options.fromDate;
      }
      if (options.toDate) {
        query[collectionConfig.dateField].$lte = options.toDate;
      }
    }

    // Only get documents with non-empty diagnosis field
    query[collectionConfig.diagnosisField] = {
      $exists: true,
      $nin: [null, ''],
    };

    const cursor = collection.find(query).project({
      _id: 1,
      [collectionConfig.diagnosisField]: 1,
      [collectionConfig.dateField]: 1,
    });

    let count = 0;
    for await (const doc of cursor) {
      const diagnosisText = doc[collectionConfig.diagnosisField] as string;
      if (!diagnosisText || diagnosisText.trim() === '') continue;

      const normalized = normalizeDiagnosisText(diagnosisText);
      if (!normalized) continue;

      const docDate = doc[collectionConfig.dateField] as Date;
      const docId = doc._id.toString();

      if (diagnosisMap.has(normalized)) {
        const entry = diagnosisMap.get(normalized)!;
        entry.frequency++;

        if (!entry.collections.includes(collectionConfig.name)) {
          entry.collections.push(collectionConfig.name);
        }

        // Keep up to 5 sample doc IDs
        if (entry.sampleDocIds.length < 5) {
          entry.sampleDocIds.push(docId);
        }

        // Track date range
        if (docDate) {
          if (!entry.firstSeen || docDate < entry.firstSeen) {
            entry.firstSeen = docDate;
          }
          if (!entry.lastSeen || docDate > entry.lastSeen) {
            entry.lastSeen = docDate;
          }
        }
      } else {
        diagnosisMap.set(normalized, {
          diagnosisText: diagnosisText.trim(),
          normalizedText: normalized,
          frequency: 1,
          collections: [collectionConfig.name],
          sampleDocIds: [docId],
          firstSeen: docDate || null,
          lastSeen: docDate || null,
        });
      }

      count++;
    }

    console.log(`  Processed ${count} documents`);
  }

  return diagnosisMap;
}

async function exportToCSV(
  diagnosisMap: Map<string, DiagnosisEntry>,
  options: ReturnType<typeof parseArgs>,
): Promise<void> {
  // Convert to array and sort by frequency
  let entries = Array.from(diagnosisMap.values())
    .filter((e) => e.frequency >= options.minFrequency)
    .sort((a, b) => b.frequency - a.frequency);

  // Apply limit
  if (options.limit > 0) {
    entries = entries.slice(0, options.limit);
  }

  console.log(
    `\nExporting ${entries.length} unique diagnoses (min frequency: ${options.minFrequency})`,
  );

  // Ensure output directory exists
  const outputDir = path.dirname(options.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create CSV content
  const headers = [
    'diagnosis_text',
    'normalized_text',
    'frequency',
    'collections',
    'sample_doc_ids',
    'first_seen',
    'last_seen',
    'cie10_code',
    'reviewed_by',
    'review_date',
    'notes',
  ];

  let csv = headers.join(',') + '\n';

  for (const entry of entries) {
    const row = [
      escapeCSV(entry.diagnosisText),
      escapeCSV(entry.normalizedText),
      entry.frequency,
      escapeCSV(entry.collections.join('; ')),
      escapeCSV(entry.sampleDocIds.join('; ')),
      entry.firstSeen ? entry.firstSeen.toISOString().split('T')[0] : '',
      entry.lastSeen ? entry.lastSeen.toISOString().split('T')[0] : '',
      '', // cie10_code - to be filled by medical reviewer
      '', // reviewed_by
      '', // review_date
      '', // notes
    ];
    csv += row.join(',') + '\n';
  }

  fs.writeFileSync(options.output, csv, 'utf8');
  console.log(`✅ CSV exported to: ${options.output}`);
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main(): Promise<void> {
  const options = parseArgs();

  const providerIdsDisplay =
    options.providerIds.length > 0
      ? options.providerIds.join(', ')
      : '(all MX providers)';
  const fromDateDisplay = options.fromDate?.toISOString() || '(no limit)';
  const toDateDisplay = options.toDate?.toISOString() || '(no limit)';
  const limitDisplay = options.limit > 0 ? options.limit : '(no limit)';

  console.log('\n' + '='.repeat(70));
  console.log('NOM-024 CIE-10 Diagnosis Export for Medical Review');
  console.log('='.repeat(70));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Database: ${MONGODB_URI?.replace(/\/\/.*@/, '//*****@')}`);
  console.log('Options:');
  console.log(`  Provider IDs: ${providerIdsDisplay}`);
  console.log(`  From Date: ${fromDateDisplay}`);
  console.log(`  To Date: ${toDateDisplay}`);
  console.log(`  Min Frequency: ${options.minFrequency}`);
  console.log(`  Limit: ${limitDisplay}`);
  console.log(`  Output: ${options.output}`);
  console.log('='.repeat(70) + '\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI!);
    const db = mongoose.connection;

    // Install write guards
    installWriteGuards(db);

    // Collect diagnoses
    const diagnosisMap = await collectDiagnoses(db, options);
    console.log(`\nTotal unique diagnoses found: ${diagnosisMap.size}`);

    // Export to CSV
    await exportToCSV(diagnosisMap, options);

    await mongoose.disconnect();

    console.log('\n' + '='.repeat(70));
    console.log('EXPORT COMPLETE (READ-ONLY)');
    console.log('No data has been modified.');
    console.log('='.repeat(70));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

main();
