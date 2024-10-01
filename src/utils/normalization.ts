import { CreateEmpresaDto } from "src/modules/empresas/dto/create-empresa.dto";
import { UpdateEmpresaDto } from "src/modules/empresas/dto/update-empresa.dto";
import { CreateCentrosTrabajoDto } from "src/modules/centros-trabajo/dto/create-centros-trabajo.dto";
import { UpdateCentrosTrabajoDto } from "src/modules/centros-trabajo/dto/update-centros-trabajo.dto";

export function normalizeEmpresaData(dto: CreateEmpresaDto | UpdateEmpresaDto) {
    return {
      ...dto,
      nombreComercial: dto.nombreComercial?.trim(),
      razonSocial: dto.razonSocial?.trim(),
      RFC: dto.RFC?.trim().toUpperCase(),
      giroDeEmpresa: dto.giroDeEmpresa?.trim(),
      logotipoEmpresa: dto.logotipoEmpresa
        ? {
            data: dto.logotipoEmpresa.data.trim(),
            contentType: dto.logotipoEmpresa.contentType.trim(),
          }
        : undefined,
    };
  }

export function normalizeCentroTrabajoData(dto: CreateCentrosTrabajoDto | UpdateCentrosTrabajoDto) {
    return {
      ...dto,
      nombreCentro: dto.nombreCentro?.trim(),
      direccionCentro: dto.direccionCentro?.trim(),
      codigoPostal: dto.codigoPostal?.trim(),
      estado: dto.estado?.trim(),
      municipio: dto.municipio?.trim(),
      idEmpresa: dto.idEmpresa?.trim(),
      createdBy: dto.createdBy?.trim(),
      updatedBy: dto.updatedBy?.trim(),
    };
}