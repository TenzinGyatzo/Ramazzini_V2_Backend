/**
 * CDT (GIIS-B019 Detecciones) mapper — schema-driven.
 * Output keys and order come only from docs/nom-024/giis_schemas/CDT.schema.json.
 */

import { loadGiisSchema, GiisSchema } from '../schema-loader';
import { toAAAAMMDD } from '../formatters/date.formatter';
import { formatCURP } from '../formatters/field.formatter';

export interface CdtMapperContext {
  clues: string;
}

interface DeteccionLike {
  fechaDeteccion?: Date;
  clues?: string;
  curpPrestador?: string;
  tipoPersonal?: number;
  servicioAtencion?: number;
  primeraVezAnio?: boolean;
  peso?: number;
  talla?: number;
  cintura?: number;
  tensionArterialSistolica?: number;
  tensionArterialDiastolica?: number;
  glucemia?: number;
  tipoMedicionGlucemia?: number;
  [key: string]: unknown;
}

interface TrabajadorLike {
  curp?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: Date;
  sexo?: string;
  entidadNacimiento?: string;
  [key: string]: unknown;
}

const CDT_SCHEMA = loadGiisSchema('CDT');

/** Default for required string (apellidos sin dato) */
const DEFAULT_XX = 'XX';
/** Default for required numeric (país México) */
const DEFAULT_PAIS_MEXICO = 142;
/** Default programaSMyMG = No */
const DEFAULT_PROGRAMA_SMYMG = 0;
/** CURP genérica cuando no hay CURP */
const CURP_GENERICA = 'XXXX999999XXXXXX99';

/**
 * Map one Deteccion (and optional Trabajador) to a flat record with keys = CDT schema field names.
 * All 92 columns are present; required ones get value or default.
 */
export function mapDeteccionToCdtRow(
  deteccion: DeteccionLike,
  context: CdtMapperContext,
  trabajador?: TrabajadorLike | null,
): Record<string, string | number> {
  const schema = CDT_SCHEMA;
  const row: Record<string, string | number> = {};

  const clues = (context.clues || deteccion.clues || '').trim() || '9998';
  const curpPaciente = trabajador?.curp
    ? formatCURP(trabajador.curp) || CURP_GENERICA
    : CURP_GENERICA;

  const valueByField: Record<string, string | number> = {
    clues,
    paisNacimiento: DEFAULT_PAIS_MEXICO,
    curpPrestador: formatCURP(deteccion.curpPrestador) || CURP_GENERICA,
    nombrePrestador: 'NA',
    primerApellidoPrestador: 'NA',
    segundoApellidoPrestador: DEFAULT_XX,
    tipoPersonal: deteccion.tipoPersonal ?? 0,
    programaSMyMG: DEFAULT_PROGRAMA_SMYMG,
    curpPaciente,
    nombre: (trabajador?.nombre as string) || DEFAULT_XX,
    primerApellido: (trabajador?.primerApellido as string) || DEFAULT_XX,
    segundoApellido: (trabajador?.segundoApellido as string) || DEFAULT_XX,
    fechaNacimiento: toAAAAMMDD(trabajador?.fechaNacimiento) || '19000101',
    paisNacPaciente: DEFAULT_PAIS_MEXICO,
    entidadNacimiento: (trabajador?.entidadNacimiento as string) || DEFAULT_XX,
    sexoCURP: (trabajador?.sexo as string) === 'M' ? '2' : (trabajador?.sexo as string) === 'F' ? '2' : '1',
    sexoBiologico: 1,
    fechaDeteccion: toAAAAMMDD(deteccion.fechaDeteccion) || '',
    servicioAtencion: deteccion.servicioAtencion ?? 0,
    peso: deteccion.peso ?? 0,
    talla: deteccion.talla ?? 0,
    circunferenciaCintura: deteccion.cintura ?? 0,
    sistolica: deteccion.tensionArterialSistolica ?? 0,
    diastolica: deteccion.tensionArterialDiastolica ?? 0,
    glucemia: deteccion.glucemia ?? 0,
    tipoMedicion: deteccion.tipoMedicionGlucemia ?? 0,
    primeraVezAnio: deteccion.primeraVezAnio ? 1 : 0,
  };

  for (const field of schema.fields) {
    if (valueByField[field.name] !== undefined) {
      row[field.name] = valueByField[field.name];
    } else if (field.requiredColumn) {
      row[field.name] = field.type?.kind === 'numeric' ? 0 : DEFAULT_XX;
    } else {
      row[field.name] = '';
    }
  }
  return row;
}

export function getCdtSchema(): GiisSchema {
  return CDT_SCHEMA;
}
