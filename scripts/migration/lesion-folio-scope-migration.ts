/**
 * Migración: Folio Scope para Lesiones (GIIS-B013)
 *
 * Requisitos: folio único por CLUES + fechaAtencion.
 * - Añade folioScopeId a lesiones existentes (CLUES o idProveedorSalud como fallback)
 * - Elimina índice obsoleto clues_1_fechaAtencion_1_folio_1
 * - Elimina índice idProveedorSalud_1_fechaAtencion_1_folio_1 (reemplazado por folioScopeId)
 *
 * Ejecutar ANTES de desplegar el código nuevo.
 *
 * Uso:
 *   MONGODB_URI="mongodb://..." npx ts-node -r tsconfig-paths/register scripts/migration/lesion-folio-scope-migration.ts --confirm-write
 *
 * @requires MONGODB_URI
 */

import mongoose from 'mongoose';

const CONFIRM_FLAG = '--confirm-write';
const args = process.argv.slice(2);

if (!args.includes(CONFIRM_FLAG)) {
  console.error(`
╔══════════════════════════════════════════════════════════════════╗
║  MIGRACIÓN: Lesion Folio Scope                                    ║
║                                                                  ║
║  Este script MODIFICA datos. Requiere el flag ${CONFIRM_FLAG}.    ║
║                                                                  ║
║  Uso:                                                            ║
║    MONGODB_URI="..." npx ts-node -r tsconfig-paths/register \\   ║
║      scripts/migration/lesion-folio-scope-migration.ts ${CONFIRM_FLAG}  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI es requerido.');
  process.exit(1);
}

async function run() {
  console.log('Conectando a MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database connection');

  const lesionsCol = db.collection('lesions');
  const proveedoresCol = db.collection('proveedorsaluds');

  console.log('\n1. Listando índices actuales...');
  const indexes = await lesionsCol.indexes();
  for (const idx of indexes) {
    console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
  }

  console.log('\n2. Eliminando índices obsoletos...');
  const toDrop = ['clues_1_fechaAtencion_1_folio_1', 'idProveedorSalud_1_fechaAtencion_1_folio_1'];
  for (const name of toDrop) {
    try {
      await lesionsCol.dropIndex(name);
      console.log(`   Eliminado: ${name}`);
    } catch (e: any) {
      if (e.code === 27 || e.codeName === 'IndexNotFound') {
        console.log(`   (no existe) ${name}`);
      } else {
        throw e;
      }
    }
  }

  console.log('\n3. Obteniendo CLUES por ProveedorSalud...');
  const proveedores = await proveedoresCol.find({}).project({ _id: 1, clues: 1 }).toArray();
  const cluesByProveedor = new Map<string, string | null>();
  for (const p of proveedores) {
    const id = (p._id as mongoose.Types.ObjectId).toString();
    const clues = (p as any).clues?.trim?.() || null;
    cluesByProveedor.set(id, clues);
  }
  console.log(`   ${proveedores.length} proveedores de salud cargados`);

  console.log('\n4. Actualizando lesiones sin folioScopeId...');
  const lesions = await lesionsCol.find({ $or: [{ folioScopeId: { $exists: false } }, { folioScopeId: null }, { folioScopeId: '' }] }).toArray();
  console.log(`   ${lesions.length} lesiones a actualizar`);

  let updated = 0;
  for (const lesion of lesions) {
    const psId = (lesion.idProveedorSalud as mongoose.Types.ObjectId)?.toString?.();
    if (!psId) {
      console.warn(`   Lesión ${lesion._id}: sin idProveedorSalud, omitida`);
      continue;
    }
    const clues = cluesByProveedor.get(psId) ?? null;
    const folioScopeId = clues ?? psId;

    await lesionsCol.updateOne(
      { _id: lesion._id },
      { $set: { folioScopeId } },
    );
    updated++;
    if (updated % 100 === 0) console.log(`   Actualizadas ${updated}/${lesions.length}...`);
  }

  console.log(`\n   Total actualizadas: ${updated}`);

  console.log('\n5. Creando nuevo índice folioScopeId + fechaAtencion + folio...');
  try {
    await lesionsCol.createIndex(
      { folioScopeId: 1, fechaAtencion: 1, folio: 1 },
      { unique: true },
    );
    console.log('   Índice creado correctamente.');
  } catch (e: any) {
    if (e.code === 11000 || e.codeName === 'DuplicateKey') {
      console.error('   ERROR: Hay duplicados (folioScopeId, fechaAtencion, folio). Revisar datos antes de crear el índice.');
      throw e;
    }
    throw e;
  }

  console.log('\nMigración completada.');
}

run()
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(() => {
    mongoose.disconnect().then(() => process.exit(0));
  });
