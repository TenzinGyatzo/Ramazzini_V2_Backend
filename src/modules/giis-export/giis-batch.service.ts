import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { GiisBatch } from './schemas/giis-batch.schema';
import { Deteccion } from '../expedientes/schemas/deteccion.schema';
import { NotaMedica } from '../expedientes/schemas/nota-medica.schema';
import { Lesion } from '../expedientes/schemas/lesion.schema';
import { loadGiisSchema } from './schema-loader';
import { GiisSerializerService } from './giis-serializer.service';
import { mapDeteccionToCdtRow } from './transformers/cdt.mapper';
import { mapNotaMedicaToCexRow } from './transformers/cex.mapper';
import { mapLesionToLesRow } from './transformers/les.mapper';
import { RegulatoryPolicyService } from '../../utils/regulatory-policy.service';
import { ProveedoresSaludService } from '../proveedores-salud/proveedores-salud.service';
import { formatCLUES } from './formatters/field.formatter';
import { GiisValidationService } from './validation/giis-validation.service';
import type {
  GiisExcludedReport,
  GiisBatchOptions,
  GiisBatchStatus,
  GiisValidationStatus,
} from './schemas/giis-batch.schema';
import { GiisCryptoService } from './crypto/giis-crypto.service';
import { getOfficialBaseName, getOfficialFileName } from './naming/giis-official-naming';
import { GiisExportAuditService } from './giis-export-audit.service';

export type CreateBatchOptions = GiisBatchOptions;

export interface BatchListItem {
  batchId: string;
  yearMonth: string;
  status: GiisBatchStatus;
  completedAt?: Date;
  validationStatus?: GiisValidationStatus;
  establecimientoClues: string;
  errorMessage?: string;
  excludedReport?: { totalExcluded: number };
  artifacts: { guide: string }[];
}

interface LeanGiisBatchDoc {
  _id: Types.ObjectId;
  yearMonth: string;
  status: GiisBatchStatus;
  completedAt?: Date;
  validationStatus?: GiisValidationStatus;
  establecimientoClues?: string;
  errorMessage?: string;
  excludedReport?: { totalExcluded?: number };
  artifacts?: { guide: string }[];
}

const EXPORTS_BASE = 'exports/giis';

@Injectable()
export class GiisBatchService {
  constructor(
    @InjectModel(GiisBatch.name) private readonly giisBatchModel: Model<GiisBatch>,
    @InjectModel(Deteccion.name) private readonly deteccionModel: Model<Deteccion>,
    @InjectModel(NotaMedica.name) private readonly notaMedicaModel: Model<NotaMedica>,
    @InjectModel(Lesion.name) private readonly lesionModel: Model<Lesion>,
    private readonly serializer: GiisSerializerService,
    private readonly regulatoryPolicyService: RegulatoryPolicyService,
    private readonly proveedoresSaludService: ProveedoresSaludService,
    private readonly giisValidationService: GiisValidationService,
    private readonly giisCryptoService: GiisCryptoService,
    private readonly giisExportAuditService: GiisExportAuditService,
  ) {}

  async createBatch(
    proveedorSaludId: string,
    yearMonth: string,
    options?: CreateBatchOptions,
  ): Promise<GiisBatch> {
    const batch = await this.giisBatchModel.create({
      proveedorSaludId: new Types.ObjectId(proveedorSaludId),
      establecimientoClues: '',
      yearMonth,
      status: 'pending',
      artifacts: [],
      startedAt: new Date(),
      options: options ?? {},
    });
    return batch;
  }

