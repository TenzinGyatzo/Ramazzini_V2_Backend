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
    nombre: dto.nombre?.trim(),
    RFC: dto.RFC?.trim().toUpperCase(),
    perfilProveedorSalud: dto.perfilProveedorSalud?.trim(),

    logotipoEmpresa: dto.logotipoEmpresa
      ? {
          data: dto.logotipoEmpresa.data.trim(),
          contentType: dto.logotipoEmpresa.contentType.trim(),
        }
      : undefined,

    estado: dto.estado?.trim(),
    municipio: dto.municipio?.trim(),
    codigoPostal: dto.codigoPostal?.trim(),
    direccion: dto.direccion?.trim(),
    telefono: dto.telefono?.trim(),
    correoElectronico: dto.correoElectronico?.trim(),
    sitioWeb: dto.sitioWeb?.trim(),

    // **Campos relacionados con la suscripción y planes**
    referenciaPlan: dto.referenciaPlan?.trim(),
    maxUsuariosPermitidos: dto.maxUsuariosPermitidos ?? 1,
    maxEmpresasPermitidas: dto.maxEmpresasPermitidas ?? 10,
    estadoSuscripcion: dto.estadoSuscripcion?.trim() ?? 'pending',
    fechaInicioTrial: dto.fechaInicioTrial ?? new Date(),
    periodoDePruebaFinalizado: dto.periodoDePruebaFinalizado ?? false,

    addOns: dto.addOns?.map((addOn) => ({
      tipo: addOn.tipo.trim(),
      cantidad: addOn.cantidad,
    })) ?? [],

    // **Campos vinculados a MercadoPago**
    mercadoPagoSubscriptionId: dto.mercadoPagoSubscriptionId?.trim(),
    payerEmail: dto.payerEmail?.trim(),
  };
}

export function normalizeMedicoFirmanteData(
  dto: CreateMedicoFirmanteDto | UpdateMedicoFirmanteDto,
) {
  return {
    ...dto,
    nombre: dto.nombre?.trim(),
    tituloProfesional: dto.tituloProfesional?.trim(),
    numeroCedulaProfesional: dto.numeroCedulaProfesional?.trim(),
    especialistaSaludTrabajo: dto.especialistaSaludTrabajo?.trim(),
    numeroCedulaEspecialista: dto.numeroCedulaEspecialista?.trim(),
    nombreCredencialAdicional: dto.nombreCredencialAdicional?.trim(),
    numeroCredencialAdicional: dto.numeroCredencialAdicional?.trim(),
    firma: dto.firma
      ? {
          data: dto.firma.data.trim(),
          contentType: dto.firma.contentType.trim(),
        }
      : undefined,
    firmaConAntefirma: dto.firmaConAntefirma
      ? {
          data: dto.firmaConAntefirma.data.trim(),
          contentType: dto.firmaConAntefirma.contentType.trim(),
        }
      : undefined,
    idUser: dto.idUser?.trim(),
  };
}