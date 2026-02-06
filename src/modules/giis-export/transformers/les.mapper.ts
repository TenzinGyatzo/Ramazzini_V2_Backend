/**
 * LES (GIIS-B013 Lesiones) mapper — schema-driven.
 * Output keys and order come only from docs/nom-024/giis_schemas/LES.schema.json.
 * Source: Lesion document + optional Trabajador (paciente).
 */

import { loadGiisSchema, GiisSchema } from '../schema-loader';
import { toDDMMAAAA } from '../formatters/date.formatter';
import { formatCURP, formatCLUES } from '../formatters/field.formatter';

export interface LesMapperContext {
  clues: string;
}

/** Lesion document-like (GIIS-B013) */
export interface LesionLike {
  clues?: string;
  folio?: string;
  curpPaciente?: string;
  fechaNacimiento?: Date;
  sexo?: number;
  fechaEvento?: Date;
  horaEvento?: string;
  sitioOcurrencia?: number;
  intencionalidad?: number;
  agenteLesion?: number;
  tipoViolencia?: number[];
  fechaAtencion?: Date;
  horaAtencion?: string;
  tipoAtencion?: number[];
  areaAnatomica?: number;
  consecuenciaGravedad?: number;
  codigoCIEAfeccionPrincipal?: string;
  codigoCIECausaExterna?: string;
  afeccionesTratadas?: string[];
  responsableAtencion?: number;
  curpResponsable?: string;
  [key: string]: unknown;
}

/** Trabajador-like (paciente) */
export interface TrabajadorLike {
  curp?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: Date;
  entidadNacimiento?: string;
  [key: string]: unknown;
}

const LES_SCHEMA = loadGiisSchema('LES');

const DEFAULT_XX = 'XX';
const DEFAULT_PAIS_MEXICO = 142;
const CURP_GENERICA = 'XXXX999999XXXXXX99';
const HORA_IGNORADA = '99:99';

function joinWithAmp(values: (string | number)[] | null | undefined): string {
  if (!values || values.length === 0) return '';
  return values.map(String).join('&');
}

/**
 * Map one Lesion + optional Trabajador to a flat record with keys = LES schema field names.
 * All 82 columns present; required ones get value or default. No hardcoded field list — iterate schema.fields.
 */
