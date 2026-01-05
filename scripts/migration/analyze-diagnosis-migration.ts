/**
 * NOM-024 CIE-10 Diagnosis Migration Analysis Script
 *
 * SAFETY: This script is READ-ONLY. It does NOT modify any data.
 *
 * Purpose:
 * - Identify MX providers (proveedorSalud.pais === 'MX')
 * - Scan collections with free-text diagnosis fields
 * - Produce counts and frequency analysis
 * - Output JSON and human-readable summary
 *
 * Usage:
 *   npx ts-node scripts/migration/analyze-diagnosis-migration.ts --confirm-readonly
 *
 * Environment Variables:
 *   MONGODB_URI - MongoDB connection string (required)
 *   OUTPUT_DIR  - Output directory for reports (default: ./migration-output)
 *
 * @author NOM-024 Compliance Team
 * @version 1.0.0
 */

import mongoose, { Model } from 'mongoose';
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
║    npx ts-node scripts/migration/analyze-diagnosis-migration.ts \\ ║
║      ${READONLY_FLAG}                                            ║
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
              'This script is READ-ONLY.'
          );
        };
      }
    }
    return col;
  };

  console.log('✅ Write guards installed - all write operations are blocked');
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI;
const OUTPUT_DIR = process.env.OUTPUT_DIR || './migration-output';
const TOP_N_FREQUENT = 50; // Top N most frequent diagnosis values

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required');
  process.exit(1);
}

// Collections with diagnosis fields
const DIAGNOSIS_COLLECTIONS = [
  {
    name: 'notamedicas',
    diagnosisField: 'diagnostico',
    cie10Field: 'codigoCIE10Principal',
    cie10SecondaryField: 'codigosCIE10Complementarios',
    dateField: 'fechaNotaMedica',
    trabajadorField: 'idTrabajador',
  },
  {
    name: 'audiometrias',
    diagnosisField: 'diagnosticoAudiometria',
    cie10Field: null, // No CIE-10 field
    cie10SecondaryField: null,
    dateField: 'fechaAudiometria',
    trabajadorField: 'idTrabajador',
  },
  {
    name: 'examenvistas',
    diagnosisField: 'diagnosticoRecomendaciones',
    cie10Field: null, // No CIE-10 field
    cie10SecondaryField: null,
    dateField: 'fechaExamenVista',
    trabajadorField: 'idTrabajador',
  },
];

// ============================================================================
// TYPES
// ============================================================================

interface ProviderStats {
  providerId: string;
  providerName: string;
  country: string;
  collections: {
    [collectionName: string]: {
      totalDocs: number;
      docsWithFreeTextOnly: number;
      docsWithCIE10: number;
      docsWithBoth: number;
      docsWithNoDiagnosis: number;
    };
  };
  topDiagnoses: Array<{
    text: string;
    count: number;
    collection: string;
  }>;
}

interface AnalysisResult {
  timestamp: string;
  databaseUri: string;
  totalProviders: number;
  mxProviders: number;
  nonMxProviders: number;
  providerStats: ProviderStats[];
  globalTopDiagnoses: Array<{
    text: string;
    normalizedText: string;
    count: number;
    collections: string[];
  }>;
  summary: {
    totalDocumentsScanned: number;
    totalFreeTextDiagnoses: number;
    totalWithCIE10: number;
    totalMigrationCandidates: number;
  };
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
    .replace(/[.,;:]+$/, '') // Remove trailing punctuation
    .trim();
}

/**
 * Check if a diagnosis looks like it might already be a CIE-10 code
 */
function looksLikeCIE10(text: string): boolean {
  if (!text) return false;
  const normalized = text.trim().toUpperCase();
  // CIE-10 pattern: Letter + 2-3 digits + optional decimal
  return /^[A-Z]\d{2}(\.\d{1,2})?$/.test(normalized);
}

// ============================================================================
// MAIN ANALYSIS FUNCTIONS
// ============================================================================

