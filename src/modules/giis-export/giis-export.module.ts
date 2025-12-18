import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GIISExportService } from './giis-export.service';
import { Lesion, LesionSchema } from '../expedientes/schemas/lesion.schema';
import {
  Deteccion,
  DeteccionSchema,
} from '../expedientes/schemas/deteccion.schema';
import {
  Trabajador,
  TrabajadorSchema,
} from '../trabajadores/schemas/trabajador.schema';
import {
  ProveedorSalud,
  ProveedorSaludSchema,
} from '../proveedores-salud/schemas/proveedor-salud.schema';
import {
  CentroTrabajo,
  CentroTrabajoSchema,
} from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa, EmpresaSchema } from '../empresas/schemas/empresa.schema';

/**
 * GIIS Export Module
 *
 * Provides transformation services for converting internal Ramazzini documents
 * to GIIS pipe-delimited format for NOM-024 compliance.
 *
 * CAPABILITIES:
 * - Transform Lesion documents to GIIS-B013 format
 * - Transform Deteccion documents to GIIS-B019 format
 * - Filter by MX providers only
 * - Date range filtering
 *
 * LIMITATIONS (by design):
 * - Does NOT implement file creation
 * - Does NOT implement encryption (3DES)
 * - Does NOT implement compression
 * - Does NOT implement scheduling/delivery
 *
 * These features are deferred to a future phase when DGIS requirements are finalized.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesion.name, schema: LesionSchema },
      { name: Deteccion.name, schema: DeteccionSchema },
      { name: Trabajador.name, schema: TrabajadorSchema },
      { name: ProveedorSalud.name, schema: ProveedorSaludSchema },
      { name: CentroTrabajo.name, schema: CentroTrabajoSchema },
      { name: Empresa.name, schema: EmpresaSchema },
    ]),
  ],
  providers: [GIISExportService],
  exports: [GIISExportService],
})
export class GIISExportModule {}
