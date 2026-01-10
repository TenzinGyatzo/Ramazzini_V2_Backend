import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesion } from '../expedientes/schemas/lesion.schema';
import { Deteccion } from '../expedientes/schemas/deteccion.schema';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../empresas/schemas/empresa.schema';
import {
  transformLesionToGIIS,
  getGIISB013FieldCount,
} from './transformers/lesion.transformer';
import {
  transformDeteccionToGIIS,
  getGIISB019FieldCount,
} from './transformers/deteccion.transformer';
import { RegulatoryPolicyService } from '../../utils/regulatory-policy.service';
import { createRegulatoryError } from '../../utils/regulatory-error-helper';
import { RegulatoryErrorCode } from '../../utils/regulatory-error-codes';

/**
 * GIIS Export Parameters
 */
export interface GIISExportParams {
  /**
   * ProveedorSalud ID to export records for
   * If not provided, exports for all MX providers
   */
  proveedorSaludId?: string;

  /**
   * Start date for date range filter
   */
  fechaDesde?: Date;

  /**
   * End date for date range filter
   */
  fechaHasta?: Date;

  /**
   * Only export finalized documents
   */
  onlyFinalized?: boolean;
}

/**
 * GIIS Export Result
 */
export interface GIISExportResult {
  /**
   * Array of pipe-delimited GIIS records
   */
  records: string[];

  /**
   * Total records processed
   */
  totalProcessed: number;

  /**
   * Records skipped (non-MX or validation failures)
   */
  skipped: number;

  /**
   * Export metadata
   */
  metadata: {
    exportDate: Date;
    giisVersion: string;
    fieldCount: number;
    proveedorSaludId?: string;
  };
}

/**
 * GIIS Export Service
 *
 * Transforms internal Ramazzini documents (Lesion, Deteccion) to GIIS pipe-delimited format.
 *
 * KEY BEHAVIORS:
 * - Only exports records for MX providers (proveedorSalud.pais === 'MX')
 * - Non-MX providers are silently skipped
 * - Returns arrays of strings, NOT files
 * - Does NOT implement encryption, compression, or scheduling
 */
@Injectable()
export class GIISExportService {
  private readonly logger = new Logger(GIISExportService.name);

  constructor(
    @InjectModel(Lesion.name) private lesionModel: Model<Lesion>,
    @InjectModel(Deteccion.name) private deteccionModel: Model<Deteccion>,
    @InjectModel(Trabajador.name) private trabajadorModel: Model<Trabajador>,
    @InjectModel(ProveedorSalud.name)
    private proveedorSaludModel: Model<ProveedorSalud>,
    @InjectModel(CentroTrabajo.name)
    private centroTrabajoModel: Model<CentroTrabajo>,
    @InjectModel(Empresa.name) private empresaModel: Model<Empresa>,
    private readonly regulatoryPolicyService: RegulatoryPolicyService,
  ) {}