async function getMXProviders(db: mongoose.Connection): Promise<any[]> {
  const proveedoresCollection = db.collection('proveedorsaluds');
  const providers = await proveedoresCollection
    .find({ pais: 'MX' })
    .project({ _id: 1, razonSocial: 1, pais: 1 })
    .toArray();

  console.log(`Found ${providers.length} MX providers`);
  return providers;
}

async function getAllProviders(db: mongoose.Connection): Promise<any[]> {
  const proveedoresCollection = db.collection('proveedorsaluds');
  const providers = await proveedoresCollection
    .find({})
    .project({ _id: 1, razonSocial: 1, pais: 1 })
    .toArray();

  console.log(`Found ${providers.length} total providers`);
  return providers;
}

async function getTrabajadoresByProvider(
  db: mongoose.Connection,
  providerId: string
): Promise<string[]> {
  // Get centros de trabajo for this provider
  const centrosCollection = db.collection('centrostrabajos');
  const centros = await centrosCollection
    .find({ proveedorSalud: new mongoose.Types.ObjectId(providerId) })
    .project({ _id: 1 })
    .toArray();

  const centroIds = centros.map((c) => c._id);

  // Get trabajadores for these centros
  const trabajadoresCollection = db.collection('trabajadors');
  const trabajadores = await trabajadoresCollection
    .find({ idCentroTrabajo: { $in: centroIds } })
    .project({ _id: 1 })
    .toArray();

  return trabajadores.map((t) => t._id.toString());
}

async function analyzeCollection(
  db: mongoose.Connection,
  collectionConfig: (typeof DIAGNOSIS_COLLECTIONS)[0],
  trabajadorIds: string[]
): Promise<{
  totalDocs: number;
  docsWithFreeTextOnly: number;
  docsWithCIE10: number;
  docsWithBoth: number;
  docsWithNoDiagnosis: number;
  diagnosisFrequency: Map<string, number>;
}> {
  const collection = db.collection(collectionConfig.name);
  const { diagnosisField, cie10Field } = collectionConfig;

  const diagnosisFrequency = new Map<string, number>();

  // Build query for this provider's trabajadores
  const trabajadorObjectIds = trabajadorIds.map(
    (id) => new mongoose.Types.ObjectId(id)
  );
  const query = {
    [collectionConfig.trabajadorField]: { $in: trabajadorObjectIds },
  };

  const docs = await collection.find(query).toArray();
  const totalDocs = docs.length;

  let docsWithFreeTextOnly = 0;
  let docsWithCIE10 = 0;
  let docsWithBoth = 0;
  let docsWithNoDiagnosis = 0;

  for (const doc of docs) {
    const freeText = doc[diagnosisField];
    const cie10 = cie10Field ? doc[cie10Field] : null;

    const hasFreeText = freeText && typeof freeText === 'string' && freeText.trim() !== '';
    const hasCIE10 = cie10 && typeof cie10 === 'string' && cie10.trim() !== '';

    if (hasFreeText && hasCIE10) {
      docsWithBoth++;
    } else if (hasFreeText && !hasCIE10) {
      docsWithFreeTextOnly++;
    } else if (!hasFreeText && hasCIE10) {
      docsWithCIE10++;
    } else {
      docsWithNoDiagnosis++;
    }

    // Track diagnosis frequency
    if (hasFreeText) {
      const normalized = normalizeDiagnosisText(freeText);
      if (normalized) {
        diagnosisFrequency.set(
          normalized,
          (diagnosisFrequency.get(normalized) || 0) + 1
        );
      }
    }
  }

  return {
    totalDocs,
    docsWithFreeTextOnly,
    docsWithCIE10,
    docsWithBoth,
    docsWithNoDiagnosis,
    diagnosisFrequency,
  };
}

