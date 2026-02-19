import type {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { formatearNombreTrabajador } from '../../../utils/names';
import { FooterFirmantesData } from '../interfaces/firmante-data.interface';

// ==================== ESTILOS ====================
const styles: StyleDictionary = {
  header: {
    fontSize: 15,
    bold: false,
    color: 'blue',
    decoration: 'underline',
    decorationColor: 'red',
  },
  nombreEmpresa: {
    fontSize: 15,
    bold: true,
    alignment: 'center',
    lineHeight: 1,
  },
  fecha: {
    fontSize: 11,
    alignment: 'right',
  },
  sectionHeader: {
    fontSize: 12,
    bold: true,
    alignment: 'left',
    margin: [0, 8, 0, 4],
  },
  label: { fontSize: 11 },
  paragraph: { fontSize: 11, alignment: 'justify' },
  tableHeader: {
    fillColor: '#343A40',
    color: '#FFFFFF',
    bold: true,
    fontSize: 10,
    alignment: 'center',
    margin: [3, 3, 3, 3],
  },
  tableCell: {
    fontSize: 10,
    alignment: 'left',
    margin: [3, 3, 3, 3],
  },
};

const headerText: Content = {
  text: '                                                       REPORTE DE LESIÓN Y/O VIOLENCIA\n',
  style: 'header',
  alignment: 'right',
  margin: [0, 35, 40, 0],
};

function formatearFechaUTC(fecha: Date | undefined): string {
  if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) return '-';
  const d = new Date(fecha);
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const año = d.getUTCFullYear();
  return `${dia}-${mes}-${año}`;
}

function formatearHora(hora: string | undefined): string {
  if (!hora || typeof hora !== 'string') return '-';
  return hora === '99:99' ? 'SE DESCONOCE' : hora;
}

// Mapeos estáticos (iguales al VisualizadorReporteLesion.vue)
const INTENCIONALIDAD_MAP: Record<number, string> = {
  1: 'ACCIDENTAL',
  2: 'VIOLENCIA FAMILIAR',
  3: 'VIOLENCIA NO FAMILIAR',
  4: 'AUTOINFLIGIDO',
  11: 'TRATA DE PERSONAS',
};
const EVENTO_REPETIDO_MAP: Record<number, string> = {
  1: 'ÚNICA VEZ',
  2: 'REPETIDO',
};
const TIPO_VIOLENCIA_MAP: Record<number, string> = {
  6: 'VIOLENCIA FÍSICA',
  7: 'VIOLENCIA SEXUAL',
  8: 'VIOLENCIA PSICOLÓGICA',
  9: 'VIOLENCIA ECONÓMICA/PATRIMONIAL',
  10: 'ABANDONO Y/O NEGLIGENCIA',
};
const NUMERO_AGRESORES_MAP: Record<number, string> = {
  1: 'ÚNICO',
  2: 'MÁS DE UNO',
  3: 'NO ESPECIFICADO',
};
const PARENTESCO_MAP: Record<number, string> = {
  0: 'NO ESPECIFICADO',
  1: 'PADRE',
  2: 'MADRE',
  3: 'CÓNYUGE/PAREJA/NOVIO',
  4: 'OTRO PARIENTE',
  5: 'PADRASTRO',
  6: 'MADRASTRA',
  7: 'CONOCIDO SIN PARENTESCO',
  8: 'DESCONOCIDO',
  9: 'HIJA/HIJO',
  10: 'OTRO',
  99: 'SE IGNORA',
};
const SEXO_AGRESOR_MAP: Record<number, string> = {
  0: 'NO ESPECIFICADO',
  1: 'HOMBRE',
  2: 'MUJER',
  3: 'INTERSEXUAL',
  9: 'SE IGNORA',
};
const LESIONADO_VEHICULO_MAP: Record<number, string> = {
  1: 'CONDUCTOR',
  2: 'OCUPANTE',
  3: 'PEATÓN',
  4: 'SE IGNORA',
};
const USO_EQUIPO_MAP: Record<number, string> = {
  1: 'SI',
  2: 'NO',
  9: 'SE IGNORA',
};
const EQUIPO_UTILIZADO_MAP: Record<number, string> = {
  1: 'CINTURÓN',
  2: 'CASCO',
  3: 'SILLA INFANTIL',
  4: 'OTRO',
};
const ATENCION_PREHOSP_MAP: Record<number, string> = {
  1: 'SI',
  2: 'NO',
};
const DIA_FESTIVO_MAP: Record<number, string> = {
  1: 'SI',
  2: 'NO',
};
const BAJO_EFECTOS_MAP: Record<number, string> = {
  1: 'ALCOHOL',
  2: 'DROGA POR INDICACIÓN MÉDICA',
  3: 'DROGAS ILEGALES',
  4: 'SE IGNORA',
  5: 'NINGUNA',
};
const SERVICIO_ATENCION_MAP: Record<number, string> = {
  1: 'CONSULTA EXTERNA',
  2: 'HOSPITALIZACION',
  3: 'URGENCIAS',
  4: 'SERVICIO ESPECIALIZADO DE ATENCION A LA VIOLENCIA',
  5: 'OTRO SERVICIO',
};
const TIPO_ATENCION_MAP: Record<number, string> = {
  1: 'TRATAMIENTO MÉDICO',
  2: 'TRATAMIENTO PSICOLÓGICO',
  3: 'TRATAMIENTO QUIRÚRGICO',
  4: 'TRATAMIENTO PSIQUIÁTRICO',
  5: 'CONSEJERÍA',
  6: 'OTRO',
  7: 'PÍLDORA ANTICONCEPTIVA DE EMERGENCIA',
  8: 'PROFILAXIS VIH',
  9: 'PROFILAXIS OTRAS ITS',
};