  /**
   * Export Lesion records to GIIS-B013 format
   * Only available for SIRES_NOM024 regime
   *
   * @param params - Export parameters
   * @returns Array of pipe-delimited GIIS-B013 records
   */
  async exportLesionesGIIS(
    params: GIISExportParams = {},
  ): Promise<GIISExportResult> {
    // Validate regime: GIIS export requires proveedorSaludId to check regime
    if (!params.proveedorSaludId) {
      throw createRegulatoryError({
        errorCode: RegulatoryErrorCode.REGIMEN_FEATURE_DISABLED,
        details: { feature: 'giisExport' },
      });
    }

    // Validate regime using policy layer
    const policy = await this.regulatoryPolicyService.getRegulatoryPolicy(
      params.proveedorSaludId,
    );

    if (!policy.features.giisExportEnabled) {
      throw createRegulatoryError({
        errorCode: RegulatoryErrorCode.REGIMEN_FEATURE_DISABLED,
        details: { feature: 'giisExport' },
        regime: policy.regime,
      });
    }

    const records: string[] = [];
    let skipped = 0;

    // Build query
    const query: any = {};

    if (params.fechaDesde || params.fechaHasta) {
      query.fechaAtencion = {};
      if (params.fechaDesde) {
        query.fechaAtencion.$gte = params.fechaDesde;
      }
      if (params.fechaHasta) {
        query.fechaAtencion.$lte = params.fechaHasta;
      }
    }

    if (params.onlyFinalized) {
      query.estado = 'finalizado';
    }

    // Fetch lesions
    const lesiones = await this.lesionModel.find(query).lean().exec();

    this.logger.log(
      `Processing ${lesiones.length} lesion records for GIIS export`,
    );

    for (const lesion of lesiones) {
      try {
        // Get trabajador
        const trabajador = await this.trabajadorModel
          .findById(lesion.idTrabajador)
          .lean()
          .exec();

        if (!trabajador) {
          this.logger.warn(
            `Skipping lesion ${lesion._id}: Trabajador not found`,
          );
          skipped++;
          continue;
        }

        // Get proveedor through the chain
        const proveedorSalud =
          await this.getProveedorSaludFromTrabajador(trabajador);

        // Check if MX provider
        if (!proveedorSalud || proveedorSalud.pais !== 'MX') {
          this.logger.debug(`Skipping lesion ${lesion._id}: Non-MX provider`);
          skipped++;
          continue;
        }

        // Check provider filter if specified
        if (
          params.proveedorSaludId &&
          proveedorSalud._id.toString() !== params.proveedorSaludId
        ) {
          skipped++;
          continue;
        }

        // Transform to GIIS format
        const giisRecord = transformLesionToGIIS(
          lesion as any,
          trabajador as any,
          proveedorSalud as any,
        );

        records.push(giisRecord);
      } catch (error) {
        this.logger.error(
          `Error processing lesion ${lesion._id}: ${error.message}`,
        );
        skipped++;
      }
    }

    this.logger.log(
      `GIIS-B013 export complete: ${records.length} records, ${skipped} skipped`,
    );

    return {
      records,
      totalProcessed: lesiones.length,
      skipped,
      metadata: {
        exportDate: new Date(),
        giisVersion: 'B013-2023',
        fieldCount: getGIISB013FieldCount(),
        proveedorSaludId: params.proveedorSaludId,
      },
    };
  }

  /**
   * Export Deteccion records to GIIS-B019 format
   * Only available for SIRES_NOM024 regime
   *
   * @param params - Export parameters
   * @returns Array of pipe-delimited GIIS-B019 records
   */
  async exportDeteccionesGIIS(
    params: GIISExportParams = {},
  ): Promise<GIISExportResult> {
    // Validate regime: GIIS export requires proveedorSaludId to check regime
    if (!params.proveedorSaludId) {
      throw createRegulatoryError({
        errorCode: RegulatoryErrorCode.REGIMEN_FEATURE_DISABLED,
        details: { feature: 'giisExport' },
      });
    }

    // Validate regime using policy layer
    const policy = await this.regulatoryPolicyService.getRegulatoryPolicy(
      params.proveedorSaludId,
    );

    if (!policy.features.giisExportEnabled) {
      throw createRegulatoryError({
        errorCode: RegulatoryErrorCode.REGIMEN_FEATURE_DISABLED,
        details: { feature: 'giisExport' },
        regime: policy.regime,
      });
    }

    const records: string[] = [];
    let skipped = 0;

    // Build query
    const query: any = {};

    if (params.fechaDesde || params.fechaHasta) {
      query.fechaDeteccion = {};
      if (params.fechaDesde) {
        query.fechaDeteccion.$gte = params.fechaDesde;
      }
      if (params.fechaHasta) {
        query.fechaDeteccion.$lte = params.fechaHasta;
      }
    }

    if (params.onlyFinalized) {
      query.estado = 'finalizado';
    }

    // Fetch detecciones
    const detecciones = await this.deteccionModel.find(query).lean().exec();

    this.logger.log(
      `Processing ${detecciones.length} deteccion records for GIIS export`,
    );

    for (const deteccion of detecciones) {
      try {
        // Get trabajador
        const trabajador = await this.trabajadorModel
          .findById(deteccion.idTrabajador)
          .lean()
          .exec();

        if (!trabajador) {
          this.logger.warn(
            `Skipping deteccion ${deteccion._id}: Trabajador not found`,
          );
          skipped++;
          continue;
        }

        // Get proveedor through the chain
        const proveedorSalud =
          await this.getProveedorSaludFromTrabajador(trabajador);

        // Check if MX provider
        if (!proveedorSalud || proveedorSalud.pais !== 'MX') {
          this.logger.debug(
            `Skipping deteccion ${deteccion._id}: Non-MX provider`,
          );
          skipped++;
          continue;
        }

        // Check provider filter if specified
        if (
          params.proveedorSaludId &&
          proveedorSalud._id.toString() !== params.proveedorSaludId
        ) {
          skipped++;
          continue;
        }

        // Transform to GIIS format
        const giisRecord = transformDeteccionToGIIS(
          deteccion as any,
          trabajador as any,
          proveedorSalud as any,
        );

        records.push(giisRecord);
      } catch (error) {
        this.logger.error(
          `Error processing deteccion ${deteccion._id}: ${error.message}`,
        );
        skipped++;
      }
    }

    this.logger.log(
      `GIIS-B019 export complete: ${records.length} records, ${skipped} skipped`,
    );

    return {
      records,
      totalProcessed: detecciones.length,
      skipped,
      metadata: {
        exportDate: new Date(),
        giisVersion: 'B019-2023',
        fieldCount: getGIISB019FieldCount(),
        proveedorSaludId: params.proveedorSaludId,
      },
    };
  }

