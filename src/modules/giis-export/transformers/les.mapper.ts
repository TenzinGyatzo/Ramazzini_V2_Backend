/**
 * LES (GIIS-B013 Lesiones) mapper — schema-driven.
 * Output keys and order come only from docs/nom-024/giis_schemas/LES.schema.json.
 * Source: Lesion document + optional Trabajador (paciente), or NotaMedica + Trabajador + Prestador (derived).
 */

import { loadGiisSchema, GiisSchema } from '../schema-loader';
import { toDDMMAAAA } from '../formatters/date.formatter';
import {
  formatCURP,
  formatCLUES,
  normalizeNameForGiis,
} from '../formatters/field.formatter';
import { parseNombreCompleto } from '../../../utils/parseNombreCompleto';
import {
  extractCieCode,
  isCieAfeccionLesion,
  isCieCausaExterna,
} from '../utils/cie-lesion.utils';
import { appEscolaridadToCatalogKey } from '../utils/escolaridad-giis.mapper';

export interface LesMapperContext {
  clues: string;
  /** Resolve cat_pais from nacionalidad (e.g. 248 NO ESPECIFICADO). */
  getPaisCatalogKeyFromNacionalidad?: (clave: string) => number | null;
}

/** NotaMedica-like for deriving LES from consulta externa (fechaNotaMedica, CIE codes). */
export interface NotaMedicaLike {
  _id?: unknown;
  fechaNotaMedica?: Date;
  codigoCIE10Principal?: string;
  codigosCIE10Complementarios?: string[];
  codigoCIEDiagnostico2?: string;
  codigoCIECausaExterna?: string;
  causaExterna?: string;
  [key: string]: unknown;
}

/** Prestador-like (firmante) for responsable de atención. */
export interface PrestadorLike {
  curp?: string;
  nombre?: string;
  tipoPersonal?: number;
}