const RESPONSABLE_ATENCION: Record<number, string> = {
  1: 'Médico Tratante',
  2: 'Psicólogo Tratante',
  3: 'Trabajador Social',
};

function bajoEfectosToLabels(str: string | undefined): string {
  if (!str || typeof str !== 'string') return '-';
  return str
    .split('&')
    .map((c) => BAJO_EFECTOS_MAP[Number(c)] || c)
    .join(', ');
}

function formatAfeccionesTratadas(arr: string[] | undefined): string {
  if (!Array.isArray(arr) || arr.length === 0) return '-';
  return arr
    .map((s) => {
      const p = (s || '').split('#');
      return p.length >= 2 ? `${p[0]}. ${p[1]}${p[2] ? ` (${p[2]})` : ''}` : s;
    })
    .join('; ');
}

// ==================== INTERFACES ====================
interface TrabajadorLesion {
  primerApellido: string;
  segundoApellido: string;
  nombre: string;
  edad: string;
  puesto: string;
  sexo: string;
  escolaridad: string;
  antiguedad: string;
  telefono: string;
  estadoCivil: string;
  numeroEmpleado: string;
  curp: string;
}

interface DatosLesion {
  folio: string;
  fechaReporteLesion?: Date;
  fechaEvento?: Date;
  horaEvento?: string;
  diaFestivo?: number;
  eventoRepetido?: number;
  sitioOcurrencia?: number;
  sitioOcurrenciaLabel?: string;
  entidadOcurrencia?: string;
  entidadLabel?: string;
  municipioOcurrencia?: string;
  municipioLabel?: string;
  localidadOcurrencia?: string;
  localidadLabel?: string;
  otraLocalidad?: string;
  codigoPostal?: string;
  tipoVialidad?: number;
  tipoVialidadLabel?: string;
  nombreVialidad?: string;
  numeroExterior?: string;
  tipoAsentamiento?: number;
  tipoAsentamientoLabel?: string;
  nombreAsentamiento?: string;
  intencionalidad: number;
  agenteLesion?: number;
  agenteLesionLabel?: string;
  especifique?: string;
  tipoViolencia?: number[];
  numeroAgresores?: number;
  parentescoAfectado?: number;
  sexoAgresor?: number;
  edadAgresor?: number | string;
  agresorBajoEfectos?: string;
  lesionadoVehiculoMotor?: number;
  usoEquipoSeguridad?: number;
  equipoUtilizado?: number;
  especifiqueEquipo?: string;
  sospechaBajoEfectosDe?: string;
  atencionPreHospitalaria?: number;
  tiempoTrasladoUH?: string;
  fechaAtencion: Date;
  horaAtencion?: string;
  servicioAtencion?: number;
  especifiqueServicio?: string;
  tipoAtencion?: number[];
  areaAnatomica?: number;
  areaAnatomicaLabel?: string;
  especifiqueArea?: string;
  consecuenciaGravedad?: number;
  consecuenciaGravedadLabel?: string;
  especifiqueConsecuencia?: string;
  codigoCIEAfeccionPrincipal: string;
  descripcionAfeccionPrincipal?: string;
  codigoCIECausaExterna: string;
  causaExterna?: string;
  afeccionPrincipalReseleccionada?: string;
  afeccionesTratadas?: string[];
  responsableAtencion?: number;
  estado?: string;
}

