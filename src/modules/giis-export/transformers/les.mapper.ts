/**
 * LES (GIIS-B013 Lesiones) mapper — schema-driven.
 * Output keys and order come only from docs/nom-024/giis_schemas/LES.schema.json.
 * Source: Lesion document + optional Trabajador (paciente) + optional FirmanteData (medico/enfermera).
 */

import { loadGiisSchema, GiisSchema } from '../schema-loader';
import { toDDMMAAAA } from '../formatters/date.formatter';
import {
  formatCURP,
  formatCLUES,
  normalizeCIE10To4Chars,
  normalizeNameForGiis,
} from '../formatters/field.formatter';
import { toGIISNumeric } from '../formatters/sexo.formatter';
import { appEscolaridadToCatalogKey } from '../utils/escolaridad-giis.mapper';

export interface LesMapperContext {
  clues: string;
  /** Resolve cat_pais from nacionalidad (e.g. 248 NO ESPECIFICADO). */
  getPaisCatalogKeyFromNacionalidad?: (clave: string) => number | null;
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
  sexo?: string;
  escolaridad?: string;
  [key: string]: unknown;
}

/** Datos del firmante (médico o enfermera) para campos responsable en LES. */
export interface FirmanteDataForLesMapper {
  curp?: string;
  nombre: string;
  primerApellido?: string;
  segundoApellido?: string;
  cedula?: string;
  /** 1=Médico, 2=Enfermera */
  responsableAtencion: number;
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
 * Extrae el CATALOG_KEY para el reporte LES cuando el valor en BD está en formato compuesto.
 * - Municipio: "EFE_KEY-CATALOG_KEY" (ej. "25-001") → "001" (3 dígitos)
 * - Localidad: "EFE_KEY-MUN_KEY-CATALOG_KEY" (ej. "25-001-0001") → "0001" (4 dígitos)
 * Si el valor ya es solo CATALOG_KEY o default (998/9998), se usa tal cual.
 */
function extractCatalogKeyForLes(
  value: string | null | undefined,
  length: number,
  defaultValue: string,
): string {
  if (value == null || String(value).trim() === '') return defaultValue;
  const s = String(value).trim();
  const parts = s.split('-');
  const catalogKey = parts.length > 1 ? parts[parts.length - 1] : s;
  const padded = catalogKey.padStart(length, '0').slice(-length);
  return padded || defaultValue;
}

/**
 * GIIS-B013: Construye numeroAfeccion, descripcionAfeccion, codigoCIEAfeccion
 * a partir de afeccionesTratadas (formato Num#Desc#CIE por ítem).
 * Mínimo 1, máximo 6 afecciones; separador & entre ellas.
 * Si no aplican afecciones → vacío (en archivo: ||).
 */
function buildAfeccionesTratadasForLes(
  afeccionesTratadas: string[] | null | undefined,
  codigoCIEAfeccionPrincipal: string,
  _descripcionAfeccionPrincipal: string,
): {
  numeroAfeccion: string;
  descripcionAfeccion: string;
  codigoCIEAfeccion: string;
} {
  const valid = (afeccionesTratadas || [])
    .filter((s) => typeof s === 'string' && s.trim())
    .map((s) => {
      const parts = s.trim().split('#');
      const num = parseInt(parts[0], 10) || 1;
      const desc = (parts[1] || '').trim();
      const cie = normalizeCIE10To4Chars((parts[2] || '').trim());
      return { num, desc, cie };
    })
    .filter((x) => x.desc || x.cie);

  if (valid.length === 0) {
    return {
      numeroAfeccion: '',
      descripcionAfeccion: '',
      codigoCIEAfeccion: '',
    };
  }

  return {
    numeroAfeccion: valid.map((x) => String(x.num)).join('&'),
    descripcionAfeccion: valid
      .map((x) => x.desc || 'AFECCION TRATADA')
      .join('&'),
    codigoCIEAfeccion: valid
      .map(
        (x) =>
          x.cie || normalizeCIE10To4Chars(codigoCIEAfeccionPrincipal) || 'S000',
      )
      .join('&'),
  };
}

/**
 * Map one Lesion + optional Trabajador + optional FirmanteData to a flat record with keys = LES schema field names.
 * All 82 columns present; required ones get value or default.
 * Sexo se deriva de trabajador.sexo; códigos CIE se normalizan a 4 caracteres; responsable desde médico/enfermera firmante.
 */
export function mapLesionToLesRow(
  lesion: LesionLike,
  context: LesMapperContext,
  trabajador?: TrabajadorLike | null,
  firmanteData?: FirmanteDataForLesMapper | null,
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
    nombre: normalizeNameForGiis(trabajador?.nombre as string) || DEFAULT_XX,
    primerApellido:
      normalizeNameForGiis(trabajador?.primerApellido as string) || DEFAULT_XX,
    segundoApellido:
      normalizeNameForGiis(trabajador?.segundoApellido as string) || DEFAULT_XX,
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
    sexo: trabajador?.sexo
      ? Number(toGIISNumeric(trabajador.sexo as string) || '1')
      : lesion.sexo != null
        ? Number(lesion.sexo)
        : 1,
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
    municipioOcurrencia: extractCatalogKeyForLes(
      lesion.municipioOcurrencia,
      3,
      '998',
    ),
    localidadOcurrencia: extractCatalogKeyForLes(
      lesion.localidadOcurrencia,
      4,
      '9998',
    ),
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
      normalizeCIE10To4Chars(lesion.codigoCIEAfeccionPrincipal as string) ||
      'S000',
    ...(() => {
      const principalCie =
        normalizeCIE10To4Chars(lesion.codigoCIEAfeccionPrincipal as string) ||
        'S000';
      const principalDesc =
        (lesion.descripcionAfeccionPrincipal as string)?.trim() ||
        'AFECCION PRINCIPAL';
      const built = buildAfeccionesTratadasForLes(
        lesion.afeccionesTratadas,
        lesion.codigoCIEAfeccionPrincipal as string,
        principalDesc,
      );
      if (
        built.numeroAfeccion ||
        built.descripcionAfeccion ||
        built.codigoCIEAfeccion
      ) {
        return built;
      }
      return {
        numeroAfeccion: '1',
        descripcionAfeccion: principalDesc,
        codigoCIEAfeccion: principalCie,
      };
    })(),
    afeccionPrincipalReseleccionada:
      normalizeCIE10To4Chars(lesion.afeccionPrincipalReseleccionada) ||
      normalizeCIE10To4Chars(lesion.codigoCIEAfeccionPrincipal) ||
      'S000',
    causaExterna: (lesion.causaExterna as string)?.trim() || 'CAUSA EXTERNA',
    codigoCIECausaExterna:
      normalizeCIE10To4Chars(lesion.codigoCIECausaExterna) || 'V990',
    despuesAtencion: lesion.despuesAtencion ?? 1,
    especifiqueDestino: lesion.especifiqueDestino ?? '',
    ministerioPublico: lesion.ministerioPublico ?? 2,
    folioCertificadoDefuncion: lesion.folioCertificadoDefuncion ?? '',
    responsableAtencion:
      firmanteData?.responsableAtencion ?? lesion.responsableAtencion ?? 1,
    paisNacimiento: DEFAULT_PAIS_MEXICO,
    curpResponsable: firmanteData?.curp
      ? formatCURP(firmanteData.curp) || CURP_GENERICA
      : formatCURP(lesion.curpResponsable as string) || CURP_GENERICA,
    nombreResponsable: normalizeNameForGiis(firmanteData?.nombre) || 'NA',
    primerApellidoResponsable:
      normalizeNameForGiis(firmanteData?.primerApellido) || 'NA',
    segundoApellidoResponsable:
      normalizeNameForGiis(firmanteData?.segundoApellido) || DEFAULT_XX,
    cedulaResponsable: firmanteData?.cedula ?? '0',
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
