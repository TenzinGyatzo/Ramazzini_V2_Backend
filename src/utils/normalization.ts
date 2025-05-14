import { CreateEmpresaDto } from 'src/modules/empresas/dto/create-empresa.dto';
import { UpdateEmpresaDto } from 'src/modules/empresas/dto/update-empresa.dto';
import { CreateCentrosTrabajoDto } from 'src/modules/centros-trabajo/dto/create-centros-trabajo.dto';
import { UpdateCentrosTrabajoDto } from 'src/modules/centros-trabajo/dto/update-centros-trabajo.dto';
import { CreateTrabajadorDto } from 'src/modules/trabajadores/dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from 'src/modules/trabajadores/dto/update-trabajador.dto';
import { CreateProveedoresSaludDto } from 'src/modules/proveedores-salud/dto/create-proveedores-salud.dto';
import { UpdateProveedoresSaludDto } from 'src/modules/proveedores-salud/dto/update-proveedores-salud.dto';
import { CreateMedicoFirmanteDto } from 'src/modules/medicos-firmantes/dto/create-medico-firmante.dto';
import { UpdateMedicoFirmanteDto } from 'src/modules/medicos-firmantes/dto/update-medico-firmante.dto';

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

export function normalizeCentroTrabajoData(
  dto: CreateCentrosTrabajoDto | UpdateCentrosTrabajoDto,
) {
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

export function normalizeTrabajadorData(
  dto: CreateTrabajadorDto | UpdateTrabajadorDto,
) {
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
    estadoLaboral: dto.estadoLaboral?.trim(),
    agentesRiesgoActuales: dto.agentesRiesgoActuales?.map(agent => agent.trim()),
    centroTrabajo: dto.idCentroTrabajo?.trim(),
    createdBy: dto.createdBy?.trim(),
    updatedBy: dto.updatedBy?.trim(),
  };
}

export function normalizeProveedorSaludData(
  dto: CreateProveedoresSaludDto | UpdateProveedoresSaludDto,
) {
  return {
    ...dto,
    nombre: typeof dto.nombre === 'string' ? dto.nombre.trim() : "",
    RFC: typeof dto.RFC === 'string' ? dto.RFC.trim().toUpperCase() : "",
    perfilProveedorSalud: typeof dto.perfilProveedorSalud === 'string' ? dto.perfilProveedorSalud.trim() : "",

    logotipoEmpresa: dto.logotipoEmpresa
      ? {
          data: dto.logotipoEmpresa.data.trim(),
          contentType: dto.logotipoEmpresa.contentType.trim(),
        }
      : undefined,

    estado: typeof dto.estado === 'string' ? dto.estado.trim() : "",
    municipio: typeof dto.municipio === 'string' ? dto.municipio.trim() : "",
    codigoPostal: typeof dto.codigoPostal === 'string' ? dto.codigoPostal.trim() : "",
    direccion: typeof dto.direccion === 'string' ? dto.direccion.trim() : "",
    telefono: typeof dto.telefono === 'string' ? dto.telefono.trim() : "",
    correoElectronico: typeof dto.correoElectronico === 'string' ? dto.correoElectronico.trim() : "",
    sitioWeb: typeof dto.sitioWeb === 'string' ? dto.sitioWeb.trim() : "",

    // **Campos relacionados con el periodo de prueba y limites**
    fechaInicioTrial: dto.fechaInicioTrial ?? new Date(),
    periodoDePruebaFinalizado: dto.periodoDePruebaFinalizado ?? false,
    maxHistoriasPermitidasAlMes: dto.maxHistoriasPermitidasAlMes ?? 25,

    addOns: dto.addOns?.map((addOn) => ({
      tipo: addOn.tipo.trim(),
      cantidad: addOn.cantidad,
    })) ?? [],

  };
}


// normalization.ts

export function normalizeMedicoFirmanteData(
  dto: CreateMedicoFirmanteDto | UpdateMedicoFirmanteDto,
) {
  const normalizedDto = {
    ...dto,
    nombre: typeof dto.nombre === 'string' ? dto.nombre.trim() : "",
    tituloProfesional: typeof dto.tituloProfesional === 'string' ? dto.tituloProfesional.trim() : "",
    numeroCedulaProfesional: typeof dto.numeroCedulaProfesional === 'string' ? dto.numeroCedulaProfesional.trim() : "",
    especialistaSaludTrabajo: typeof dto.especialistaSaludTrabajo === 'string' ? dto.especialistaSaludTrabajo.trim() : "",
    numeroCedulaEspecialista: typeof dto.numeroCedulaEspecialista === 'string' ? dto.numeroCedulaEspecialista.trim() : "",
    nombreCredencialAdicional: typeof dto.nombreCredencialAdicional === 'string' ? dto.nombreCredencialAdicional.trim() : "",
    numeroCredencialAdicional: typeof dto.numeroCredencialAdicional === 'string' ? dto.numeroCredencialAdicional.trim() : "",
    firma: dto.firma && typeof dto.firma.data === 'string' && typeof dto.firma.contentType === 'string'
      ? {
          data: dto.firma.data.trim(),
          contentType: dto.firma.contentType.trim(),
        }
      : undefined,
    firmaConAntefirma: dto.firmaConAntefirma && typeof dto.firmaConAntefirma.data === 'string' && typeof dto.firmaConAntefirma.contentType === 'string'
      ? {
          data: dto.firmaConAntefirma.data.trim(),
          contentType: dto.firmaConAntefirma.contentType.trim(),
        }
      : undefined,
  };

  // ✅ Verificar y eliminar idUser si está vacío
  if (!dto.idUser || dto.idUser.trim() === "") {
    delete normalizedDto.idUser;
  } else {
    normalizedDto.idUser = dto.idUser.trim();
  }

  return normalizedDto;
}