interface MedicoFirmante {
  nombre: string;
  tituloProfesional: string;
  numeroCedulaProfesional: string;
  especialistaSaludTrabajo: string;
  numeroCedulaEspecialista: string;
  nombreCredencialAdicional: string;
  numeroCredencialAdicional: string;
  firma: { data: string; contentType: string } | null;
}

interface EnfermeraFirmante {
  nombre: string;
  sexo: string;
  tituloProfesional: string;
  numeroCedulaProfesional: string;
  nombreCredencialAdicional: string;
  numeroCredencialAdicional: string;
  firma: { data: string; contentType: string } | null;
}

interface ProveedorSalud {
  nombre: string;
  pais: string;
  direccion: string;
  municipio: string;
  estado: string;
  telefono: string;
  sitioWeb: string;
  logotipoEmpresa: { data: string; contentType: string } | null;
}

function v(val: unknown, def = '-'): string {
  if (val === null || val === undefined || val === '') return def;
  return String(val).trim() || def;
}

// ==================== INFORME PRINCIPAL ====================
export const lesionInforme = (
  nombreEmpresa: string,
  trabajador: TrabajadorLesion,
  datosLesion: DatosLesion,
  medicoFirmante: MedicoFirmante | null,
  enfermeraFirmante: EnfermeraFirmante | null,
  proveedorSalud: ProveedorSalud,
  footerFirmantesData?: FooterFirmantesData,
): TDocumentDefinitions => {
  const usarMedico = !!medicoFirmante?.nombre;
  const usarEnfermera = !usarMedico && !!enfermeraFirmante?.nombre;
  const firmanteActivo = usarMedico
    ? medicoFirmante
    : usarEnfermera
      ? enfermeraFirmante
      : null;

  const firma: Content = (
    footerFirmantesData?.esDocumentoFinalizado
      ? footerFirmantesData?.finalizador?.firma?.data
      : firmanteActivo?.firma?.data
  )
    ? {
        image: `assets/signatories/${
          footerFirmantesData?.esDocumentoFinalizado
            ? footerFirmantesData?.finalizador?.firma?.data
            : firmanteActivo?.firma?.data
        }`,
        width: 65,
      }
    : { text: '' };

  const logo: Content = proveedorSalud.logotipoEmpresa?.data
    ? {
        image: `assets/providers-logos/${proveedorSalud.logotipoEmpresa.data}`,
        width: 55,
        margin: [40, 20, 0, 0],
      }
    : {
        image: 'assets/RamazziniBrand600x600.png',
        width: 55,
        margin: [40, 20, 0, 0],
      };

  const fechaReporte =
    datosLesion.fechaReporteLesion || datosLesion.fechaAtencion;
  const responsableTexto =
    datosLesion.responsableAtencion != null
      ? RESPONSABLE_ATENCION[datosLesion.responsableAtencion] || ''
      : '';

  const tipoViolenciaLabels =
    Array.isArray(datosLesion.tipoViolencia) &&
    datosLesion.tipoViolencia.length > 0
      ? datosLesion.tipoViolencia
          .map((c) => TIPO_VIOLENCIA_MAP[c] || c)
          .join(', ')
      : '';

  const tipoAtencionLabels =
    Array.isArray(datosLesion.tipoAtencion) &&
    datosLesion.tipoAtencion.length > 0
      ? datosLesion.tipoAtencion
          .map((c) => TIPO_ATENCION_MAP[c] || c)
          .join(', ')
      : '';

  const contenido: Content[] = [
    // Cabecera
    {
      style: 'table',
      table: {
        widths: ['75%', '25%'],
        body: [
          [
            { text: '', style: 'fecha' },
            {
              text: [
                { text: 'Folio: ', style: 'fecha', bold: false },
                { text: datosLesion.folio, style: 'fecha', bold: true },
              ],
              margin: [0, 3, 0, 0],
            },
          ],
          [
            { text: '' },
            {
              text: [
                { text: 'Fecha reporte: ', style: 'fecha', bold: false },
                {
                  text: formatearFechaUTC(fechaReporte),
                  style: 'fecha',
                  bold: true,
                },
              ],
              margin: [0, 3, 0, 0],
            },
          ],
        ],
      },
      layout: 'noBorders',
    },
    // Datos del trabajador
    {
      text: formatearNombreTrabajador(trabajador),
      style: 'nombreEmpresa',
      alignment: 'left',
      margin: [0, 8, 0, 4],
    },
    {
      text: `Trabajador(a) de ${nombreEmpresa}${trabajador.puesto ? ` - Puesto: ${trabajador.puesto}` : ''} - Edad: ${trabajador.edad} - Sexo: ${trabajador.sexo} - Escolaridad: ${trabajador.escolaridad} - Antigüedad: ${trabajador.antiguedad} - CURP: ${trabajador.curp || '-'}`,
      style: 'paragraph',
      margin: [0, 0, 0, 12],
    },

    // 1. ¿Cuándo ocurrió el evento?
    { text: '1. ¿Cuándo ocurrió el evento?', style: 'sectionHeader' },
    {
      style: 'table',
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            { text: 'Fecha reporte', style: 'tableCell' },
            {
              text: formatearFechaUTC(datosLesion.fechaReporteLesion),
              style: 'tableCell',
            },
            { text: 'Fecha evento', style: 'tableCell' },
            {
              text: formatearFechaUTC(datosLesion.fechaEvento),
              style: 'tableCell',
            },
          ],
          [
            { text: 'Hora evento', style: 'tableCell' },
            {
              text: formatearHora(datosLesion.horaEvento),
              style: 'tableCell',
            },
            { text: 'Día festivo', style: 'tableCell' },
            {
              text:
                datosLesion.diaFestivo != null
                  ? (DIA_FESTIVO_MAP[datosLesion.diaFestivo] ??
                    String(datosLesion.diaFestivo))
                  : '-',
              style: 'tableCell',
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 8],
    },

    // 2. ¿Dónde ocurrió el evento?
    { text: '2. ¿Dónde ocurrió el evento?', style: 'sectionHeader' },
    {
      style: 'table',
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            { text: 'Sitio ocurrencia', style: 'tableCell' },
            {
              text: v(
                datosLesion.sitioOcurrenciaLabel || datosLesion.sitioOcurrencia,
              ),
              style: 'tableCell',
            },
            { text: 'C.P.', style: 'tableCell' },
            { text: v(datosLesion.codigoPostal), style: 'tableCell' },
          ],
          [
            { text: 'Entidad', style: 'tableCell' },
            {
              text: v(
                datosLesion.entidadLabel || datosLesion.entidadOcurrencia,
              ),
              style: 'tableCell',
            },
            { text: 'Municipio', style: 'tableCell' },
            {
              text: v(
                datosLesion.municipioLabel || datosLesion.municipioOcurrencia,
              ),
              style: 'tableCell',
            },
          ],
          [
            { text: 'Localidad', style: 'tableCell' },
            {
              text: v(
                datosLesion.localidadLabel || datosLesion.localidadOcurrencia,
              ),
              style: 'tableCell',
            },
            { text: 'Otra localidad', style: 'tableCell' },
            { text: v(datosLesion.otraLocalidad), style: 'tableCell' },
          ],
          [
            { text: 'Tipo vialidad', style: 'tableCell' },
            {
              text: v(
                datosLesion.tipoVialidadLabel || datosLesion.tipoVialidad,
              ),
              style: 'tableCell',
            },
            { text: 'Nombre vialidad', style: 'tableCell' },
            { text: v(datosLesion.nombreVialidad), style: 'tableCell' },
          ],
          [
            { text: 'Núm. ext.', style: 'tableCell' },
            { text: v(datosLesion.numeroExterior), style: 'tableCell' },
            { text: 'Tipo asentamiento', style: 'tableCell' },
            {
              text: v(
                datosLesion.tipoAsentamientoLabel ||
                  datosLesion.tipoAsentamiento,
              ),
              style: 'tableCell',
            },
          ],
          [
            { text: 'Nombre asentamiento', style: 'tableCell' },
            {
              text: v(datosLesion.nombreAsentamiento),
              style: 'tableCell',
              colSpan: 3,
            },
            {},
            {},
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 8],
    },

    // 3. ¿Cómo ocurrió el evento?
    { text: '3. ¿Cómo ocurrió el evento?', style: 'sectionHeader' },
    {
      style: 'table',
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            { text: 'Intencionalidad', style: 'tableCell' },
            {
              text:
                datosLesion.intencionalidad != null
                  ? (INTENCIONALIDAD_MAP[datosLesion.intencionalidad] ??
                    String(datosLesion.intencionalidad))
                  : '-',
              style: 'tableCell',
            },
            { text: 'Evento repetido', style: 'tableCell' },
            {
              text:
                datosLesion.eventoRepetido != null
                  ? (EVENTO_REPETIDO_MAP[datosLesion.eventoRepetido] ??
                    String(datosLesion.eventoRepetido))
                  : '-',
              style: 'tableCell',
            },
          ],
          [
            { text: 'Agente lesión', style: 'tableCell' },
            {
              text: v(
                datosLesion.agenteLesionLabel || datosLesion.agenteLesion,
              ),
              style: 'tableCell',
              colSpan: 3,
            },
            {},
            {},
          ],
          ...(datosLesion.agenteLesion === 25
            ? [
                [
                  { text: 'Especifique', style: 'tableCell' },
                  {
                    text: v(datosLesion.especifique),
                    style: 'tableCell',
                    colSpan: 3,
                  },
                  {},
                  {},
                ],
              ]
            : []),
          ...((datosLesion.intencionalidad === 2 ||
            datosLesion.intencionalidad === 3) &&
          tipoViolenciaLabels
            ? [
                [
                  { text: 'Tipo violencia', style: 'tableCell' },
                  { text: tipoViolenciaLabels, style: 'tableCell' },
                  { text: 'Núm. agresores', style: 'tableCell' },
                  {
                    text:
                      datosLesion.numeroAgresores != null &&
                      datosLesion.numeroAgresores !== -1
                        ? (NUMERO_AGRESORES_MAP[datosLesion.numeroAgresores] ??
                          String(datosLesion.numeroAgresores))
                        : '-',
                    style: 'tableCell',
                  },
                ],
              ]
            : []),
          ...(datosLesion.numeroAgresores === 1
            ? [
                [
                  { text: 'Parentesco con el afectado', style: 'tableCell' },
                  {
                    text:
                      datosLesion.parentescoAfectado != null &&
                      datosLesion.parentescoAfectado !== -1
                        ? (PARENTESCO_MAP[datosLesion.parentescoAfectado] ??
                          String(datosLesion.parentescoAfectado))
                        : '-',
                    style: 'tableCell',
                  },
                  { text: 'Sexo agresor', style: 'tableCell' },
                  {
                    text:
                      datosLesion.sexoAgresor != null &&
                      datosLesion.sexoAgresor !== -1
                        ? (SEXO_AGRESOR_MAP[datosLesion.sexoAgresor] ??
                          String(datosLesion.sexoAgresor))
                        : '-',
                    style: 'tableCell',
                  },
                ],
                [
                  { text: 'Edad agresor', style: 'tableCell' },
                  { text: v(datosLesion.edadAgresor), style: 'tableCell' },
                  { text: 'Agresor bajo efectos', style: 'tableCell' },
                  {
                    text: bajoEfectosToLabels(datosLesion.agresorBajoEfectos),
                    style: 'tableCell',
                  },
                ],
              ]
            : []),
          ...(datosLesion.agenteLesion === 20
            ? [
                [
                  { text: 'Lesionado vehículo motor', style: 'tableCell' },
                  {
                    text:
                      datosLesion.lesionadoVehiculoMotor != null &&
                      datosLesion.lesionadoVehiculoMotor !== -1
                        ? (LESIONADO_VEHICULO_MAP[
                            datosLesion.lesionadoVehiculoMotor
                          ] ?? String(datosLesion.lesionadoVehiculoMotor))
                        : '-',
                    style: 'tableCell',
                  },
                  { text: 'Uso equipo seguridad', style: 'tableCell' },
                  {
                    text:
                      datosLesion.usoEquipoSeguridad != null &&
                      datosLesion.usoEquipoSeguridad !== -1
                        ? (USO_EQUIPO_MAP[datosLesion.usoEquipoSeguridad] ??
                          String(datosLesion.usoEquipoSeguridad))
                        : '-',
                    style: 'tableCell',
                  },
                ],
                ...(datosLesion.usoEquipoSeguridad === 1
                  ? [
                      [
                        { text: 'Equipo utilizado', style: 'tableCell' },
                        {
                          text:
                            datosLesion.equipoUtilizado != null &&
                            datosLesion.equipoUtilizado !== -1
                              ? (EQUIPO_UTILIZADO_MAP[
                                  datosLesion.equipoUtilizado
                                ] ?? String(datosLesion.equipoUtilizado))
                              : '-',
                          style: 'tableCell',
                        },
                        { text: 'Especifique equipo', style: 'tableCell' },
                        {
                          text: v(datosLesion.especifiqueEquipo),
                          style: 'tableCell',
                        },
                      ],
                    ]
                  : []),
              ]
            : []),
          [
            { text: 'Sospecha bajo efectos', style: 'tableCell' },
            {
              text: bajoEfectosToLabels(datosLesion.sospechaBajoEfectosDe),
              style: 'tableCell',
            },
            { text: 'Atención prehospitalaria', style: 'tableCell' },
            {
              text:
                datosLesion.atencionPreHospitalaria != null
                  ? (ATENCION_PREHOSP_MAP[
                      datosLesion.atencionPreHospitalaria
                    ] ?? String(datosLesion.atencionPreHospitalaria))
                  : '-',
              style: 'tableCell',
            },
          ],
          ...(datosLesion.atencionPreHospitalaria === 1
            ? [
                [
                  { text: 'Tiempo traslado UH', style: 'tableCell' },
                  {
                    text: formatearHora(datosLesion.tiempoTrasladoUH),
                    style: 'tableCell',
                    colSpan: 3,
                  },
                  {},
                  {},
                ],
              ]
            : []),
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 8],
    },

    // 4. Atención recibida
    { text: '4. Atención recibida', style: 'sectionHeader' },
    {
      style: 'table',
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            { text: 'Fecha atención', style: 'tableCell' },
            {
              text: formatearFechaUTC(datosLesion.fechaAtencion),
              style: 'tableCell',
            },
            { text: 'Hora atención', style: 'tableCell' },
            {
              text: formatearHora(datosLesion.horaAtencion),
              style: 'tableCell',
            },
          ],
          [
            { text: 'Servicio atención', style: 'tableCell' },
            {
              text:
                datosLesion.servicioAtencion != null
                  ? (SERVICIO_ATENCION_MAP[datosLesion.servicioAtencion] ??
                    String(datosLesion.servicioAtencion))
                  : '-',
              style: 'tableCell',
            },
            { text: 'Tipo atención', style: 'tableCell' },
            { text: tipoAtencionLabels || '-', style: 'tableCell' },
          ],
          ...(datosLesion.servicioAtencion === 5
            ? [
                [
                  { text: 'Especifique servicio', style: 'tableCell' },
                  {
                    text: v(datosLesion.especifiqueServicio),
                    style: 'tableCell',
                    colSpan: 3,
                  },
                  {},
                  {},
                ],
              ]
            : []),
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 8],
    },

    // 5. Evaluación clínica / Diagnóstico
    { text: '5. Evaluación clínica / Diagnóstico', style: 'sectionHeader' },
    {
      style: 'table',
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            { text: 'Área anatómica', style: 'tableCell' },
            {
              text: v(
                datosLesion.areaAnatomicaLabel || datosLesion.areaAnatomica,
              ),
              style: 'tableCell',
            },
            { text: 'Consecuencia gravedad', style: 'tableCell' },
            {
              text: v(
                datosLesion.consecuenciaGravedadLabel ||
                  datosLesion.consecuenciaGravedad,
              ),
              style: 'tableCell',
            },
          ],
          ...(datosLesion.areaAnatomica === 16
            ? [
                [
                  { text: 'Especifique área', style: 'tableCell' },
                  {
                    text: v(datosLesion.especifiqueArea),
                    style: 'tableCell',
                    colSpan: 3,
                  },
                  {},
                  {},
                ],
              ]
            : []),
          ...(datosLesion.consecuenciaGravedad === 22
            ? [
                [
                  { text: 'Especifique consecuencia', style: 'tableCell' },
                  {
                    text: v(datosLesion.especifiqueConsecuencia),
                    style: 'tableCell',
                    colSpan: 3,
                  },
                  {},
                  {},
                ],
              ]
            : []),
          [
            { text: 'Código CIE afección principal', style: 'tableCell' },
            {
              text: v(datosLesion.codigoCIEAfeccionPrincipal),
              style: 'tableCell',
            },
            { text: 'Código CIE causa externa', style: 'tableCell' },
            { text: v(datosLesion.codigoCIECausaExterna), style: 'tableCell' },
          ],
          [
            { text: 'Descripción afección principal', style: 'tableCell' },
            {
              text: v(datosLesion.descripcionAfeccionPrincipal),
              style: 'tableCell',
              colSpan: 3,
            },
            {},
            {},
          ],
          [
            { text: 'Causa externa', style: 'tableCell' },
            {
              text: v(datosLesion.causaExterna),
              style: 'tableCell',
              colSpan: 3,
            },
            {},
            {},
          ],
          ...(datosLesion.afeccionPrincipalReseleccionada
            ? [
                [
                  {
                    text: 'Afección principal reseleccionada',
                    style: 'tableCell',
                  },
                  {
                    text: v(datosLesion.afeccionPrincipalReseleccionada),
                    style: 'tableCell',
                    colSpan: 3,
                  },
                  {},
                  {},
                ],
              ]
            : []),
          ...(Array.isArray(datosLesion.afeccionesTratadas) &&
          datosLesion.afeccionesTratadas.length > 0
            ? [
                [
                  { text: 'Afecciones tratadas', style: 'tableCell' },
                  {
                    text: formatAfeccionesTratadas(
                      datosLesion.afeccionesTratadas,
                    ),
                    style: 'tableCell',
                    colSpan: 3,
                  },
                  {},
                  {},
                ],
              ]
            : []),
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 8],
    },

    // Responsable
    ...(responsableTexto
      ? [
          {
            text: [
              { text: 'Responsable de la atención: ', bold: true },
              { text: responsableTexto },
            ],
            style: 'paragraph',
            margin: [0, 4, 0, 16] as [number, number, number, number],
          },
        ]
      : []),
  ];

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 70, 40, 80],
    header: {
      columns: [logo, headerText],
    },
    content: contenido,
    footer: {
      columns: [
        {
          text: [
            ...(firmanteActivo?.nombre
              ? [
                  {
                    text: `${firmanteActivo.tituloProfesional || ''} ${firmanteActivo.nombre}\n`,
                    bold: true,
                  },
                  firmanteActivo?.numeroCedulaProfesional
                    ? {
                        text: `Cédula Profesional No. ${firmanteActivo.numeroCedulaProfesional}\n`,
                        bold: false,
                      }
                    : null,
                ].filter(Boolean)
              : []),
            proveedorSalud.nombre
              ? {
                  text: `${proveedorSalud.nombre}\n`,
                  bold: true,
                  italics: true,
                }
              : null,
            proveedorSalud.direccion
              ? { text: `${proveedorSalud.direccion}\n`, italics: true }
              : null,
            proveedorSalud.municipio &&
            proveedorSalud.estado &&
            proveedorSalud.telefono
              ? {
                  text: `${proveedorSalud.municipio}, ${proveedorSalud.estado}, Tel. ${proveedorSalud.telefono}\n`,
                  italics: true,
                }
              : null,
            proveedorSalud.sitioWeb
              ? {
                  text: proveedorSalud.sitioWeb,
                  link: `https://${proveedorSalud.sitioWeb}`,
                  italics: true,
                  color: 'blue',
                }
              : null,
          ].filter((item) => item !== null),
          fontSize: 8,
          margin: [40, 0, 0, 0] as [number, number, number, number],
        },
        ...(firma && (firma as any).image
          ? [
              {
                ...firma,
                margin: [0, -3, 0, 0] as [number, number, number, number],
              },
            ]
          : []),
        {
          text: '',
          alignment: 'right',
          margin: [0, 0, 40, 0] as [number, number, number, number],
        },
      ],
    },
    styles,
  };
};
