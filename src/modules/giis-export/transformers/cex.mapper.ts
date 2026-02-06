/**
 * CEX (GIIS-B015 Consulta externa) mapper — schema-driven.
 * Output keys and order come only from docs/nom-024/giis_schemas/CEX.schema.json.
 * Source: NotaMedica (consulta externa) + Trabajador (paciente).
 */

import { loadGiisSchema, GiisSchema } from '../schema-loader';
import { toDDMMAAAA } from '../formatters/date.formatter';
import { formatCURP } from '../formatters/field.formatter';

export interface CexMapperContext {
  clues: string;
}

/** NotaMedica-like: consulta externa document */
export interface ConsultaExternaLike {
  fechaNotaMedica?: Date;
  tensionArterialSistolica?: number;
  tensionArterialDiastolica?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  saturacionOxigeno?: number;
  codigoCIE10Principal?: string;
  codigosCIE10Complementarios?: string[];
  relacionTemporal?: number;
  primeraVezDiagnostico2?: boolean;
  codigoCIEDiagnostico2?: string;
  confirmacionDiagnostica?: boolean;
  [key: string]: unknown;
}

/** Trabajador-like: paciente data */
export interface TrabajadorLike {
  curp?: string;
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: Date;
  sexo?: string;
  entidadNacimiento?: string;
  [key: string]: unknown;
}

const CEX_SCHEMA = loadGiisSchema('CEX');

const DEFAULT_XX = 'XX';
const DEFAULT_PAIS_MEXICO = 142;
const CURP_GENERICA = 'XXXX999999XXXXXX99';
const DEFAULT_PROGRAMA_SMYMG = 0;
const DEFAULT_NA = 'NA';

/**
 * Extract CIE-10 code from "CODE - DESCRIPTION" or return as-is if no dash.
 */
export function extractCieCode(value: string | null | undefined): string {
  if (!value) return '';
  const s = value.trim();
  const dash = s.indexOf(' - ');
  return dash >= 0 ? s.slice(0, dash).trim() : s;
}

/**
 * Map one Consulta externa (NotaMedica) + optional Trabajador to a flat record with keys = CEX schema field names.
 * All 106 columns are present; required ones get value or default. No hardcoded field list — iterate schema.fields.
 */
