import { ExecutionContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { Trabajador } from '../../modules/trabajadores/schemas/trabajador.schema';
import { CentroTrabajo } from '../../modules/centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../../modules/empresas/schemas/empresa.schema';

/**
 * Helper para extraer trabajadorId desde múltiples fuentes del request
 * Orden de prioridad:
 * 1. Parámetro de ruta (@Param('trabajadorId'))
 * 2. Body del request (dto.trabajadorId)
 * 3. Query parameter (@Query('trabajadorId'))
 */
export function extractTrabajadorId(context: ExecutionContext): string | null {
  const request = context.switchToHttp().getRequest();

  // 1. Parámetro de ruta (prioridad más alta)
  if (request.params?.trabajadorId) {
    return request.params.trabajadorId;
  }

  // 2. Body del request
  if (request.body?.trabajadorId) {
    return request.body.trabajadorId;
  }

  // 3. Query parameter
  if (request.query?.trabajadorId) {
    return request.query.trabajadorId;
  }

  return null;
}

/**
 * Helper para obtener proveedorSaludId desde un trabajadorId
 * Trabajador -> CentroTrabajo -> Empresa -> ProveedorSalud
 *
 * Esta función replica la lógica de ConsentimientoDiarioService.getProveedorSaludIdFromTrabajador
 * para evitar dependencias circulares
 */
export async function getProveedorSaludIdFromTrabajador(
  trabajadorId: string,
  trabajadorModel: Model<Trabajador>,
  centroTrabajoModel: Model<CentroTrabajo>,
  empresaModel: Model<Empresa>,
): Promise<string | null> {
  try {
    const trabajador = await trabajadorModel.findById(trabajadorId).lean();
    if (!trabajador || !trabajador.idCentroTrabajo) {
      return null;
    }

    const centroTrabajo = await centroTrabajoModel
      .findById(trabajador.idCentroTrabajo)
      .lean();
    if (!centroTrabajo || !centroTrabajo.idEmpresa) {
      return null;
    }

    const empresa = await empresaModel.findById(centroTrabajo.idEmpresa).lean();
    if (!empresa || !empresa.idProveedorSalud) {
      return null;
    }

    return empresa.idProveedorSalud.toString();
  } catch {
    return null;
  }
}