export function mapLesionToLesRow(
  lesion: LesionLike,
  context: LesMapperContext,
  trabajador?: TrabajadorLike | null,
): Record<string, string | number> {
  const schema = LES_SCHEMA;
  const row: Record<string, string | number> = {};

  const clues = (context.clues || lesion.clues || '').trim() || '9998';
  const curpPaciente = lesion.curpPaciente
    ? formatCURP(lesion.curpPaciente as string) || (trabajador?.curp ? formatCURP(trabajador.curp) : '') || CURP_GENERICA
    : (trabajador?.curp ? formatCURP(trabajador.curp) : '') || CURP_GENERICA;

  const tipoAtencionStr = joinWithAmp(lesion.tipoAtencion) || '1';
  const tipoViolenciaStr = (lesion.intencionalidad === 2 || lesion.intencionalidad === 3)
    ? (joinWithAmp(lesion.tipoViolencia) || '-1')
    : '-1';

  const valueByField: Record<string, string | number> = {
    clues: formatCLUES(clues) || clues,
    folio: String(lesion.folio ?? '').padStart(8, '0').slice(0, 8) || '00000001',
    curpPaciente,
    nombre: (trabajador?.nombre as string) || lesion.curpPaciente ? 'XX' : DEFAULT_XX,
    primerApellido: (trabajador?.primerApellido as string) || DEFAULT_XX,
    segundoApellido: (trabajador?.segundoApellido as string) || DEFAULT_XX,
    fechaNacimiento: toDDMMAAAA(lesion.fechaNacimiento || trabajador?.fechaNacimiento) || '09/09/9999',
    paisOrigen: DEFAULT_PAIS_MEXICO,
    entidadNacimiento: (trabajador?.entidadNacimiento as string) || (lesion.curpPaciente ? '99' : '99'),
    escolaridad: 88,
    sabeLeerEscribir: 9,
    sexo: lesion.sexo ?? 1,
    derechohabiencia: 99,
    gratuidad: 8,
    seConsideraIndigena: 2,
    hablaLenguaIndigena: 2,
    cualLengua: '-1',
    seConsideraAfromexicano: 2,
    mujerFertil: -1,
    edadGestacional: 0,
    discapacidad: 9,
    usuarioReferido: 8,
    cluesReferido: '',
    fechaEvento: toDDMMAAAA(lesion.fechaEvento) || toDDMMAAAA(lesion.fechaAtencion) || '01/01/2020',
    horaEvento: (lesion.horaEvento && /^\d{1,2}:\d{2}$/.test(lesion.horaEvento)) ? lesion.horaEvento : HORA_IGNORADA,
    diaFestivo: 2,
    sitioOcurrencia: lesion.sitioOcurrencia ?? 0,
    entidadOcurrencia: '99',
    municipioOcurrencia: '998',
    localidadOcurrencia: '9998',
    otraLocalidad: '',
    codigoPostal: '00000',
    tipoVialidad: 99,
    nombreVialidad: 'NO ESPECIFICADO',
    numeroExterior: '0',
    tipoAsentamiento: 46,
    nombreAsentamiento: 'NO ESPECIFICADO',
    atencionPreHospitalaria: 2,
    tiempoTrasladoUH: '',
    sospechaBajoEfectosDe: '5',
    intencionalidad: lesion.intencionalidad ?? 1,
    eventoRepetido: 1,
    agenteLesion: lesion.agenteLesion ?? (lesion.intencionalidad === 1 || lesion.intencionalidad === 4 ? 26 : 27),
    especifique: '',
    lesionadoVehiculoMotor: -1,
    usoEquipoSeguridad: -1,
    equipoUtilizado: -1,
    especifiqueEquipo: '',
    tipoViolencia: tipoViolenciaStr,
    numeroAgresores: -1,
    parentescoAfectado: -1,
    sexoAgresor: -1,
    edadAgresor: 0,
    agresorBajoEfectos: '-1',
    fechaAtencion: toDDMMAAAA(lesion.fechaAtencion) || '01/01/2020',
    horaAtencion: (lesion.horaAtencion && /^\d{1,2}:\d{2}$/.test(lesion.horaAtencion)) ? lesion.horaAtencion : HORA_IGNORADA,
    servicioAtencion: 1,
    especifiqueServicio: '',
    tipoAtencion: tipoAtencionStr,
    areaAnatomica: lesion.areaAnatomica ?? 0,
    especifiqueArea: '',
    consecuenciaGravedad: lesion.consecuenciaGravedad ?? 0,
    especifiqueConsecuencia: '',
    descripcionAfeccionPrincipal: 'AFECCION PRINCIPAL',
    codigoCIEAfeccionPrincipal: (lesion.codigoCIEAfeccionPrincipal as string)?.trim() || 'S00',
    numeroAfeccion: 1,
    descripcionAfeccion: 'AFECCION TRATADA',
    codigoCIEAfeccion: (lesion.afeccionesTratadas?.[0]?.split('#').pop() || lesion.codigoCIEAfeccionPrincipal)?.trim() || lesion.codigoCIEAfeccionPrincipal || 'S00',
    afeccionPrincipalReseleccionada: (lesion.codigoCIEAfeccionPrincipal as string)?.trim() || 'S00',
    causaExterna: 'CAUSA EXTERNA',
    codigoCIECausaExterna: (lesion.codigoCIECausaExterna as string)?.trim() || 'V99',
    despuesAtencion: 1,
    especifiqueDestino: '',
    ministerioPublico: 2,
    folioCertificadoDefuncion: '',
    responsableAtencion: lesion.responsableAtencion ?? 1,
    paisNacimiento: DEFAULT_PAIS_MEXICO,
    curpResponsable: formatCURP(lesion.curpResponsable as string) || CURP_GENERICA,
    nombreResponsable: 'NA',
    primerApellidoResponsable: 'NA',
    segundoApellidoResponsable: DEFAULT_XX,
    cedulaResponsable: '0',
  };

  for (const field of schema.fields) {
    if (valueByField[field.name] !== undefined) {
      row[field.name] = valueByField[field.name];
    } else if (field.requiredColumn) {
      row[field.name] = field.type?.kind === 'numeric' ? -1 : DEFAULT_XX;
    } else {
      row[field.name] = '';
    }
  }
  return row;
}

export function getLesSchema(): GiisSchema {
  return LES_SCHEMA;
}