  /**
   * Create batch for GIIS export with SIRES gate and CLUES resolution.
   * Only tenants with regime SIRES_NOM024 can create. establecimientoClues = proveedor.clues (valid 11 chars) or "9998" (modo privado SMP).
   */
  async createBatchForExport(
    proveedorSaludId: string,
    yearMonth: string,
    options?: CreateBatchOptions,
  ): Promise<GiisBatch> {
    const policy = await this.regulatoryPolicyService.getRegulatoryPolicy(
      proveedorSaludId,
    );
    if (policy.regime !== 'SIRES_NOM024') {
      throw new ForbiddenException(
        'La exportación GIIS solo está disponible para proveedores con régimen SIRES_NOM024.',
      );
    }

    const proveedor = await this.proveedoresSaludService.findOne(
      proveedorSaludId,
    );
    const cluesRaw = proveedor?.clues?.trim() ?? '';
    const establecimientoClues =
      formatCLUES(cluesRaw) || (cluesRaw.length === 11 ? cluesRaw.toUpperCase() : '') || '9998';

    const batch = await this.giisBatchModel.create({
      proveedorSaludId: new Types.ObjectId(proveedorSaludId),
      establecimientoClues,
      yearMonth,
      status: 'pending',
      artifacts: [],
      startedAt: new Date(),
      options: options ?? {},
    });
    return batch;
  }

  async getBatch(batchId: string): Promise<GiisBatch | null> {
    if (!Types.ObjectId.isValid(batchId)) {
      return null;
    }
    return this.giisBatchModel.findById(batchId).exec();
  }

  /**
   * List batches for a tenant (proveedor), one row per yearMonth (most recent batch only).
   * Ordered by yearMonth descending. Used by UI to show export history without duplicate months.
   */
  async listBatchesForProveedor(proveedorSaludId: string): Promise<BatchListItem[]> {
    const docs = await this.giisBatchModel
      .find({ proveedorSaludId: new Types.ObjectId(proveedorSaludId) })
      .sort({ yearMonth: -1, completedAt: -1, _id: -1 })
      .lean()
      .exec();

    const seen = new Set<string>();
    const items = docs
      .filter((d) => {
        if (seen.has(d.yearMonth)) return false;
        seen.add(d.yearMonth);
        return true;
      })
      .map((d) => ({
      batchId: String(d._id),
      yearMonth: d.yearMonth,
      status: d.status,
      completedAt: d.completedAt,
      validationStatus: d.validationStatus,
      establecimientoClues: d.establecimientoClues ?? '',
      errorMessage: d.errorMessage,
      excludedReport: d.excludedReport
        ? { totalExcluded: d.excludedReport.totalExcluded ?? 0 }
        : undefined,
      artifacts: (d.artifacts ?? []).map((a: { guide: string }) => ({ guide: a.guide })),
    }));

    return items;
  }

  /**
   * Generate CDT (B019) artifact for a batch and write TXT file.
   * Loads detecciones for batch month; maps with schema-driven CDT mapper; serializes and writes.
   */
  async generateBatchCdt(batchId: string): Promise<GiisBatch | null> {
    const batch = await this.getBatch(batchId);
    if (!batch || batch.status !== 'pending') return null;

    await this.giisBatchModel.updateOne(
      { _id: batch._id },
      { $set: { status: 'generating' } },
    );

    const [year, month] = batch.yearMonth.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const clues = batch.establecimientoClues || '9998';

    const detecciones = await this.deteccionModel
      .find({
        fechaDeteccion: { $gte: startOfMonth, $lte: endOfMonth },
      })
      .lean()
      .exec();

    const schema = loadGiisSchema('CDT');
    const rows: Record<string, string | number>[] = [];
    for (const doc of detecciones) {
      const row = mapDeteccionToCdtRow(doc as any, { clues }, null);
      rows.push(row);
    }

    const { validRows, excludedReport, warnings } =
      await this.giisValidationService.validateAndFilterRows('CDT', rows, schema);
    const validationStatus =
      excludedReport.totalExcluded > 0
        ? 'has_blockers'
        : warnings.length > 0
          ? 'has_warnings'
          : 'validated';

    const content = this.serializer.serialize(schema, validRows);
    const proveedorId = batch.proveedorSaludId.toString();
    const dir = path.join(process.cwd(), EXPORTS_BASE, proveedorId, batch.yearMonth);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'CDT.txt');
    fs.writeFileSync(filePath, content, 'utf-8');