export function mapNotaMedicaToCexRow(
  consulta: ConsultaExternaLike,
  context: CexMapperContext,
  trabajador?: TrabajadorLike | null,
): Record<string, string | number> {
  const schema = CEX_SCHEMA;
  const row: Record<string, string | number> = {};

  const clues = (context.clues || '').trim() || '9998';
  const curpPaciente = trabajador?.curp
    ? formatCURP(trabajador.curp) || CURP_GENERICA
    : CURP_GENERICA;
  const sexo = (trabajador?.sexo as string) || '';
  const sexoCURP = sexo.toLowerCase().startsWith('f') ? 2 : sexo.toLowerCase().startsWith('m') ? 1 : 1;
  const sexoBiologico = sexoCURP;

  const codigo1 = extractCieCode(consulta.codigoCIE10Principal);
  const comp = consulta.codigosCIE10Complementarios || [];
  const codigo2Raw = comp[0] ? extractCieCode(comp[0]) : (consulta.codigoCIEDiagnostico2 ? extractCieCode(consulta.codigoCIEDiagnostico2 as string) : '');
  const codigo3Raw = comp[1] ? extractCieCode(comp[1]) : '';
  const codigo2 = codigo2Raw || 'R69X';
  const codigo3 = codigo3Raw || 'R69X';

  const valueByField: Record<string, string | number> = {
    clues,
    paisNacimiento: DEFAULT_PAIS_MEXICO,
    curpPrestador: CURP_GENERICA,
    nombrePrestador: DEFAULT_NA,
    primerApellidoPrestador: DEFAULT_NA,
    segundoApellidoPrestador: DEFAULT_XX,
    tipoPersonal: 2,
    programaSMyMG: DEFAULT_PROGRAMA_SMYMG,
    curpPaciente,
    nombre: (trabajador?.nombre as string) || DEFAULT_XX,
    primerApellido: (trabajador?.primerApellido as string) || DEFAULT_XX,
    segundoApellido: (trabajador?.segundoApellido as string) || DEFAULT_XX,
    fechaNacimiento: toDDMMAAAA(trabajador?.fechaNacimiento) || '01/01/1900',
    paisNacPaciente: DEFAULT_PAIS_MEXICO,
    entidadNacimiento: (trabajador?.entidadNacimiento as string) || '99',
    sexoCURP,
    sexoBiologico,
    seAutodenominaAfromexicano: -1,
    seConsideraIndigena: -1,
    migrante: -1,
    paisProcedencia: -1,
    genero: 0,
    derechohabiencia: '1',
    fechaConsulta: toDDMMAAAA(consulta.fechaNotaMedica) || '',
    servicioAtencion: 1,
    peso: 999,
    talla: 999,
    circunferenciaCintura: 0,
    sistolica: consulta.tensionArterialSistolica ?? 0,
    diastolica: consulta.tensionArterialDiastolica ?? 0,
    frecuenciaCardiaca: consulta.frecuenciaCardiaca ?? 0,
    frecuenciaRespiratoria: consulta.frecuenciaRespiratoria ?? 0,
    temperatura: consulta.temperatura ?? 0,
    saturacionOxigeno: consulta.saturacionOxigeno ?? 0,
    glucemia: 0,
    tipoMedicion: -1,
    resultadoObtenidoaTravesde: -1,
    embarazadaSinDiabetes: 0,
    sintomaticoRespiratorioTb: -1,
    primeraVezAnio: 0,
    primeraVezUneme: -1,
    relacionTemporal: consulta.relacionTemporal ?? 0,
    codigoCIEDiagnostico1: codigo1 || 'R69X',
    confirmacionDiagnostica1: consulta.confirmacionDiagnostica ? 1 : 0,
    primeraVezDiagnostico2: consulta.primeraVezDiagnostico2 ? 1 : 0,
    codigoCIEDiagnostico2: codigo2,
    confirmacionDiagnostica2: -1,
    primeraVezDiagnostico3: consulta.primeraVezDiagnostico2 === false ? 0 : -1,
    codigoCIEDiagnostico3: codigo3,
    confirmacionDiagnostica3: -1,
    intervencionesSMyA: -1,
    atencionPregestacionalRT: -1,
    riesgo: '-1',
    relacionTemporalEmbarazo: -1,
    planSeguridad: -1,
    trimestreGestacional: -1,
    primeraVezAltoRiesgo: -1,
    complicacionPorDiabetes: -1,
    complicacionPorInfeccionUrinaria: -1,
    complicacionPorPreeclampsiaEclampsia: -1,
    complicacionPorHemorragia: -1,
    sospechaCovid19: -1,
    covid19Confirmado: -1,
    hipertensionarterialprexistente: -1,
    otrasAccPrescAcidoFolico: -1,
    otrasAccApoyoTraslado: -1,
    otrasACCApoyoTrasladoAME: -1,
    puerpera: -1,
    infeccionPuerperal: -1,
    terapiaHormonal: -1,
    periPostMenopausia: -1,
    its: -1,
    patologiaMamariaBenigna: -1,
    cancerMamario: -1,
    colposcopia: -1,
    cancerCervicouterino: -1,
    ninoSanoRT: -1,
    pruebaEDI: -1,
    resultadoEDI: -1,
    resultadoBattelle: -1,
    edasRT: -1,
    edasPlanTratamiento: -1,
    recuperadoDeshidratacion: -1,
    numeroSobresVSOTratamiento: 0,
    irasRT: -1,
    irasPlanTratamiento: -1,
    neumoniaRT: -1,
    aplicacionCedulaCancer: -1,
    informaPrevencionAccidentes: -1,
    sintomaDepresiva: -1,
    alteracionMemoria: -1,
    'aivd-ABVD': -1,
    sindromeCaidas: -1,
    incontinenciaUrinaria: -1,
    motricidad: -1,
    asesoriaNutricional: -1,
    numeroSobresVSOPromocion: 0,
    lineaVida: 0,
    cartillaSalud: 0,
    esquemaVacunacion: 0,
    referidoPor: -1,
    contrarreferido: 0,
    telemedicina: 0,
    teleconsulta: 0,
    estudiosTeleconsulta: '-1',
    modalidadConsulDist: -1,
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

export function getCexSchema(): GiisSchema {
  return CEX_SCHEMA;
}