/** Lesion document-like (Reporte de Lesión y/o Violencia — GIIS-B013). CLUES se obtiene de ProveedorSalud en el context. */
export interface LesionLike {
  folio?: string;
  curpPaciente?: string;
  fechaNacimiento?: Date;
  sexo?: number;
  fechaEvento?: Date;
  horaEvento?: string;
  diaFestivo?: number;
  sitioOcurrencia?: number;
  entidadOcurrencia?: string;
  municipioOcurrencia?: string;
  localidadOcurrencia?: string;
  otraLocalidad?: string;
  codigoPostal?: string;
  tipoVialidad?: number;
  nombreVialidad?: string;
  numeroExterior?: string;
  tipoAsentamiento?: number;
  nombreAsentamiento?: string;
  atencionPreHospitalaria?: number;
  tiempoTrasladoUH?: string;
  sospechaBajoEfectosDe?: string;
  intencionalidad?: number;
  eventoRepetido?: number;
  agenteLesion?: number;
  especifique?: string;
  lesionadoVehiculoMotor?: number;
  usoEquipoSeguridad?: number;
  equipoUtilizado?: number;
  especifiqueEquipo?: string;
  tipoViolencia?: number[];
  numeroAgresores?: number;
  parentescoAfectado?: number;
  sexoAgresor?: number;
  edadAgresor?: number;
  agresorBajoEfectos?: string;
  fechaAtencion?: Date;
  horaAtencion?: string;
  servicioAtencion?: number;
  especifiqueServicio?: string;
  tipoAtencion?: number[];
  areaAnatomica?: number;
  especifiqueArea?: string;
  consecuenciaGravedad?: number;
  especifiqueConsecuencia?: string;
  descripcionAfeccionPrincipal?: string;
  codigoCIEAfeccionPrincipal?: string;
  codigoCIECausaExterna?: string;
  afeccionesTratadas?: string[];
  descripcionAfeccion?: string;
  afeccionPrincipalReseleccionada?: string;
  causaExterna?: string;
  despuesAtencion?: number;
  especifiqueDestino?: string;
  ministerioPublico?: number;
  folioCertificadoDefuncion?: string;
  fechaReporteLesion?: Date;
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
const PAIS_NO_ESPECIFICADO = 248;
const CURP_GENERICA = 'XXXX999999XXXXXX99';
const HORA_IGNORADA = '99:99';
const DEFAULT_NA = 'NA';

function joinWithAmp(values: (string | number)[] | null | undefined): string {
  if (!values || values.length === 0) return '';
  return values.map(String).join('&');
}

/**
 * Collect all CIE codes from a NotaMedica (principal, complementarios, diagnostico2) and return
 * those that are injury codes (Cap. XIX S00-T98).
 */
function collectLesionCodesFromNota(nota: NotaMedicaLike): string[] {
  const codes: string[] = [];
  const principal = extractCieCode(nota.codigoCIE10Principal);
  if (principal && isCieAfeccionLesion(principal)) codes.push(principal);
  for (const c of nota.codigosCIE10Complementarios || []) {
    const code = extractCieCode(c);
    if (code && isCieAfeccionLesion(code)) codes.push(code);
  }
  const diag2 = extractCieCode(nota.codigoCIEDiagnostico2);
  if (diag2 && isCieAfeccionLesion(diag2)) codes.push(diag2);
  return codes;
}

/**
 * Map one NotaMedica (consulta externa) + Trabajador + Prestador to zero or more LES rows.
 * Only generates rows when the note has at least one injury code (S00-T98) or an external-cause code (V01-Y98).
 * One row per note; first injury code = afección principal; causa externa from nota or V99.
 */
export function mapNotaMedicaToLesRows(
  nota: NotaMedicaLike,
  context: LesMapperContext,
  trabajador?: TrabajadorLike | null,
  prestador?: PrestadorLike | null,
): Record<string, string | number>[] {
  const lesionCodes = collectLesionCodesFromNota(nota);
  const causaExternaRaw = extractCieCode(nota.codigoCIECausaExterna);
  const hasCausaExterna = causaExternaRaw && isCieCausaExterna(causaExternaRaw);
  if (lesionCodes.length === 0 && !hasCausaExterna) return [];

  const clues = (context.clues || '').trim() || '9998';
  const curpPaciente = trabajador?.curp
    ? formatCURP(trabajador.curp) || CURP_GENERICA
    : CURP_GENERICA;
  const sexoStr = (trabajador?.sexo as string) || '';
  const sexo = sexoStr.toLowerCase().startsWith('f')
    ? 2
    : sexoStr.toLowerCase().startsWith('m')
      ? 1
      : 1;

  const nacionalidadClave = (trabajador?.nacionalidad as string)?.trim?.();
  const getPais = context.getPaisCatalogKeyFromNacionalidad;
  const paisOrigen =
    nacionalidadClave && getPais
      ? (getPais(nacionalidadClave) ?? PAIS_NO_ESPECIFICADO)
      : getPais
        ? PAIS_NO_ESPECIFICADO
        : DEFAULT_PAIS_MEXICO;
  const entidadNacimiento =
    paisOrigen !== DEFAULT_PAIS_MEXICO
      ? '88'
      : (trabajador?.entidadNacimiento as string) || '99';

  const codigoCIEAfeccionPrincipal = lesionCodes[0]?.trim() || 'S00';
  const codigoCIECausaExterna = hasCausaExterna
    ? causaExternaRaw!.trim()
    : 'V99';

  const nombreCompletoPrestador = (prestador?.nombre ?? '').trim();
  const parsed = nombreCompletoPrestador
    ? parseNombreCompleto(nombreCompletoPrestador)
    : null;
  const curpResponsable = prestador?.curp
    ? formatCURP(prestador.curp) || CURP_GENERICA
    : CURP_GENERICA;
  const nombreResponsable =
    normalizeNameForGiis(parsed?.nombrePrestador) || DEFAULT_NA;
  const primerApellidoResponsable =
    normalizeNameForGiis(parsed?.primerApellidoPrestador) || DEFAULT_NA;
  const segundoApellidoResponsable =
    normalizeNameForGiis(parsed?.segundoApellidoPrestador) || DEFAULT_XX;

  const folio =
    typeof nota._id === 'string'
      ? nota._id.slice(-8).padStart(8, '0')
      : String(nota._id ?? '')
          .slice(-8)
          .padStart(8, '0') || '00000001';

  const fechaNota = toDDMMAAAA(nota.fechaNotaMedica) || '01/01/2020';

  const valueByField: Record<string, string | number> = {
    clues: formatCLUES(clues) || clues,
    folio: folio.slice(0, 8),
    curpPaciente,
    nombre: normalizeNameForGiis(trabajador?.nombre as string) || DEFAULT_XX,
    primerApellido:
      normalizeNameForGiis(trabajador?.primerApellido as string) || DEFAULT_XX,
    segundoApellido:
      normalizeNameForGiis(trabajador?.segundoApellido as string) || DEFAULT_XX,
    fechaNacimiento: toDDMMAAAA(trabajador?.fechaNacimiento) || '09/09/9999',
    paisOrigen,
    entidadNacimiento,
    escolaridad:
      trabajador?.escolaridad != null
        ? appEscolaridadToCatalogKey(trabajador.escolaridad as string)
        : 88,
    sabeLeerEscribir: 9,
    sexo,
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
    fechaEvento: fechaNota,
    horaEvento: HORA_IGNORADA,
    diaFestivo: 2,
    sitioOcurrencia: 0,
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
    sospechaBajoEfectosDe: '4',
    intencionalidad: 1,
    eventoRepetido: 1,
    agenteLesion: 26,
    especifique: '',
    lesionadoVehiculoMotor: -1,
    usoEquipoSeguridad: -1,
    equipoUtilizado: -1,
    especifiqueEquipo: '',
    tipoViolencia: '-1',
    numeroAgresores: -1,
    parentescoAfectado: -1,
    sexoAgresor: -1,
    edadAgresor: 0,
    agresorBajoEfectos: '-1',
    fechaAtencion: fechaNota,
    horaAtencion: HORA_IGNORADA,
    servicioAtencion: 1,
    especifiqueServicio: '',
    tipoAtencion: '1',
    areaAnatomica: 0,
    especifiqueArea: '',
    consecuenciaGravedad: 0,
    especifiqueConsecuencia: '',
    descripcionAfeccionPrincipal: 'AFECCION PRINCIPAL',
    codigoCIEAfeccionPrincipal,
    numeroAfeccion: 1,
    descripcionAfeccion: 'AFECCION TRATADA',
    codigoCIEAfeccion: codigoCIEAfeccionPrincipal,
    afeccionPrincipalReseleccionada: codigoCIEAfeccionPrincipal,
    causaExterna: (nota.causaExterna as string)?.trim() || 'CAUSA EXTERNA',
    codigoCIECausaExterna,
    despuesAtencion: 1,
    especifiqueDestino: '',
    ministerioPublico: 2,
    folioCertificadoDefuncion: '',
    responsableAtencion: 1,
    paisNacimiento: DEFAULT_PAIS_MEXICO,
    curpResponsable,
    nombreResponsable,
    primerApellidoResponsable,
    segundoApellidoResponsable,
    cedulaResponsable: '0',
  };

  const schema = LES_SCHEMA;
  const row: Record<string, string | number> = {};
  for (const field of schema.fields) {
    if (valueByField[field.name] !== undefined) {
      row[field.name] = valueByField[field.name];
    } else if (field.requiredColumn) {
      row[field.name] = field.type?.kind === 'numeric' ? -1 : DEFAULT_XX;
    } else {
      row[field.name] = '';
    }
  }
  return [row];
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

  const clues = (context.clues || '').trim() || '9998';
  const curpPaciente = lesion.curpPaciente
    ? formatCURP(lesion.curpPaciente as string) ||
      (trabajador?.curp ? formatCURP(trabajador.curp) : '') ||
      CURP_GENERICA
    : (trabajador?.curp ? formatCURP(trabajador.curp) : '') || CURP_GENERICA;

  const tipoAtencionStr = joinWithAmp(lesion.tipoAtencion) || '1';
  const tipoViolenciaStr =
    lesion.intencionalidad === 2 || lesion.intencionalidad === 3
      ? joinWithAmp(lesion.tipoViolencia) || '-1'
      : '-1';

  const valueByField: Record<string, string | number> = {
    clues: formatCLUES(clues) || clues,
    folio:
      String(lesion.folio ?? '')
        .padStart(8, '0')
        .slice(0, 8) || '00000001',
    curpPaciente,
    nombre:
      (trabajador?.nombre as string) || lesion.curpPaciente ? 'XX' : DEFAULT_XX,
    primerApellido: (trabajador?.primerApellido as string) || DEFAULT_XX,
    segundoApellido: (trabajador?.segundoApellido as string) || DEFAULT_XX,
    fechaNacimiento:
      toDDMMAAAA(lesion.fechaNacimiento || trabajador?.fechaNacimiento) ||
      '09/09/9999',
    paisOrigen: DEFAULT_PAIS_MEXICO,
    entidadNacimiento:
      (trabajador?.entidadNacimiento as string) ||
      (lesion.curpPaciente ? '99' : '99'),
    escolaridad:
      trabajador?.escolaridad != null
        ? appEscolaridadToCatalogKey(trabajador.escolaridad as string)
        : 88,
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
    fechaEvento:
      toDDMMAAAA(lesion.fechaEvento) ||
      toDDMMAAAA(lesion.fechaAtencion) ||
      '01/01/2020',
    horaEvento:
      lesion.horaEvento && /^\d{1,2}:\d{2}$/.test(lesion.horaEvento)
        ? lesion.horaEvento
        : HORA_IGNORADA,
    diaFestivo: lesion.diaFestivo ?? 2,
    sitioOcurrencia: lesion.sitioOcurrencia ?? 0,
    entidadOcurrencia: lesion.entidadOcurrencia ?? '99',
    municipioOcurrencia: lesion.municipioOcurrencia ?? '998',
    localidadOcurrencia: lesion.localidadOcurrencia ?? '9998',
    otraLocalidad: lesion.otraLocalidad ?? '',
    codigoPostal: lesion.codigoPostal ?? '00000',
    tipoVialidad: lesion.tipoVialidad ?? 99,
    nombreVialidad: lesion.nombreVialidad ?? 'NO ESPECIFICADO',
    numeroExterior: lesion.numeroExterior ?? '0',
    tipoAsentamiento: lesion.tipoAsentamiento ?? 46,
    nombreAsentamiento: lesion.nombreAsentamiento ?? 'NO ESPECIFICADO',
    atencionPreHospitalaria: lesion.atencionPreHospitalaria ?? 2,
    tiempoTrasladoUH: lesion.tiempoTrasladoUH ?? '',
    sospechaBajoEfectosDe: lesion.sospechaBajoEfectosDe ?? '5',
    intencionalidad: lesion.intencionalidad ?? 1,
    eventoRepetido: lesion.eventoRepetido ?? 1,
    agenteLesion:
      lesion.agenteLesion ??
      (lesion.intencionalidad === 1 || lesion.intencionalidad === 4 ? 26 : 27),
    especifique: lesion.especifique ?? '',
    lesionadoVehiculoMotor: lesion.lesionadoVehiculoMotor ?? -1,
    usoEquipoSeguridad: lesion.usoEquipoSeguridad ?? -1,
    equipoUtilizado: lesion.equipoUtilizado ?? -1,
    especifiqueEquipo: lesion.especifiqueEquipo ?? '',
    tipoViolencia: tipoViolenciaStr,
    numeroAgresores: lesion.numeroAgresores ?? -1,
    parentescoAfectado: lesion.parentescoAfectado ?? -1,
    sexoAgresor: lesion.sexoAgresor ?? -1,
    edadAgresor: lesion.edadAgresor ?? 0,
    agresorBajoEfectos: lesion.agresorBajoEfectos ?? '-1',
    fechaAtencion: toDDMMAAAA(lesion.fechaAtencion) || '01/01/2020',
    horaAtencion:
      lesion.horaAtencion && /^\d{1,2}:\d{2}$/.test(lesion.horaAtencion)
        ? lesion.horaAtencion
        : HORA_IGNORADA,
    servicioAtencion: lesion.servicioAtencion ?? 1,
    especifiqueServicio: lesion.especifiqueServicio ?? '',
    tipoAtencion: tipoAtencionStr,
    areaAnatomica: lesion.areaAnatomica ?? 0,
    especifiqueArea: lesion.especifiqueArea ?? '',
    consecuenciaGravedad: lesion.consecuenciaGravedad ?? 0,
    especifiqueConsecuencia: lesion.especifiqueConsecuencia ?? '',
    descripcionAfeccionPrincipal:
      lesion.descripcionAfeccionPrincipal ?? 'AFECCION PRINCIPAL',
    codigoCIEAfeccionPrincipal:
      (lesion.codigoCIEAfeccionPrincipal as string)?.trim() || 'S00',
    numeroAfeccion: 1,
    descripcionAfeccion: lesion.descripcionAfeccion ?? 'AFECCION TRATADA',
    codigoCIEAfeccion:
      (
        lesion.afeccionesTratadas?.[0]?.split('#').pop() ||
        lesion.codigoCIEAfeccionPrincipal
      )?.trim() ||
      lesion.codigoCIEAfeccionPrincipal ||
      'S00',
    afeccionPrincipalReseleccionada:
      (lesion.afeccionPrincipalReseleccionada as string)?.trim() ||
      (lesion.codigoCIEAfeccionPrincipal as string)?.trim() ||
      'S00',
    causaExterna: (lesion.causaExterna as string)?.trim() || 'CAUSA EXTERNA',
    codigoCIECausaExterna:
      (lesion.codigoCIECausaExterna as string)?.trim() || 'V99',
    despuesAtencion: lesion.despuesAtencion ?? 1,
    especifiqueDestino: lesion.especifiqueDestino ?? '',
    ministerioPublico: lesion.ministerioPublico ?? 2,
    folioCertificadoDefuncion: lesion.folioCertificadoDefuncion ?? '',
    responsableAtencion: lesion.responsableAtencion ?? 1,
    paisNacimiento: DEFAULT_PAIS_MEXICO,
    curpResponsable:
      formatCURP(lesion.curpResponsable as string) || CURP_GENERICA,
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