    const relativePath = path.join(EXPORTS_BASE, proveedorId, batch.yearMonth, 'CDT.txt');
    const reportToSave: GiisExcludedReport = {
      entries: excludedReport.entries,
      totalExcluded: excludedReport.totalExcluded,
    };
    await this.giisBatchModel.updateOne(
      { _id: batch._id },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          validationStatus,
          excludedReport: reportToSave,
        },
        $push: {
          artifacts: {
            guide: 'CDT',
            path: relativePath,
            rowCount: validRows.length,
          },
        },
      },
    );
    return this.getBatch(batchId);
  }

  /**
   * Generate CEX (B015 Consulta externa) artifact for a batch and write TXT file.
   * Loads NotaMedica (consulta externa) for batch month; maps with schema-driven CEX mapper; serializes and writes.
   * Can be called after createBatch or after generateBatchCdt; appends artifact to batch.
   */
  async generateBatchCex(batchId: string): Promise<GiisBatch | null> {
    const batch = await this.getBatch(batchId);
    if (!batch) return null;
    if (batch.status === 'failed') return null;

    const [year, month] = batch.yearMonth.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const clues = batch.establecimientoClues || '9998';

    const notas = await this.notaMedicaModel
      .find({
        fechaNotaMedica: { $gte: startOfMonth, $lte: endOfMonth },
      })
      .populate('idTrabajador')
      .lean()
      .exec();

    const schema = loadGiisSchema('CEX');
    const rows: Record<string, string | number>[] = [];
    for (const doc of notas) {
      const nota = doc as any;
      const trabajador = nota.idTrabajador ? (nota.idTrabajador as any) : null;
      const row = mapNotaMedicaToCexRow(nota, { clues }, trabajador);
      rows.push(row);
    }

    const { validRows, excludedReport, warnings } =
      await this.giisValidationService.validateAndFilterRows('CEX', rows, schema);
    const currentBatch = await this.getBatch(batchId);
    const existingEntries = (currentBatch?.excludedReport as GiisExcludedReport)?.entries ?? [];
    const mergedEntries = [
      ...existingEntries,
      ...excludedReport.entries.map((e) => ({
        guide: e.guide,
        rowIndex: e.rowIndex,
        field: e.field,
        cause: e.cause,
      })),
    ];
    const mergedTotalExcluded = new Set(
      mergedEntries.map((e) => `${e.guide}:${e.rowIndex}`),
    ).size;
    const hadBlockers = (currentBatch?.validationStatus as string) === 'has_blockers';
    const validationStatus =
      mergedTotalExcluded > 0
        ? 'has_blockers'
        : hadBlockers
          ? 'has_blockers'
          : warnings.length > 0
            ? 'has_warnings'
            : currentBatch?.validationStatus ?? 'validated';

    const content = this.serializer.serialize(schema, validRows);
    const proveedorId = batch.proveedorSaludId.toString();
    const dir = path.join(process.cwd(), EXPORTS_BASE, proveedorId, batch.yearMonth);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'CEX.txt');
    fs.writeFileSync(filePath, content, 'utf-8');

    const relativePath = path.join(EXPORTS_BASE, proveedorId, batch.yearMonth, 'CEX.txt');
    await this.giisBatchModel.updateOne(
      { _id: batch._id },
      {
        $set: {
          excludedReport: {
            entries: mergedEntries,
            totalExcluded: mergedTotalExcluded,
          },
          validationStatus,
        },
        $push: {
          artifacts: {
            guide: 'CEX',
            path: relativePath,
            rowCount: validRows.length,
          },
        },
      },
    );
    return this.getBatch(batchId);
  }

  /**
   * Generate LES (B013 Lesiones) artifact for a batch and write TXT file.
   * Loads Lesion documents for batch month; maps with schema-driven LES mapper; serializes and writes.
   * Can be called after createBatch or after other artifacts; appends artifact to batch.
   */
  async generateBatchLes(batchId: string): Promise<GiisBatch | null> {
    const batch = await this.getBatch(batchId);
    if (!batch) return null;
    if (batch.status === 'failed') return null;

    const [year, month] = batch.yearMonth.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const clues = batch.establecimientoClues || '9998';

    const lesiones = await this.lesionModel
      .find({
        fechaAtencion: { $gte: startOfMonth, $lte: endOfMonth },
      })
      .populate('idTrabajador')
      .lean()
      .exec();

    const schema = loadGiisSchema('LES');
    const rows: Record<string, string | number>[] = [];
    for (const doc of lesiones) {
      const lesion = doc as any;
      const trabajador = lesion.idTrabajador ? (lesion.idTrabajador as any) : null;
      const row = mapLesionToLesRow(lesion, { clues }, trabajador);
      rows.push(row);
    }

    const { validRows, excludedReport, warnings } =
      await this.giisValidationService.validateAndFilterRows('LES', rows, schema);
    const currentBatch = await this.getBatch(batchId);
    const existingEntries = (currentBatch?.excludedReport as GiisExcludedReport)?.entries ?? [];
    const mergedEntries = [
      ...existingEntries,
      ...excludedReport.entries.map((e) => ({
        guide: e.guide,
        rowIndex: e.rowIndex,
        field: e.field,
        cause: e.cause,
      })),
    ];
    const mergedTotalExcluded = new Set(
      mergedEntries.map((e) => `${e.guide}:${e.rowIndex}`),
    ).size;
    const hadBlockers = (currentBatch?.validationStatus as string) === 'has_blockers';
    const validationStatus =
      mergedTotalExcluded > 0
        ? 'has_blockers'
        : hadBlockers
          ? 'has_blockers'
          : warnings.length > 0
            ? 'has_warnings'
            : currentBatch?.validationStatus ?? 'validated';

    const content = this.serializer.serialize(schema, validRows);
    const proveedorId = batch.proveedorSaludId.toString();
    const dir = path.join(process.cwd(), EXPORTS_BASE, proveedorId, batch.yearMonth);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'LES.txt');
    fs.writeFileSync(filePath, content, 'utf-8');

    const relativePath = path.join(EXPORTS_BASE, proveedorId, batch.yearMonth, 'LES.txt');
    await this.giisBatchModel.updateOne(
      { _id: batch._id },
      {
        $set: {
          excludedReport: {
            entries: mergedEntries,
            totalExcluded: mergedTotalExcluded,
          },
          validationStatus,
        },
        $push: {
          artifacts: {
            guide: 'LES',
            path: relativePath,
            rowCount: validRows.length,
          },
        },
      },
    );

    const completedBatch = await this.getBatch(batchId);
    if (completedBatch?.status === 'completed') {
      await this.recordBatchCompletionAudit(completedBatch);
    }
    return completedBatch;
  }

  private async recordBatchCompletionAudit(batch: GiisBatch) {
    const [year, month] = batch.yearMonth.split('-').map(Number);
    const clues = batch.establecimientoClues || '9998';
    const totalRows = (batch.artifacts ?? []).reduce(
      (s, a) => s + (Number(a.rowCount) || 0),
      0,
    );
    const totalExcluded = (batch.excludedReport as GiisExcludedReport)?.totalExcluded ?? 0;
    const resumen = `${totalRows} procesados, ${totalExcluded} excluidos`;
    const userId = (batch.options as { createdByUserId?: string })?.createdByUserId;

    for (const art of batch.artifacts ?? []) {
      const guide = art.guide as 'CDT' | 'CEX' | 'LES';
      const baseName = getOfficialBaseName(guide, clues, year, month);
      await this.giisExportAuditService.recordGenerationAudit({
        usuarioGeneradorId: userId,
        periodo: batch.yearMonth,
        establecimientoClues: clues,
        tipoGuia: guide,
        nombreArchivoOficial: getOfficialFileName(baseName, 'TXT'),
        resumenValidacion: resumen,
        batchId: batch._id.toString(),
      });
    }
  }

  /**
   * Phase 2B: Build deliverable (TXT → CIF → ZIP) for each artifact. Only when validationStatus is not has_blockers.
   * Key from env GIIS_3DES_KEY_BASE64 (24 bytes, base64). Caller must ensure GIIS_ENCRYPTION_VALIDATED=true.
   */
  async buildDeliverable(
    batchId: string,
    confirmWarnings?: boolean,
    usuarioGeneradorId?: string,
  ): Promise<GiisBatch | null> {
    const batch = await this.getBatch(batchId);
    if (!batch || batch.status === 'failed') return null;

    const status = batch.validationStatus as string | undefined;
    if (status === 'has_blockers') {
      throw new ConflictException(
        'El batch tiene errores bloqueantes de validación; no se puede generar entregable.',
      );
    }
    if (status === 'has_warnings' && !confirmWarnings) {
      throw new ConflictException(
        'El batch tiene advertencias; confirme para continuar con la generación del entregable.',
      );
    }

    const keyBase64 = process.env.GIIS_3DES_KEY_BASE64;
    if (!keyBase64) {
      throw new ConflictException(
        'Clave 3DES no configurada (GIIS_3DES_KEY_BASE64). Ver docs/nom-024/giis_encryption_spec.md.',
      );
    }
    let key: Buffer;
    try {
      key = Buffer.from(keyBase64, 'base64');
    } catch {
      throw new ConflictException('GIIS_3DES_KEY_BASE64 no es base64 válido.');
    }
    if (key.length !== 24) {
      throw new ConflictException(
        `La clave 3DES debe ser 24 bytes (base64), se recibieron ${key.length} bytes.`,
      );
    }

    const [year, month] = batch.yearMonth.split('-').map(Number);
    const clues = batch.establecimientoClues || '9998';
    const proveedorId = batch.proveedorSaludId.toString();
    const dir = path.join(process.cwd(), EXPORTS_BASE, proveedorId, batch.yearMonth);
    const artifacts = Array.isArray(batch.artifacts) ? batch.artifacts : [];
    const updatedArtifacts = [];

    for (const art of artifacts) {
      const guide = art.guide as string;
      const relPath = art.path as string;
      const fullPath = path.join(process.cwd(), relPath);
      if (!fs.existsSync(fullPath)) {
        updatedArtifacts.push({ ...art });
        continue;
      }
      const baseName = getOfficialBaseName(
        guide as 'CDT' | 'CEX' | 'LES',
        clues,
        year,
        month,
      );
      const txtContent = fs.readFileSync(fullPath, 'latin1');
      const plainBuffer = Buffer.from(txtContent, 'latin1');
      const cifBuffer = this.giisCryptoService.encryptToCif(plainBuffer, key);
      const cifPath = path.join(dir, getOfficialFileName(baseName, 'CIF'));
      fs.writeFileSync(cifPath, cifBuffer);

      const zipBuffer = await this.giisCryptoService.createZipWithCif(cifBuffer, baseName);
      const zipFileName = getOfficialFileName(baseName, 'ZIP');
      const zipPathFull = path.join(dir, zipFileName);
      fs.writeFileSync(zipPathFull, zipBuffer);
      const relativeZipPath = path.join(EXPORTS_BASE, proveedorId, batch.yearMonth, zipFileName);
      const hashSha256 = this.giisCryptoService.sha256Hex(zipBuffer);

      updatedArtifacts.push({
        guide: art.guide,
        path: art.path,
        rowCount: art.rowCount,
        zipPath: relativeZipPath,
        hashSha256,
      });
    }

    await this.giisBatchModel.updateOne(
      { _id: batch._id },
      { $set: { artifacts: updatedArtifacts } },
    );

    const updatedBatch = await this.getBatch(batchId);
    const cluesAudit = batch.establecimientoClues || '9998';
    for (const art of updatedArtifacts) {
      if (art.zipPath && art.hashSha256) {
        await this.giisExportAuditService.recordGenerationAudit({
          usuarioGeneradorId,
          periodo: batch.yearMonth,
          establecimientoClues: cluesAudit,
          tipoGuia: art.guide as 'CDT' | 'CEX' | 'LES',
          nombreArchivoOficial: path.basename(art.zipPath),
          hashSha256Archivo: art.hashSha256,
          resumenValidacion: `Entregable ZIP generado`,
          batchId: batch._id.toString(),
        });
      }
    }
    return updatedBatch;
  }
}
