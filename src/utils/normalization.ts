import { CreateEmpresaDto } from "src/modules/empresas/dto/create-empresa.dto";
import { UpdateEmpresaDto } from "src/modules/empresas/dto/update-empresa.dto";
import { CreateCentrosTrabajoDto } from "src/modules/centros-trabajo/dto/create-centros-trabajo.dto";
import { UpdateCentrosTrabajoDto } from "src/modules/centros-trabajo/dto/update-centros-trabajo.dto";
import { CreateTrabajadorDto } from "src/modules/trabajadores/dto/create-trabajador.dto";
import { UpdateTrabajadorDto } from "src/modules/trabajadores/dto/update-trabajador.dto";

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

export function normalizeTrabajadorData(dto: CreateTrabajadorDto | UpdateTrabajadorDto) {
    return {
      ...dto,
      nombre: dto.nombre?.trim(),
      fechaNacimiento: dto.fechaNacimiento,
      sexo: dto.sexo?.trim(),
      escolaridad: dto.escolaridad?.trim(),
      puesto: dto.puesto?.trim(),
      fechaIngreso: dto.fechaIngreso,
      telefono: dto.telefono?.trim(),
      estadoCivil: dto.estadoCivil?.trim(),
      hijos: dto.hijos,
      centroTrabajo: dto.idCentroTrabajo?.trim(),
      createdBy: dto.createdBy?.trim(),
      updatedBy: dto.updatedBy?.trim(),
    };
}