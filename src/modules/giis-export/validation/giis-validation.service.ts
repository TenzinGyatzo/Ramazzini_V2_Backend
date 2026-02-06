/**
 * GIIS Phase 2A: Pre-validation (report only) and validate-and-filter (skip row + excluded report).
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deteccion } from '../../expedientes/schemas/deteccion.schema';
import { NotaMedica } from '../../expedientes/schemas/nota-medica.schema';
import { Lesion } from '../../expedientes/schemas/lesion.schema';
import { loadGiisSchema } from '../schema-loader';
import { mapDeteccionToCdtRow } from '../transformers/cdt.mapper';
import { mapNotaMedicaToCexRow } from '../transformers/cex.mapper';
import { mapLesionToLesRow } from '../transformers/les.mapper';
import { CatalogsService } from '../../catalogs/catalogs.service';
import {
  ValidationError,
  PreValidationResult,
  ValidateAndFilterResult,
  ExcludedRowEntry,
  ExcludedRowReport,
} from './validation.types';
import {
  validateRowAgainstSchema,
  CatalogLookup,
} from './schema-based-validator';
import { GiisSchema } from '../schema-loader';
import { ProveedoresSaludService } from '../../proveedores-salud/proveedores-salud.service';
import { formatCLUES } from '../formatters/field.formatter';

type Guide = 'CDT' | 'CEX' | 'LES';

@Injectable()
export class GiisValidationService {
  constructor(
    @InjectModel(Deteccion.name) private readonly deteccionModel: Model<Deteccion>,
    @InjectModel(NotaMedica.name) private readonly notaMedicaModel: Model<NotaMedica>,
    @InjectModel(Lesion.name) private readonly lesionModel: Model<Lesion>,
    private readonly catalogsService: CatalogsService,
    private readonly proveedoresSaludService: ProveedoresSaludService,
  ) {}

  private buildCatalogLookup(): CatalogLookup {
    return {
      validatePais: async (code: string) => {
        const r = this.catalogsService.validateGIISPais(code);
        return r.valid;
      },
      validateEntidadFederativa: (code: string) =>
        this.catalogsService.validateINEGI('estado', code),
      validateClues: async (clues: string) => {
        const ok = await this.catalogsService.validateCLUES(clues);
        if (!ok) return false;
        return this.catalogsService.validateCLUESInOperation(clues);
      },
      validateTipoPersonal: (code: string) =>
        Promise.resolve(this.catalogsService.validateGIISTipoPersonal(code).valid),
      validateAfiliacion: (code: string) =>
        Promise.resolve(this.catalogsService.validateGIISAfiliacion(code).valid),
    };
  }

  /**
   * Pre-validate period: no TXT written, returns aggregated errors/warnings for grid.
   */
  async preValidate(
    proveedorSaludId: string,
    yearMonth: string,
    guides: Guide[],
    establecimientoClues?: string,
  ): Promise<PreValidationResult> {
    let clues = establecimientoClues?.trim();
    if (clues === undefined || clues === '') {
      const proveedor = await this.proveedoresSaludService.findOne(proveedorSaludId);
      const raw = proveedor?.clues?.trim() ?? '';
      clues = formatCLUES(raw) || (raw.length === 11 ? raw.toUpperCase() : '') || '9998';
    }

    const [year, month] = yearMonth.split('-').map(Number);
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const catalogLookup = this.buildCatalogLookup();
    const allErrors: ValidationError[] = [];
    let totalRows = 0;

    if (guides.includes('CDT')) {
      const detecciones = await this.deteccionModel
        .find({
          fechaDeteccion: { $gte: startOfMonth, $lte: endOfMonth },
        })
        .lean()
        .exec();
      const schema = loadGiisSchema('CDT');
      const rows = detecciones.map((doc: any) =>
        mapDeteccionToCdtRow(doc, { clues }, null),
      );
      totalRows += rows.length;
      for (let i = 0; i < rows.length; i++) {
        const errs = await validateRowAgainstSchema(
          'CDT',
          schema,
          rows[i],
          i,
          catalogLookup,
        );
        allErrors.push(...errs);
      }
    }

    if (guides.includes('CEX')) {
      const notas = await this.notaMedicaModel
        .find({
          fechaNotaMedica: { $gte: startOfMonth, $lte: endOfMonth },
        })
        .populate('idTrabajador')
        .lean()
        .exec();
      const schema = loadGiisSchema('CEX');
      const rows = (notas as any[]).map((nota) => {
        const trabajador = nota.idTrabajador || null;
        return mapNotaMedicaToCexRow(nota, { clues }, trabajador);
      });
      totalRows += rows.length;
      for (let i = 0; i < rows.length; i++) {
        const errs = await validateRowAgainstSchema(
          'CEX',
          schema,
          rows[i],
          i,
          catalogLookup,
        );
        allErrors.push(...errs);
      }
    }

    if (guides.includes('LES')) {
      const lesiones = await this.lesionModel
        .find({
          fechaAtencion: { $gte: startOfMonth, $lte: endOfMonth },
        })
        .populate('idTrabajador')
        .lean()
        .exec();
      const schema = loadGiisSchema('LES');
      const rows = (lesiones as any[]).map((lesion) => {
        const trabajador = lesion.idTrabajador || null;
        return mapLesionToLesRow(lesion, { clues }, trabajador);
      });
      totalRows += rows.length;
      for (let i = 0; i < rows.length; i++) {
        const errs = await validateRowAgainstSchema(
          'LES',
          schema,
          rows[i],
          i,
          catalogLookup,
        );
        allErrors.push(...errs);
      }
    }

    return {
      errors: allErrors,
      totalRows,
    };
  }

  /**
   * Validate rows and filter: exclude rows with any blocker; accumulate excluded report and warnings.
   */
  async validateAndFilterRows(
    guide: Guide,
    rows: Record<string, string | number>[],
    schema: GiisSchema,
    catalogLookup?: CatalogLookup,
  ): Promise<ValidateAndFilterResult> {
    const validRows: Record<string, string | number>[] = [];
    const excludedEntries: ExcludedRowEntry[] = [];
    const warnings: ValidationError[] = [];
    const lookup = catalogLookup ?? this.buildCatalogLookup();

    for (let i = 0; i < rows.length; i++) {
      const errs = await validateRowAgainstSchema(
        guide,
        schema,
        rows[i],
        i,
        lookup,
      );
      const blockers = errs.filter((e) => e.severity === 'blocker');
      const warns = errs.filter((e) => e.severity === 'warning');

      if (blockers.length > 0) {
        for (const e of blockers) {
          excludedEntries.push({
            guide,
            rowIndex: i,
            field: e.field,
            cause: e.cause,
          });
        }
      } else {
        validRows.push(rows[i]);
        for (const w of warns) {
          warnings.push(w);
        }
      }
    }

    const excludedRowsSet = new Set(excludedEntries.map((e) => `${e.guide}:${e.rowIndex}`));
    const excludedReport: ExcludedRowReport = {
      entries: excludedEntries,
      totalExcluded: excludedRowsSet.size,
    };

    return {
      validRows,
      excludedReport,
      warnings,
    };
  }
}