async function runAnalysis(): Promise<AnalysisResult> {
  console.log('\n' + '='.repeat(70));
  console.log('NOM-024 CIE-10 Diagnosis Migration Analysis');
  console.log('='.repeat(70));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Database: ${MONGODB_URI?.replace(/\/\/.*@/, '//*****@')}`);
  console.log('='.repeat(70) + '\n');

  // Connect to MongoDB
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection;

  // Install write guards
  installWriteGuards(db);

  // Get all providers
  const allProviders = await getAllProviders(db);
  const mxProviders = allProviders.filter((p) => p.pais === 'MX');
  const nonMxProviders = allProviders.filter((p) => p.pais !== 'MX');

  console.log(`\nProvider Summary:`);
  console.log(`  Total: ${allProviders.length}`);
  console.log(`  MX: ${mxProviders.length}`);
  console.log(`  Non-MX: ${nonMxProviders.length}`);

  const providerStats: ProviderStats[] = [];
  const globalDiagnosisFrequency = new Map<
    string,
    { count: number; collections: Set<string> }
  >();

  let totalDocumentsScanned = 0;
  let totalFreeTextDiagnoses = 0;
  let totalWithCIE10 = 0;

  // Focus on MX providers for NOM-024 compliance
  console.log(`\nAnalyzing ${mxProviders.length} MX providers...`);

  for (let i = 0; i < mxProviders.length; i++) {
    const provider = mxProviders[i];
    console.log(
      `  [${i + 1}/${mxProviders.length}] Analyzing: ${provider.razonSocial || provider._id}`
    );

    // Get trabajadores for this provider
    const trabajadorIds = await getTrabajadoresByProvider(
      db,
      provider._id.toString()
    );

    if (trabajadorIds.length === 0) {
      continue;
    }

    const stats: ProviderStats = {
      providerId: provider._id.toString(),
      providerName: provider.razonSocial || 'Unknown',
      country: provider.pais || 'Unknown',
      collections: {},
      topDiagnoses: [],
    };

    const providerDiagnosisFrequency = new Map<string, number>();

    for (const collectionConfig of DIAGNOSIS_COLLECTIONS) {
      const analysis = await analyzeCollection(
        db,
        collectionConfig,
        trabajadorIds
      );

      stats.collections[collectionConfig.name] = {
        totalDocs: analysis.totalDocs,
        docsWithFreeTextOnly: analysis.docsWithFreeTextOnly,
        docsWithCIE10: analysis.docsWithCIE10,
        docsWithBoth: analysis.docsWithBoth,
        docsWithNoDiagnosis: analysis.docsWithNoDiagnosis,
      };

      totalDocumentsScanned += analysis.totalDocs;
      totalFreeTextDiagnoses += analysis.docsWithFreeTextOnly + analysis.docsWithBoth;
      totalWithCIE10 += analysis.docsWithCIE10 + analysis.docsWithBoth;

      // Merge frequency data
      for (const [text, count] of analysis.diagnosisFrequency) {
        providerDiagnosisFrequency.set(
          text,
          (providerDiagnosisFrequency.get(text) || 0) + count
        );

        // Global frequency
        if (!globalDiagnosisFrequency.has(text)) {
          globalDiagnosisFrequency.set(text, {
            count: 0,
            collections: new Set(),
          });
        }
        const global = globalDiagnosisFrequency.get(text)!;
        global.count += count;
        global.collections.add(collectionConfig.name);
      }
    }

    // Get top diagnoses for this provider
    const sortedDiagnoses = Array.from(providerDiagnosisFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    stats.topDiagnoses = sortedDiagnoses.map(([text, count]) => ({
      text,
      count,
      collection: '', // Could be multiple
    }));

    providerStats.push(stats);
  }

  // Get global top diagnoses
  const globalTopDiagnoses = Array.from(globalDiagnosisFrequency.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, TOP_N_FREQUENT)
    .map(([text, data]) => ({
      text,
      normalizedText: text,
      count: data.count,
      collections: Array.from(data.collections),
    }));

  // Calculate migration candidates (MX docs with free-text but no CIE-10)
  const totalMigrationCandidates = providerStats.reduce((sum, ps) => {
    return (
      sum +
      Object.values(ps.collections).reduce(
        (colSum, col) => colSum + col.docsWithFreeTextOnly,
        0
      )
    );
  }, 0);

  await mongoose.disconnect();

  return {
    timestamp: new Date().toISOString(),
    databaseUri: MONGODB_URI!.replace(/\/\/.*@/, '//*****@'),
    totalProviders: allProviders.length,
    mxProviders: mxProviders.length,
    nonMxProviders: nonMxProviders.length,
    providerStats,
    globalTopDiagnoses,
    summary: {
      totalDocumentsScanned,
      totalFreeTextDiagnoses,
      totalWithCIE10,
      totalMigrationCandidates,
    },
  };
}

function printSummary(result: AnalysisResult): void {
  console.log('\n' + '='.repeat(70));
  console.log('ANALYSIS SUMMARY');
  console.log('='.repeat(70));

  console.log(`
Provider Statistics:
  Total Providers: ${result.totalProviders}
  MX Providers (NOM-024 scope): ${result.mxProviders}
  Non-MX Providers: ${result.nonMxProviders}

Document Statistics (MX Providers Only):
  Total Documents Scanned: ${result.summary.totalDocumentsScanned}
  Documents with Free-Text Diagnosis: ${result.summary.totalFreeTextDiagnoses}
  Documents with CIE-10 Codes: ${result.summary.totalWithCIE10}
  
Migration Analysis:
  Documents needing CIE-10 mapping: ${result.summary.totalMigrationCandidates}
  (These are MX provider documents with free-text but no CIE-10 code)
`);

  console.log('Top 20 Most Frequent Diagnoses (for mapping priority):');
  console.log('-'.repeat(70));
  result.globalTopDiagnoses.slice(0, 20).forEach((d, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. [${d.count}x] ${d.text.substring(0, 60)}`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('IMPORTANT: This analysis is READ-ONLY.');
  console.log('No data has been modified.');
  console.log('='.repeat(70));
}