  /**
   * Get ProveedorSalud from a Trabajador document through the entity chain
   * Trabajador -> CentroTrabajo -> Empresa -> ProveedorSalud
   */
  private async getProveedorSaludFromTrabajador(
    trabajador: any,
  ): Promise<any | null> {
    try {
      if (!trabajador?.idCentroTrabajo) {
        return null;
      }

      const centroTrabajo = await this.centroTrabajoModel
        .findById(trabajador.idCentroTrabajo)
        .lean()
        .exec();

      if (!centroTrabajo?.idEmpresa) {
        return null;
      }

      const empresa = await this.empresaModel
        .findById(centroTrabajo.idEmpresa)
        .lean()
        .exec();

      if (!empresa?.idProveedorSalud) {
        return null;
      }

      return this.proveedorSaludModel
        .findById(empresa.idProveedorSalud)
        .lean()
        .exec();
    } catch (error) {
      this.logger.error(
        `Error getting ProveedorSalud for trabajador: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Check if a provider is MX (requires GIIS export)
   */
  async isProveedorMX(proveedorSaludId: string): Promise<boolean> {
    try {
      const proveedor = await this.proveedorSaludModel
        .findById(proveedorSaludId)
        .select('pais')
        .lean()
        .exec();

      return proveedor?.pais === 'MX';
    } catch {
      return false;
    }
  }

  /**
   * Get export statistics for a provider
   * Only available for SIRES_NOM024 regime
   */
  async getExportStats(proveedorSaludId: string): Promise<{
    lesionCount: number;
    deteccionCount: number;
    isMX: boolean;
  }> {
    // Validate regime using policy layer
    const policy = await this.regulatoryPolicyService.getRegulatoryPolicy(
      proveedorSaludId,
    );

    if (!policy.features.giisExportEnabled) {
      throw createRegulatoryError({
        errorCode: RegulatoryErrorCode.REGIMEN_FEATURE_DISABLED,
        details: { feature: 'giisExport' },
        regime: policy.regime,
      });
    }

    // Get all trabajadores for this provider
    const trabajadorIds =
      await this.getTrabajadorIdsForProveedor(proveedorSaludId);

    const lesionCount = await this.lesionModel
      .countDocuments({ idTrabajador: { $in: trabajadorIds } })
      .exec();

    const deteccionCount = await this.deteccionModel
      .countDocuments({ idTrabajador: { $in: trabajadorIds } })
      .exec();

    // Check if provider is MX for the isMX flag (for backward compatibility)
    const isMX = await this.isProveedorMX(proveedorSaludId);

    return { lesionCount, deteccionCount, isMX };
  }

  /**
   * Get all trabajador IDs for a provider
   */
  private async getTrabajadorIdsForProveedor(
    proveedorSaludId: string,
  ): Promise<string[]> {
    try {
      // Get empresas for this provider
      const empresas = await this.empresaModel
        .find({ idProveedorSalud: proveedorSaludId })
        .select('_id')
        .lean()
        .exec();

      const empresaIds = empresas.map((e) => e._id);

      // Get centros de trabajo for these empresas
      const centros = await this.centroTrabajoModel
        .find({ idEmpresa: { $in: empresaIds } })
        .select('_id')
        .lean()
        .exec();

      const centroIds = centros.map((c) => c._id);

      // Get trabajadores for these centros
      const trabajadores = await this.trabajadorModel
        .find({ idCentroTrabajo: { $in: centroIds } })
        .select('_id')
        .lean()
        .exec();

      return trabajadores.map((t) => t._id.toString());
    } catch (error) {
      this.logger.error(`Error getting trabajador IDs: ${error.message}`);
      return [];
    }
  }
}
