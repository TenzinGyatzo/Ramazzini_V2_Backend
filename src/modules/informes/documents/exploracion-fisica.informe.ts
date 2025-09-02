import type {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { formatearNombreTrabajador } from '../../../utils/names';

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
    fillColor: '#343A40',
    color: '#FFFFFF',
    bold: true,
    fontSize: 8,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  tableHeaderLg: {
    fillColor: '#343A40',
    color: '#FFFFFF',
    bold: true,
    fontSize: 10,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  tableCellBold: {
    fontSize: 8,
    bold: true,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  tableCell: {
    fontSize: 8,
    bold: false,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  tableCellBoldExtremidadesSuperiores: {
    fontSize: 8,
    bold: true,
    alignment: 'center',
    margin: [0, 1.3, 0, 1.3],
  },
  tableCellExtremidadesSuperiores: {
    fontSize: 8,
    bold: false,
    alignment: 'center',
    margin: [0, 1.3, 0, 1.3],
  },
  tableCellBoldColumna: {
    fontSize: 8,
    bold: true,
    alignment: 'center',
    margin: [0, 9.7, 0, 9.7],
  },
  tableCellColumna: {
    fontSize: 8,
    bold: false,
    alignment: 'center',
    margin: [0, 9.7, 0, 9.7],
  },
  tableCellBoldPiel: {
    fontSize: 8,
    bold: true,
    alignment: 'center',
    margin: [0, 2.15, 0, 2.15],
  },
  tableCellPiel: {
    fontSize: 8,
    bold: false,
    alignment: 'center',
    margin: [0, 2.15, 0, 2.15],
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
  text: '                                                                                               EXPLORACIÓN FÍSICA\n',
  style: 'header',
  alignment: 'right',
  margin: [0, 35, 40, 0],
};

const standardLayout = {
  hLineColor: '#d1d5db',
  vLineColor: '#d1d5db',
  paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
  paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
  paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
  paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
  hLineWidth: () => 0.8,
  vLineWidth: () => 0.8,
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
  primerApellido: string;
  segundoApellido: string;
  nombre: string;
  nacimiento: string;
  escolaridad: string;
  edad: string;
  puesto: string;
  sexo: string;
  antiguedad: string;
  telefono: string;
  estadoCivil: string;
  numeroEmpleado: string;
}

interface ExploracionFisica {
  fechaExploracionFisica: Date;
  peso?: number;
  altura?: number;
  indiceMasaCorporal?: number;
  categoriaIMC?: string;
  circunferenciaCintura?: number;
  categoriaCircunferenciaCintura?: string;
  tensionArterialSistolica?: number;
  tensionArterialDiastolica?: number;
  categoriaTensionArterial?: string;
  frecuenciaCardiaca?: number;
  categoriaFrecuenciaCardiaca?: string;
  frecuenciaRespiratoria?: number;
  categoriaFrecuenciaRespiratoria?: string;
  saturacionOxigeno?: number;
  categoriaSaturacionOxigeno?: string;
  craneoCara?: string;
  ojos?: string;
  oidos?: string;
  nariz?: string;
  boca?: string;
  cuello?: string;
  hombros?: string;
  codos?: string;
  manos?: string;
  reflejosOsteoTendinososSuperiores?: string;
  vascularESuperiores?: string;
  torax?: string;
  abdomen?: string;
  cadera?: string;
  rodillas?: string;
  tobillosPies?: string;
  reflejosOsteoTendinososInferiores?: string;
  vascularEInferiores?: string;
  inspeccionColumna?: string;
  movimientosColumna?: string;
  lesionesPiel?: string;
  cicatrices?: string;
  nevos?: string;
  coordinacion?: string;
  sensibilidad?: string;
  equilibrio?: string;
  marcha?: string;
  resumenExploracionFisica?: string;
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
  colorInforme: string;
}

// ==================== INFORME PRINCIPAL ====================
export const exploracionFisicaInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  exploracionFisica: ExploracionFisica,
  medicoFirmante: MedicoFirmante,
  proveedorSalud: ProveedorSalud,
): TDocumentDefinitions => {

  // Clonamos los estilos y cambiamos fillColor antes de pasarlos a pdfMake
  const updatedStyles: StyleDictionary = { ...styles };

  updatedStyles.tableHeader = {
    ...updatedStyles.tableHeader,
    fillColor: proveedorSalud.colorInforme || '#343A40',
  };

  updatedStyles.tableHeaderLg = {
    ...updatedStyles.tableHeaderLg, 
    fillColor: proveedorSalud.colorInforme || '#343A40',
  };
  //////////////////////////////////////////////////////////

  const firma: Content = medicoFirmante.firma?.data
  ? { image: `assets/signatories/${medicoFirmante.firma.data}`, width: 65 }
  : { text: '' };

  const logo: Content = proveedorSalud.logotipoEmpresa?.data
  ? { image: `assets/providers-logos/${proveedorSalud.logotipoEmpresa.data}`, width: 55, margin: [40, 20, 0, 0] }
  : { image: 'assets/RamazziniBrand600x600.png', width: 55, margin: [40, 20, 0, 0] };

  // Nombre de Empresa y Fecha
  const nombreEmpresaSeccion: Content = {
    style: 'table',
    table: {
      widths: ['70%', '30%'],
      body: [
        [
          {
            text: nombreEmpresa,
            style: 'nombreEmpresa',
            alignment: 'center',
            margin: [0, 0, 0, 0],
          },
          {
            text: [
              { text: 'Fecha: ', style: 'fecha', bold: false },
              {
                text: formatearFechaUTC(exploracionFisica.fechaExploracionFisica),
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
  };

  // Datos del Trabajador
  const trabajadorSeccion: Content = {
    style: 'table',
    table: {
      widths: ['15%', '45%', '15%', '25%'],
      body: [
        [
          { text: 'NOMBRE', style: 'label' },
                        { text: formatearNombreTrabajador(trabajador), style: 'value' },
          { text: 'EDAD', style: 'label' },
          { text: trabajador.edad, style: 'value' },
        ],
        [
          { text: 'PUESTO', style: 'label' },
          { text: trabajador.puesto, style: 'value' },
          { text: 'SEXO', style: 'label' },
          { text: trabajador.sexo, style: 'value' },
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
  };

  // Somatometría y Signos Vitales
  const somatometriaSignosVitales: Content = {
    columns: [
      // Somatometría
      {
        style: 'table',
        table: {
          widths: ['45%', '25%', '30%'],
          body: [
            // Encabezado
            [
              {
                text: 'SOMATOMETRÍA',
                style: 'tableHeader',
                colSpan: 3,
                alignment: 'center',
              },
              {},
              {},
            ],
            [
              { text: 'Parámetro', style: 'tableHeader', alignment: 'center' },
              {
                text: 'Especifique',
                style: 'tableHeader',
                alignment: 'center',
              },
              { text: 'Categoría', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de Datos
            ...[
              ['PESO', exploracionFisica.peso, ' - '],
              ['ALTURA', exploracionFisica.altura, ' - '],
              ['ÍNDICE DE MASA CORPORAL', exploracionFisica.indiceMasaCorporal, exploracionFisica.categoriaIMC],
              ['CIRCUNFERENCIA DE CINTURA', exploracionFisica.circunferenciaCintura, exploracionFisica.categoriaCircunferenciaCintura],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
        margin: [0, 0, 2, 0],
      },
      // Signos Vitales
      {
        style: 'table',
        table: {
          widths: ['45%', '25%', '30%'],
          body: [
            // Encabezado
            [
              {
                text: 'SIGNOS VITALES',
                style: 'tableHeader',
                colSpan: 3,
                alignment: 'center',
              },
              {},
              {},
            ],
            [
              { text: 'Parámetro', style: 'tableHeader', alignment: 'center' },
              {
                text: 'Especifique',
                style: 'tableHeader',
                alignment: 'center',
              },
              { text: 'Categoría', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de datos
            ...[
              ['TENSIÓN ARTERIAL', `${exploracionFisica.tensionArterialSistolica}/${exploracionFisica.tensionArterialDiastolica} mmHg`, exploracionFisica.categoriaTensionArterial],
              ['FRECUENCIA CARDIACA', `${exploracionFisica.frecuenciaCardiaca} lpm`, exploracionFisica.categoriaFrecuenciaCardiaca],
              ['FRECUENCIA RESPIRATORIA', `${exploracionFisica.frecuenciaRespiratoria} rpm`, exploracionFisica.categoriaFrecuenciaRespiratoria],
              ['SATURACIÓN DE OXÍGENO', `${exploracionFisica.saturacionOxigeno} %`, exploracionFisica.categoriaSaturacionOxigeno],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
      },
    ],
    margin: [0, 0, 0, 8],
  };

  // Cabeza-Cuello y Extremidades Superiores
  const cabezaCuelloExtremidadesSuperiores: Content = {
    columns: [
      // Cabeza y cuello
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              {
                text: 'CABEZA Y CUELLO',
                style: 'tableHeader',
                colSpan: 2,
                alignment: 'center',
              },
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Hallazgos', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de Datos
            ...[
              ['CRÁNEO-CARA', exploracionFisica.craneoCara],
              ['OJOS', exploracionFisica.ojos],
              ['OIDOS', exploracionFisica.oidos],
              ['NARIZ', exploracionFisica.nariz],
              ['BOCA', exploracionFisica.boca],
              ['CUELLO', exploracionFisica.cuello],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
        margin: [0, 0, 2, 0],
      },
      // Extremidades Superiores
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              {
                text: 'EXTREMIDADES SUPERIORES',
                style: 'tableHeader',
                colSpan: 2,
                alignment: 'center',
              },
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Hallazgos', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de datos
            ...[
              ['HOMBROS', exploracionFisica.hombros],
              ['CODOS', exploracionFisica.codos],
              ['MANOS', exploracionFisica.manos],
              ['REFLEJOS O.T.', exploracionFisica.reflejosOsteoTendinososSuperiores],
              ['VASCULAR', exploracionFisica.vascularESuperiores],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style:
                  i === 0
                    ? 'tableCellBoldExtremidadesSuperiores'
                    : 'tableCellExtremidadesSuperiores',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
      },
    ],
    margin: [0, 0, 0, 8],
  };

  // Tórax y Abdomen
  const toraxAbdomen: Content = {
    columns: [
      // Tórax
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              {
                text: 'TÓRAX',
                style: 'tableHeader',
                colSpan: 2,
                alignment: 'center',
              },
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Hallazgos', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de Datos
            ...[['TÓRAX', exploracionFisica.torax]].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
        margin: [0, 0, 2, 0],
      },
      // Abdomen
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              {
                text: 'ABDOMEN',
                style: 'tableHeader',
                colSpan: 2,
                alignment: 'center',
              },
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Hallazgos', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de datos
            ...[['ABDOMEN', exploracionFisica.abdomen]].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
      },
    ],
    margin: [0, 0, 0, 8],
  };

  // Extremidades Inferiores y Columna
  const extremidadesInferioresColumna: Content = {
    columns: [
      // Extremidades Inferiores
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              {
                text: 'EXTREMIDADES INFERIORES',
                style: 'tableHeader',
                colSpan: 2,
                alignment: 'center',
              },
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Hallazgos', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de Datos
            ...[
              ['CADERA', exploracionFisica.cadera],
              ['RODILLAS', exploracionFisica.rodillas],
              ['TOBILLOS-PIES', exploracionFisica.tobillosPies],
              ['REFLEJOS O.T.', exploracionFisica.reflejosOsteoTendinososInferiores],
              ['VASCULAR', exploracionFisica.vascularEInferiores],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
        margin: [0, 0, 2, 0],
      },
      // Columna
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              {
                text: 'COLUMNA',
                style: 'tableHeader',
                colSpan: 2,
                alignment: 'center',
              },
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Hallazgos', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de datos
            ...[
              ['INSPECCIÓN', exploracionFisica.inspeccionColumna],
              ['MOVIMIENTOS', exploracionFisica.movimientosColumna],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBoldColumna' : 'tableCellColumna',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
      },
    ],
    margin: [0, 0, 0, 8],
  };

  // Piel y Neurológico
  const pielNeurológico: Content = {
    columns: [
      // Piel
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              {
                text: 'PIEL',
                style: 'tableHeader',
                colSpan: 2,
                alignment: 'center',
              },
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Hallazgos', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de Datos
            ...[
              ['LESIONES', exploracionFisica.lesionesPiel],
              ['CICATRICES', exploracionFisica.cicatrices],
              ['NEVOS', exploracionFisica.nevos],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBoldPiel' : 'tableCellPiel',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
        margin: [0, 0, 2, 0],
      },
      // Neurológico
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              {
                text: 'NEUROLÓGICO',
                style: 'tableHeader',
                colSpan: 2,
                alignment: 'center',
              },
              {},
            ],
            [
              { text: '-', style: 'tableHeader', alignment: 'center' },
              { text: 'Hallazgos', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de datos
            ...[
              ['COORDINACIÓN', exploracionFisica.coordinacion],
              ['SENSIBILIDAD', exploracionFisica.sensibilidad],
              ['EQUILIBRIO', exploracionFisica.equilibrio],
              ['MARCHA', exploracionFisica.marcha],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: standardLayout,
      },
    ],
    margin: [0, 0, 0, 8],
  };

  // Resumen Exploración Física
  const resumenExploracionFisica: Content = {
    style: 'table',
    table: {
      widths: ['30%', '70%'],
      body: [
        // Encabezado
        [
          {
            text: 'RESUMEN DE HISTORIA CLÍNICA',
            style: 'tableHeaderLg',
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
            text: exploracionFisica.resumenExploracionFisica,
            style: 'tableCellResumen',
            alignment: 'center',
          },
        ],
      ],
    },
    layout: standardLayout,
    margin: [0, 0, 0, 8],
  };

  // Crear el array de contenido de manera condicional
  const content: Content[] = [
    nombreEmpresaSeccion,
    trabajadorSeccion,
    somatometriaSignosVitales,
    cabezaCuelloExtremidadesSuperiores,
    toraxAbdomen,
    extremidadesInferioresColumna,
    pielNeurológico,
    resumenExploracionFisica,
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
            // Solo incluir la columna de firma si hay firma
            ...(medicoFirmante.firma?.data ? [{
              ...firma,
              margin: [0, -3, 0, 0] as [number, number, number, number],  // Mueve el elemento más arriba
            }] : []),
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
              
                (proveedorSalud.municipio && proveedorSalud.estado && proveedorSalud.telefono)
                  ? {
                      text: `${proveedorSalud.municipio}, ${proveedorSalud.estado}, Tel. ${formatearTelefono(proveedorSalud.telefono)}\n`,
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
    styles: updatedStyles,
  };
};