async function saveResults(result: AnalysisResult): Promise<void> {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Save JSON report
  const jsonPath = path.join(OUTPUT_DIR, `diagnosis-analysis-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log(`\n✅ JSON report saved: ${jsonPath}`);

  // Save human-readable summary
  const summaryPath = path.join(OUTPUT_DIR, `diagnosis-summary-${timestamp}.txt`);
  let summary = `NOM-024 CIE-10 Diagnosis Migration Analysis
Generated: ${result.timestamp}
${'='.repeat(70)}

PROVIDER STATISTICS
-------------------
Total Providers: ${result.totalProviders}
MX Providers (NOM-024 scope): ${result.mxProviders}
Non-MX Providers: ${result.nonMxProviders}

DOCUMENT STATISTICS (MX Providers Only)
---------------------------------------
Total Documents Scanned: ${result.summary.totalDocumentsScanned}
Documents with Free-Text Diagnosis: ${result.summary.totalFreeTextDiagnoses}
Documents with CIE-10 Codes: ${result.summary.totalWithCIE10}
Documents needing CIE-10 mapping: ${result.summary.totalMigrationCandidates}

TOP ${TOP_N_FREQUENT} MOST FREQUENT DIAGNOSES
${'='.repeat(70)}
`;

  result.globalTopDiagnoses.forEach((d, i) => {
    summary += `${(i + 1).toString().padStart(3)}. [${d.count.toString().padStart(5)}x] ${d.text}\n`;
    summary += `      Collections: ${d.collections.join(', ')}\n`;
  });

  summary += `
${'='.repeat(70)}
PROVIDER DETAILS
${'='.repeat(70)}
`;

  for (const ps of result.providerStats) {
    summary += `
Provider: ${ps.providerName} (${ps.providerId})
Country: ${ps.country}
`;
    for (const [colName, stats] of Object.entries(ps.collections)) {
      if (stats.totalDocs > 0) {
        summary += `  ${colName}:
    Total: ${stats.totalDocs}
    Free-text only: ${stats.docsWithFreeTextOnly}
    CIE-10 present: ${stats.docsWithCIE10}
    Both: ${stats.docsWithBoth}
    No diagnosis: ${stats.docsWithNoDiagnosis}
`;
      }
    }
  }

  fs.writeFileSync(summaryPath, summary);
  console.log(`✅ Summary report saved: ${summaryPath}`);
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main(): Promise<void> {
  try {
    const result = await runAnalysis();
    printSummary(result);
    await saveResults(result);

    console.log('\n✅ Analysis completed successfully (READ-ONLY)');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  }
}

main();

