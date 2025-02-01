import type {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';

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
    fontSize: 10,
    alignment: 'right',
  },
  sectionHeaderResume: {
    fontSize: 11,
    lineHeight: 0.8,
    bold: true,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  sectionHeader: {
    fontSize: 10,
    lineHeight: 0.8,
    bold: true,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  label: {
    fontSize: 8,
    lineHeight: 1,
    margin: [0, 0, 0, 0], // Reducir el margen superior e inferior
  },
  value: {
    bold: true,
    fontSize: 9,
    lineHeight: 1,
    margin: [0, 0, 0, 0], // Reducir el margen superior e inferior
  },
  tableHeader: {
    fillColor: '#262626',
    color: '#FFFFFF',
    bold: true,
    fontSize: 9,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  tableCellBold: {
    fontSize: 8,
    bold: true,
    alignment: 'left',
    margin: [0, 0, 0, 0],
  },
  tableCell: {
    fontSize: 8,
    bold: false,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  tableCellBoldResumen: {
    fontSize: 10,
    bold: true,
    margin: [0, 0, 0, 0],
  },
  tableCellResumen: {
    fontSize: 9,
    bold: false,
    margin: [0, 0, 0, 0],
  },
};

// ==================== CONTENIDO ====================
const headerText: Content = {
  text: '                                                                                                     HISTORIA CLÍNICA\n',
  style: 'header',
  alignment: 'right',
  margin: [0, 35, 40, 0],
};

// ==================== FUNCIONES REUSABLES ====================
type Alignment = 'left' | 'center' | 'right' | 'justify';

const createTableCell = (
  text: string,
  style: string,
  alignment: Alignment,
): Content => ({
  text,
  style,
  alignment,
});

const createRow = (
  // Función para crear una de si, no y especifique
  condition: string | undefined,
  especificar: string | undefined,
  label: string,
) => {
  return [
    label,
    condition === 'Si' ? 'XX' : '',
    condition === 'No' ? 'XX' : '',
    especificar || '',
  ];
};

function formatearFechaUTC(fecha: Date): string {
  if (!fecha || isNaN(fecha.getTime())) return '';

  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const año = fecha.getUTCFullYear();

  return `${dia}-${mes}-${año}`;
}

function formatearTelefono(telefono: string): string {
  if (!telefono || telefono.length !== 10) {
    return 'Teléfono inválido';  // Mensaje de error si el número no tiene 10 dígitos
  }
  return `(${telefono.slice(0, 3)}) ${telefono.slice(3, 6)} ${telefono.slice(6)}`;
}
// ==================== INTERFACES ====================
interface Trabajador {
  nombre: string;
  nacimiento: string;
  escolaridad: string;
  edad: string;
  puesto: string;
  sexo: string;
  antiguedad: string;
  telefono: string;
  estadoCivil: string;
  hijos: number;
}

interface HistoriaClinica {
  motivoExamen: string;
  fechaHistoriaClinica: Date;
  nefropatias?: string;
  nefropatiasEspecificar?: string;
  diabeticos?: string;
  diabeticosEspecificar?: string;
  hipertensivos?: string;
  hipertensivosEspecificar?: string;
  cardiopaticos?: string;
  cardiopaticosEspecificar?: string;
  neoplasicos?: string;
  neoplasicosEspecificar?: string;
  psiquiatricos?: string;
  psiquiatricosEspecificar?: string;
  epilepticos?: string;
  epilepticosEspecificar?: string;
  leuticos?: string;
  leuticosEspecificar?: string;
  fimicos?: string;
  fimicosEspecificar?: string;
  hepatopatias?: string;
  hepatopatiasEspecificar?: string;
  lumbalgias?: string;
  lumbalgiasEspecificar?: string;
  diabeticosPP?: string;
  diabeticosPPEspecificar?: string;
  cardiopaticosPP?: string;
  cardiopaticosPPEspecificar?: string;
  alergicos?: string;
  alergicosEspecificar?: string;
  hipertensivosPP?: string;
  hipertensivosPPEspecificar?: string;
  obesidad?: string;
  obesidadEspecificar?: string;
  epilepticosPP?: string;
  epilepticosPPEspecificar?: string;
  accidentes?: string;
  accidentesEspecificar?: string;
  quirurgicos?: string;
  quirurgicosEspecificar?: string;
  traumaticos?: string;
  traumaticosEspecificar?: string;
  alcoholismo?: string;
  alcoholismoEspecificar?: string;
  tabaquismo?: string;
  tabaquismoEspecificar?: string;
  toxicomanias?: string;
  toxicomaniasEspecificar?: string;
  alimentacionDeficiente?: string;
  alimentacionDeficienteEspecificar?: string;
  actividadFisicaDeficiente?: string;
  actividadFisicaDeficienteEspecificar?: string;
  higienePersonalDeficiente?: string;
  higienePersonalDeficienteEspecificar?: string;
  menarca?: string;
  duracionPromedio?: string;
  frecuencia?: string;
  gestas?: string;
  partos?: string;
  cesareas?: string;
  abortos?: string;
  fechaUltimaRegla?: string;
  cantidadDeSangre?: string;
  dolorMenstrual?: string;
  embarazoActual?: string;
  planificacionFamiliar?: string;
  vidaSexualActiva?: string;
  fechaUltimoPapanicolaou?: string;
  empresaAnterior1?: string;
  puestoAnterior1?: string;
  antiguedadAnterior1?: string;
  agentesAnterior1?: string;
  empresaAnterior2?: string;
  puestoAnterior2?: string;
  antiguedadAnterior2?: string;
  agentesAnterior2?: string;
  empresaAnterior3?: string;
  puestoAnterior3?: string;
  antiguedadAnterior3?: string;
  agentesAnterior3?: string;
  accidenteLaboral?: string;
  accidenteLaboralEspecificar?: string;
  descripcionDelDano?: string;
  secuelas?: string;
  resumenHistoriaClinica?: string;
}

interface MedicoFirmante {
  nombre: string;
  tituloProfesional: string;
  numeroCedulaProfesional: string;
  especialistaSaludTrabajo: string;
  numeroCedulaEspecialista: string;
  nombreCredencialAdicional: string;
  numeroCredencialAdicional: string;
  firma: {
    data: string;
    contentType: string;
  }
}

interface ProveedorSalud {
  nombre: string;
  RFC: string;
  perfilProveedorSalud: string;
  logotipoEmpresa: {
    data: string;
    contentType: string;
  };
  estado: string;
  municipio: string;
  codigoPostal: string;
  direccion: string;
  telefono: string;
  correoElectronico: string;
  sitioWeb: string;
}

// ==================== INFORME PRINCIPAL ====================
export const historiaClinicaInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  historiaClinica: HistoriaClinica,
  medicoFirmante: MedicoFirmante,
  proveedorSalud: ProveedorSalud,
): TDocumentDefinitions => {

  const firma: Content = medicoFirmante.firma?.data
  ? { image: `assets/signatories/${medicoFirmante.firma.data}`, width: 65 }
  : { text: '' };

  const logo: Content = proveedorSalud.logotipoEmpresa?.data
  ? { image: `assets/providers-logos/${proveedorSalud.logotipoEmpresa.data}`, width: 55, margin: [40, 20, 0, 0] }
  : { text: '' };

  const motivoExamen = historiaClinica.motivoExamen;
  const motivoTexto = [
    { text: 'Ingreso (', style: 'fecha' },
    {
      text: motivoExamen === 'Ingreso' ? 'X' : ' ',
      style: 'fecha',
      bold: motivoExamen === 'Ingreso',
    },
    { text: ')    Inicial (', style: 'fecha' },
    {
      text: motivoExamen === 'Inicial' ? 'X' : ' ',
      style: 'fecha',
      bold: motivoExamen === 'Inicial',
    },
    { text: ')    Periódico (', style: 'fecha' },
    {
      text: motivoExamen === 'Periódico' ? 'X' : ' ',
      style: 'fecha',
      bold: motivoExamen === 'Periódico',
    },
    { text: ')', style: 'fecha' },
  ];

  const rowsAntecedentesHeredofamiliares = [
    createRow(
      historiaClinica.nefropatias,
      historiaClinica.nefropatiasEspecificar,
      'NEFROPATIA',
    ),
    createRow(
      historiaClinica.diabeticos,
      historiaClinica.diabeticosEspecificar,
      'DIABETES',
    ),
    createRow(
      historiaClinica.hipertensivos,
      historiaClinica.hipertensivosEspecificar,
      'HIPERTENSIVOS',
    ),
    createRow(
      historiaClinica.cardiopaticos,
      historiaClinica.cardiopaticosEspecificar,
      'CARDIOPÁTICOS',
    ),
    createRow(
      historiaClinica.neoplasicos,
      historiaClinica.neoplasicosEspecificar,
      'NEOPLÁSICOS',
    ),
    createRow(
      historiaClinica.psiquiatricos,
      historiaClinica.psiquiatricosEspecificar,
      'PSIQUIÁTRICOS',
    ),
    createRow(
      historiaClinica.epilepticos,
      historiaClinica.epilepticosEspecificar,
      'EPILÉPTICOS',
    ),
    createRow(
      historiaClinica.leuticos,
      historiaClinica.leuticosEspecificar,
      'LUÉTICOS',
    ),
    createRow(
      historiaClinica.fimicos,
      historiaClinica.fimicosEspecificar,
      'FÍMICOS',
    ),
    createRow(
      historiaClinica.hepatopatias,
      historiaClinica.hepatopatiasEspecificar,
      'HEPATOPATÍAS',
    ),
  ];

  const rowsAntecedentesPersonalesPatologicos = [
    createRow(
      historiaClinica.lumbalgias,
      historiaClinica.lumbalgiasEspecificar,
      'LUMBALGIAS',
    ),
    createRow(
      historiaClinica.diabeticosPP,
      historiaClinica.diabeticosPPEspecificar,
      'DIABÉTICOS',
    ),
    createRow(
      historiaClinica.cardiopaticosPP,
      historiaClinica.cardiopaticosPPEspecificar,
      'CARDIOPÁTICOS',
    ),
    createRow(
      historiaClinica.alergicos,
      historiaClinica.alergicosEspecificar,
      'ALÉRGICOS',
    ),
    createRow(
      historiaClinica.hipertensivosPP,
      historiaClinica.hipertensivosPPEspecificar,
      'HIPERTENSIVOS',
    ),
    createRow(
      historiaClinica.obesidad,
      historiaClinica.obesidadEspecificar,
      'OBESIDAD',
    ),
    createRow(
      historiaClinica.epilepticosPP,
      historiaClinica.epilepticosPPEspecificar,
      'EPILÉPTICOS',
    ),
    createRow(
      historiaClinica.accidentes,
      historiaClinica.accidentesEspecificar,
      'ACCIDENTES',
    ),
    createRow(
      historiaClinica.quirurgicos,
      historiaClinica.quirurgicosEspecificar,
      'QUIRÚRGICOS',
    ),
    createRow(
      historiaClinica.traumaticos,
      historiaClinica.traumaticosEspecificar,
      'TRAUMÁTICOS',
    ),
  ];

  const rowsAntecedentesPersonalesNoPatologicos = [
    createRow(
      historiaClinica.alcoholismo,
      historiaClinica.alcoholismoEspecificar,
      'ALCOHOLISMO',
    ),
    createRow(
      historiaClinica.tabaquismo,
      historiaClinica.tabaquismoEspecificar,
      'TABAQUISMO',
    ),
    createRow(
      historiaClinica.toxicomanias,
      historiaClinica.toxicomaniasEspecificar,
      'TOXICOMANIAS',
    ),
  ];

  const rowsAntecedentesPersonalesNoPatologicos2 = [
    createRow(
      historiaClinica.alimentacionDeficiente,
      historiaClinica.alimentacionDeficienteEspecificar,
      'ALIMENTACIÓN',
    ),
    createRow(
      historiaClinica.actividadFisicaDeficiente,
      historiaClinica.actividadFisicaDeficienteEspecificar,
      'ACTIVIDAD FÍSICA',
    ),
    createRow(
      historiaClinica.higienePersonalDeficiente,
      historiaClinica.higienePersonalDeficienteEspecificar,
      'HIGIENE PERSONAL',
    ),
  ];

  // Nombre de Empresa y Fecha
  const nombreEmpresaSeccion: Content = {
    style: 'table',
    table: {
      widths: ['50%', '32%', '18%'],
      body: [
        [
          {
            text: "      " + nombreEmpresa,  // Usa 6 espacios literales
            style: 'nombreEmpresa',
            alignment: 'center',
            margin: [0, 0, 0, 0],
            preserveLeadingSpaces: true,  // IMPORTANTE: Forza a pdfMake a respetar los espacios
          },
          {
            text: motivoTexto,
            style: 'fecha',
            alignment: 'right',
            margin: [0, 4, 0, 0],
          },
          {
            text: [
              { text: 'Fecha: ', style: 'fecha', bold: false },
              {
                text: formatearFechaUTC(historiaClinica.fechaHistoriaClinica),
                style: 'fecha',
                bold: true,
                decoration: 'underline',
              },
            ],
            margin: [0, 4, 0, 0],
          },
        ],
      ],
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 0],
  }

  // Datos del Trabajador
  const trabajadorSeccion: Content = {
    style: 'table',
    table: {
      widths: ['15%', '45%', '15%', '25%'],
      body: [
        [
          { text: 'NOMBRE', style: 'label' },
          { text: trabajador.nombre, style: 'value' },
          { text: 'NACIMIENTO', style: 'label' },
          { text: trabajador.nacimiento, style: 'value' },
        ],
        [
          { text: 'ESCOLARIDAD', style: 'label' },
          { text: trabajador.escolaridad, style: 'value' },
          { text: 'EDAD', style: 'label' },
          { text: trabajador.edad, style: 'value' },
        ],
        [
          { text: 'PUESTO', style: 'label' },
          { text: trabajador.puesto, style: 'value' },
          { text: 'SEXO', style: 'label' },
          { text: trabajador.sexo, style: 'value' },
        ],
        [
          { text: 'ANTIGÜEDAD', style: 'label' },
          { text: trabajador.antiguedad, style: 'value' },
          { text: 'TELEFONO', style: 'label' },
          { text: trabajador.telefono, style: 'value' },
        ],
        [
          { text: 'ESTADO CIVIL', style: 'label' },
          { text: trabajador.estadoCivil, style: 'value' },
          { text: 'HIJOS', style: 'label' },
          { text: trabajador.hijos, style: 'value' },
        ],
      ],
    },
    layout: {
      hLineColor: '#e5e7eb',
      vLineColor: '#e5e7eb',
      paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
      paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
      paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
      paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
      hLineWidth: () => 1,
      vLineWidth: () => 1,
    },
    margin: [0, 0, 0, 8],
  }

  // Antecedentes Heredofamiliares y Personales Patológicos
  const antecedentesSeccion: Content = {
    columns: [
      // Antecedentes Heredofamiliares
      {
        style: 'table',
        table: {
          widths: ['30%', '12%', '12%', '*'],
          body: [
            // Encabezado
            [
              {
                text: 'ANTECEDENTES HEREDOFAMILIARES',
                style: 'tableHeader',
                colSpan: 4,
                alignment: 'center',
              },
              {},
              {},
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Sí', style: 'tableHeader', alignment: 'center' },
              { text: 'No', style: 'tableHeader', alignment: 'center' },
              {
                text: 'Especifique',
                style: 'tableHeader',
                alignment: 'center',
              },
            ],
            // Filas de datos
            ...rowsAntecedentesHeredofamiliares.map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera columna
                alignment: i === 0 ? 'left' : 'center', // Alinea a la izquierda para la primera columna
              })),
            ),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#e5e7eb',
          paddingTop: (i: number, node: any) => 1,
          paddingBottom: (i: number, node: any) => 1,
          paddingLeft: (i: number, node: any) => 2,
          paddingRight: (i: number, node: any) => 2,
        },

        margin: [0, 0, 6, 0],
      },
      // Antecedentes Personales Patológicos
      {
        style: 'table',
        table: {
          widths: ['30%', '12%', '12%', '*'],
          body: [
            // Encabezado
            [
              {
                text: 'ANTECEDENTES PERSONALES PATOLÓGICOS',
                style: 'tableHeader',
                colSpan: 4,
                alignment: 'center',
              },
              {},
              {},
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Sí', style: 'tableHeader', alignment: 'center' },
              { text: 'No', style: 'tableHeader', alignment: 'center' },
              {
                text: 'Especifique',
                style: 'tableHeader',
                alignment: 'center',
              },
            ],
            // Filas de datos
            ...rowsAntecedentesPersonalesPatologicos.map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera columna
                alignment: i === 0 ? 'left' : 'center', // Alinea a la izquierda para la primera columna
              })),
            ),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => 0.5, // Todas las líneas horizontales tienen el mismo grosor
          vLineWidth: () => 0, // Las líneas verticales no se dibujan
          hLineColor: () => '#e5e7eb', // Color de las líneas horizontales
          paddingTop: (i: number, node: any) => 1,
          paddingBottom: (i: number, node: any) => 1,
          paddingLeft: (i: number, node: any) => 2,
          paddingRight: (i: number, node: any) => 2,
        },
      },
    ],
    margin: [0, 0, 0, 8],
  }

  // Antecedentes Personales No Patológicos
  const antecedentesPersonalesNoPatologicos: Content = {
    columns: [
      // Antecedentes Personales No Patológicos
      {
        style: 'table',
        table: {
          widths: ['30%', '12%', '12%', '*'],
          body: [
            // Encabezado
            [
              {
                text: 'ANTECEDENTES PERSONALES NO PATOLÓGICOS',
                style: 'tableHeader',
                colSpan: 4,
                alignment: 'center',
              },
              {},
              {},
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Sí', style: 'tableHeader', alignment: 'center' },
              { text: 'No', style: 'tableHeader', alignment: 'center' },
              {
                text: 'Especifique',
                style: 'tableHeader',
                alignment: 'center',
              },
            ],
            // Filas de datos
            ...rowsAntecedentesPersonalesNoPatologicos.map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera columna
                alignment: i === 0 ? 'left' : 'center', // Alinea a la izquierda para la primera columna
              })),
            ),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#e5e7eb',
          paddingTop: (i: number, node: any) => 1,
          paddingBottom: (i: number, node: any) => 1,
          paddingLeft: (i: number, node: any) => 2,
          paddingRight: (i: number, node: any) => 2,
        },

        margin: [0, 0, 6, 0],
      },
      // Antecedentes Personales No Patológicos
      {
        style: 'table',
        table: {
          widths: ['30%', '12%', '12%', '*'],
          body: [
            // Encabezado
            [
              {
                text: 'ANTECEDENTES PERSONALES NO PATOLÓGICOS',
                style: 'tableHeader',
                colSpan: 4,
                alignment: 'center',
              },
              {},
              {},
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Sí', style: 'tableHeader', alignment: 'center' },
              { text: 'No', style: 'tableHeader', alignment: 'center' },
              {
                text: 'Especifique',
                style: 'tableHeader',
                alignment: 'center',
              },
            ],
            // Filas de datos
            ...rowsAntecedentesPersonalesNoPatologicos2.map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera columna
                alignment: i === 0 ? 'left' : 'center', // Alinea a la izquierda para la primera columna
              })),
            ),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#e5e7eb',
          paddingTop: (i: number, node: any) => 1,
          paddingBottom: (i: number, node: any) => 1,
          paddingLeft: (i: number, node: any) => 2,
          paddingRight: (i: number, node: any) => 2,
        },
      },
    ],
    margin: [0, 0, 0, 8],
  }

  // Antecedentes Gineco Obstetricos
  const antecedentesGinecoObstetricos: Content | null = trabajador.sexo === 'Femenino' ? {
    style: 'table',
    table: {
      widths: ['20%', '30%', '20%', '30%'],
      body: [
        // Encabezado
        [
          {
            text: 'ANTECEDENTES GINECO-OBSTÉTRICOS',
            style: 'tableHeader',
            colSpan: 4,
            alignment: 'center',
          },
          {},
          {},
          {},
        ],
        // Filas de datos
        ...[
          [
            'MENARCA',
            historiaClinica.menarca,
            'FECHA ÚLTIMA REGLA',
            historiaClinica.fechaUltimaRegla,
          ],
          [
            'DURACIÓN PROMEDIO',
            historiaClinica.duracionPromedio,
            'CANTIDAD DE SANGRE',
            historiaClinica.cantidadDeSangre,
          ],
          [
            'FRECUENCIA',
            historiaClinica.frecuencia,
            'DOLOR MENSTRUAL',
            historiaClinica.dolorMenstrual,
          ],
          [
            'GESTAS',
            historiaClinica.gestas,
            'EMBARAZO ACTUAL',
            historiaClinica.embarazoActual,
          ],
          [
            'PARTOS',
            historiaClinica.partos,
            'PLANIFICACIÓN FAMILIAR',
            historiaClinica.planificacionFamiliar,
          ],
          [
            'CESÁREAS',
            historiaClinica.cesareas,
            'VIDA SEXUAL ACTIVA',
            historiaClinica.vidaSexualActiva,
          ],
          [
            'ABORTOS',
            historiaClinica.abortos,
            'ÚLTIMO PAPANICOLAOU',
            historiaClinica.fechaUltimoPapanicolaou,
          ],
        ].map((row) =>
          row.map((text, i) => ({
            text,
            style: i === 0 || i === 2 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera o la tercer columna
            alignment: i === 0 || i === 2 ? 'left' : 'center', // Alinea a la izquierda para la primera columna y tercer
          })),
        ),
      ],
    },
    layout: {
      hLineWidth: (i: number, node: any) => 0.5,
      vLineWidth: (i: number, node: any) => 0.5,
      hLineColor: () => '#e5e7eb',
      vLineColor: () => '#e5e7eb',
      paddingTop: (i: number, node: any) => 0,
      paddingBottom: (i: number, node: any) => 0,
      paddingLeft: (i: number, node: any) => 2,
      paddingRight: (i: number, node: any) => 2,
    },
    margin: [0, 0, 0, 8],
  } : null

  // Antecedentes Laborales
  const antecedentesLaborales: Content = {
    style: 'table',
    table: {
      widths: ['3%', '22%', '25%', '17%', '*'],
      body: [
        // Encabezado
        [
          {
            text: 'ANTECEDENTES LABORALES',
            style: 'tableHeader',
            colSpan: 5,
            alignment: 'center',
          },
          {},
          {},
          {},
          {},
        ],
        [
          { text: '#', style: 'tableHeader', alignment: 'center' },
          { text: 'Empresa', style: 'tableHeader', alignment: 'center' },
          { text: 'Puesto', style: 'tableHeader', alignment: 'center' },
          { text: 'Antigüedad', style: 'tableHeader', alignment: 'center' },
          { text: 'Agentes', style: 'tableHeader', alignment: 'center' },
        ],
        // Filas de datos
        ...[
          [
            '1',
            historiaClinica.empresaAnterior1,
            historiaClinica.puestoAnterior1,
            historiaClinica.antiguedadAnterior1,
            historiaClinica.agentesAnterior1,
          ],
          [
            '2',
            historiaClinica.empresaAnterior2,
            historiaClinica.puestoAnterior2,
            historiaClinica.antiguedadAnterior2,
            historiaClinica.agentesAnterior2,
          ],
          [
            '3',
            historiaClinica.empresaAnterior3,
            historiaClinica.puestoAnterior3,
            historiaClinica.antiguedadAnterior3,
            historiaClinica.agentesAnterior3,
          ],
        ].map((row) =>
          row.map((text, i) => ({
            text,
            style: i === 0 ? 'tableCell' : 'tableCell',
            alignment: 'center',
          })),
        ),
      ],
    },
    layout: {
      hLineWidth: (i: number, node: any) => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => '#e5e7eb',
      paddingTop: (i: number, node: any) => 0,
      paddingBottom: (i: number, node: any) => 0,
      paddingLeft: (i: number, node: any) => 2,
      paddingRight: (i: number, node: any) => 2,
    },
    margin: [0, 0, 0, 8],
  }

  // Antecedentes Laborales 2da parte
  const antecedentesLaborales2daParte: Content = {
    style: 'table',
    table: {
      widths: ['20%', '10%', '5%', '5%', '5%', '5%', '*'], // 7 columnas
      body: [
        // Fila principal con encabezado
        [
          {
            text: 'SUFRIÓ ALGÚN ACCIDENTE DE TRABAJO',
            style: 'tableCellBold',
            alignment: 'left',
            colSpan: 2,
          },
          {}, // Segunda columna para el colSpan
          { text: 'NO', style: 'tableCellBold', alignment: 'center' },
          {
            text: historiaClinica.accidenteLaboral === 'No' ? 'XX' : '',
            style: 'tableCell',
            alignment: 'center',
          },
          { text: 'SI', style: 'tableCellBold', alignment: 'center' },
          {
            text: historiaClinica.accidenteLaboral === 'Si' ? 'XX' : '',
            style: 'tableCell',
            alignment: 'center',
          },
          {
            text: historiaClinica.accidenteLaboralEspecificar || '',
            style: 'tableCell',
            alignment: 'center',
          },
        ],
        // Fila para "Describa el daño"
        [
          {
            text: 'DESCRIBA EL DAÑO',
            style: 'tableCellBold',
            alignment: 'left',
          },
          {
            text: historiaClinica.descripcionDelDano,
            colSpan: 6,
            style: 'tableCell',
            alignment: 'center',
          },
          {},
          {},
          {},
          {},
          {},
        ],
        // Fila para "Secuelas"
        [
          { text: 'SECUELAS', style: 'tableCellBold', alignment: 'left' },
          {
            text: historiaClinica.secuelas,
            colSpan: 6,
            style: 'tableCell',
            alignment: 'center',
          },
          {},
          {},
          {},
          {},
          {},
        ],
      ],
    },
    layout: {
      hLineColor: '#e5e7eb',
      vLineColor: '#e5e7eb',
      paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
      paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
      paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
      paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
      hLineWidth: () => 1,
      vLineWidth: () => 1,
    },
    margin: [0, 0, 0, 8],
  }

  // Resumen Historia Clínica
  const resumenHistoriaClinica: Content = {
    style: 'table',
    table: {
      widths: ['30%', '70%'],
      body: [
        // Encabezado
        [
          {
            text: 'RESUMEN DE HISTORIA CLÍNICA',
            style: 'tableHeader',
            colSpan: 2,
            alignment: 'center',
          },
          {},
        ],
        [
          {
            text: 'RESUMEN',
            style: 'tableCellBoldResumen',
            alignment: 'center',
          },
          {
            text: historiaClinica.resumenHistoriaClinica,
            style: 'tableCellResumen',
            alignment: 'center',
          },
        ],
      ],
    },
    layout: {
      hLineColor: '#e5e7eb',
      vLineColor: '#e5e7eb',
      paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
      paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
      paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
      paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
      hLineWidth: () => 1,
      vLineWidth: () => 1,
    },
    margin: [0, 0, 0, 8],
  }

  // Crear el array de contenido de manera condicional
  const content: Content[] = [
    nombreEmpresaSeccion, // Nombre de Empresa y Fecha
    trabajadorSeccion, // Datos del Trabajador
    antecedentesSeccion, // Antecedentes Heredofamiliares y Personales Patológicos
    antecedentesPersonalesNoPatologicos, // Antecedentes Personales No Patológicos
    // Incluir "Antecedentes Gineco Obstetricos" solo si el trabajador es femenino
    ...(trabajador.sexo === 'Femenino' ? [antecedentesGinecoObstetricos] : []),
    antecedentesLaborales, // Antecedentes Laborales
    antecedentesLaborales2daParte, // Antecedentes Laborales 2da Parte
    resumenHistoriaClinica, // Resumen Historia Clínica
  ];

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 80],
    header: {
      columns: [logo, headerText],
    },
    content: content,
    footer: {
      stack: [
        {
          canvas: [
            {
              type: 'line',
              x1: 40,
              y1: 0,
              x2: 575,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#FF0000',
            },
            {
              type: 'line',
              x1: 40,
              y1: 0.5, // Una ligera variación para darle mayor visibilidad
              x2: 575,
              y2: 0.5,
              lineWidth: 0.5,
              lineColor: '#FF0000',
            },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          columns: [
            {
              text: [
                medicoFirmante.tituloProfesional && medicoFirmante.nombre
                  ? {
                      text: `${medicoFirmante.tituloProfesional} ${medicoFirmante.nombre}\n`,
                      bold: true,
                    }
                  : null,
              
                medicoFirmante.numeroCedulaProfesional
                  ? {
                      text: `Cédula Profesional Médico Cirujano No. ${medicoFirmante.numeroCedulaProfesional}\n`,
                      bold: false,
                    }
                  : null,
              
                medicoFirmante.numeroCedulaEspecialista
                  ? {
                      text: `Cédula Especialidad Med. del Trab. No. ${medicoFirmante.numeroCedulaEspecialista}\n`,
                      bold: false,
                    }
                  : null,
              
                medicoFirmante.nombreCredencialAdicional && medicoFirmante.numeroCredencialAdicional
                ? {
                    text: `${(medicoFirmante.nombreCredencialAdicional + ' No. ' + medicoFirmante.numeroCredencialAdicional).substring(0, 60)}${(medicoFirmante.nombreCredencialAdicional + ' No. ' + medicoFirmante.numeroCredencialAdicional).length > 60 ? '...' : ''}\n`,
                    bold: false,
                  }
                : null,
              ].filter(item => item !== null),  // Filtrar los nulos para que no aparezcan en el informe   
              fontSize: 8,
              margin: [40, 0, 0, 0],
            },
            {
              ...firma,
              margin: [0, -3, 0, 0],  // Mueve el elemento más arriba
            },
            {
              text: [
                proveedorSalud.nombre
                  ? {
                      text: `${proveedorSalud.nombre}\n`,
                      bold: true,
                      italics: true,
                    }
                  : null,
              
                proveedorSalud.direccion
                  ? {
                      text: `${proveedorSalud.direccion}\n`,
                      bold: false,
                      italics: true,
                    }
                  : null,
              
                (proveedorSalud.codigoPostal && proveedorSalud.municipio && proveedorSalud.estado && proveedorSalud.telefono)
                  ? {
                      text: `${proveedorSalud.codigoPostal} ${proveedorSalud.municipio}, ${proveedorSalud.estado}, Tel. ${formatearTelefono(proveedorSalud.telefono)}\n`,
                      bold: false,
                      italics: true,
                    }
                  : null,
              
                proveedorSalud.sitioWeb
                  ? {
                      text: `${proveedorSalud.sitioWeb}`,
                      bold: false,
                      link: `https://${proveedorSalud.sitioWeb}`,
                      italics: true,
                      color: 'blue',
                    }
                  : null,
              ].filter(item => item !== null),  // Elimina los elementos nulos
              alignment: 'right',
              fontSize: 8,
              margin: [0, 0, 40, 0],
            },
          ],
        },
      ],
    },
    // Estilos
    styles: styles,
  };
};
