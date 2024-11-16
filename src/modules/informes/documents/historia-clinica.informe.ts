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
    fontSize: 11,
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
    fontSize: 9,
    lineHeight: 0.9,
    margin: [0, 0, 0, 0], // Reducir el margen superior e inferior
  },
  value: {
    bold: true, 
    fontSize: 10,
    lineHeight: 0.9,
    margin: [0, 0, 0, 0], // Reducir el margen superior e inferior
  },
  preset: { 
    fontSize: 10, 
    lineHeight: 1,
    margin: [0, 0, 0, 0], // Reducir el margen superior e inferior
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 0.7,
    margin: [0, 0, 0, 0], // Reducir el margen superior e inferior para menos padding
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
    fontSize: 9,
    bold: false,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
};

// ==================== CONTENIDO ====================
const logo: Content = {
  image: 'src/assets/AmesBrand.png',
  width: 60,
  margin: [40, 25, 0, 0],
};

const headerText: Content = {
  text: '                                                                                                        HISTORIA CLÍNICA\n',
  style: 'header',
  alignment: 'right',
  margin: [0, 35, 40, 0],
};

const firma: Content = {
  image: 'src/assets/Firma-Dr-Coronel.png',
  width: 32,
};

// ==================== FUNCIONES REUSABLES ====================
type Alignment = 'left' | 'center' | 'right' | 'justify';

const createTableCell = (text: string, style: string, alignment: Alignment): Content => ({
  text,
  style,
  alignment
});

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
  fechaHistoriaClinica: Date;
}

// ==================== INFORME PRINCIPAL ====================
export const historiaClinicaInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  historiaClinica: HistoriaClinica,
): TDocumentDefinitions => {
  return {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 80],
    header: {
      columns: [logo, headerText],
    },
    content: [
      // Nombre de la empresa y fecha
      {
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
                    text: historiaClinica.fechaHistoriaClinica
                      .toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                      .replace(/\//g, '-'),
                    style: 'fecha',
                    bold: true,
                    // decoration: 'underline',
                  },
                ],
                margin: [0, 3, 0, 0],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 0],
      },
      // Datos del trabajador
      {
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
          hLineColor: '#9ca3af',
          vLineColor: '#9ca3af',
          paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
          paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
          paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
          paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
          hLineWidth: () => 1,
          vLineWidth: () => 1,
        },
        margin: [0, 0, 0, 8],
      },
      // Antecedentes Heredofamiliares y Personales Patológicos
      {
        columns: [
          // Antecedentes Heredofamiliares
          {
            style: 'table',
            table: {
              widths: ['30%', '12%', '12%', '*'],
              body: [
                // Encabezado
                [
                  { text: 'ANTECEDENTES HEREDOFAMILIARES', style: 'tableHeader', colSpan: 4, alignment: 'center' },
                  {}, {}, {}
                ],
                [
                  { text: '-', style: 'tableHeader', alignment: 'center' },
                  { text: 'Sí', style: 'tableHeader', alignment: 'center' },
                  { text: 'No', style: 'tableHeader', alignment: 'center' },
                  { text: 'Especifique', style: 'tableHeader', alignment: 'center' },
                ],
                // Filas de datos
                ...[
                  ['NEFROPATIA', 'XX', 'XX', 'Negado'],
                  ['DIABETES', 'XX', 'XX', 'Negado'],
                  ['HIPERTENSIVOS', 'XX', 'XX', 'Negado'],
                  ['CARDIOPÁTICOS', 'XX', 'XX', 'Negado'],
                  ['NEOPLÁSICOS', 'XX', 'XX', 'Negado'],
                  ['PSIQUIÁTRICOS', 'XX', 'XX', 'Negado'],
                  ['EPILÉPTICOS', 'XX', 'XX', 'Negado'],
                  ['LUÉTICOS', 'XX', 'XX', 'Negado'],
                  ['FÍMICOS', 'XX', 'XX', 'Negado'],
                  ['HEPATOPATÍAS', 'XX', 'XX', 'Negado'],
                ].map(row => row.map((text, i) => ({
                  text,
                  style: i === 0 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera columna
                  alignment: i === 0 ? 'left' : 'center', // Alinea a la izquierda para la primera columna
                }))),
              ],
            },
            layout: {
              hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
              vLineWidth: () => 0,
              hLineColor: () => '#9ca3af',
              paddingTop: (i: number, node: any) => 0,
              paddingBottom: (i: number, node: any) => 0,
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
                  { text: 'ANTECEDENTES PERSONALES PATOLÓGICOS', style: 'tableHeader', colSpan: 4, alignment: 'center' },
                  {}, {}, {}
                ],
                [
                  { text: '-', style: 'tableHeader', alignment: 'center' },
                  { text: 'Sí', style: 'tableHeader', alignment: 'center' },
                  { text: 'No', style: 'tableHeader', alignment: 'center' },
                  { text: 'Especifique', style: 'tableHeader', alignment: 'center' },
                ],
                // Filas de datos
                ...[
                  ['LUMBALGIAS', 'XX', 'XX', 'Negado'],
                  ['DIABÉTICOS', 'XX', 'XX', 'Negado'],
                  ['CARDIOPÁTICOS', 'XX', 'XX', 'Negado'],
                  ['ALÉRGICOS', 'XX', 'XX', 'Negado'],
                  ['HIPERTENSIVOS', 'XX', 'XX', 'Negado'],
                  ['OBESIDAD', 'XX', 'XX', 'Negado'],
                  ['EPILÉPTICOS', 'XX', 'XX', 'Negado'],
                  ['ACCIDENTES', 'XX', 'XX', 'Negado'],
                  ['QUIRÚRGICOS', 'XX', 'XX', 'Negado'],
                  ['TRAUMÁTICOS', 'XX', 'XX', 'Negado'],
                ].map(row => row.map((text, i) => ({
                  text,
                  style: i === 0 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera columna
                  alignment: i === 0 ? 'left' : 'center', // Alinea a la izquierda para la primera columna
                }))),
              ],
            },
            layout: {
              hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
              vLineWidth: () => 0,
              hLineColor: () => '#9ca3af',
              paddingTop: (i: number, node: any) => 0,
              paddingBottom: (i: number, node: any) => 0,
              paddingLeft: (i: number, node: any) => 2,
              paddingRight: (i: number, node: any) => 2,
            },
            
          },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        columns: [
          // Antecedentes Personales No Patológicos
          {
            style: 'table',
            table: {
              widths: ['30%', '12%', '12%', '*'],
              body: [
                // Encabezado
                [
                  { text: 'ANTECEDENTES HEREDOFAMILIARES', style: 'tableHeader', colSpan: 4, alignment: 'center' },
                  {}, {}, {}
                ],
                [
                  { text: '-', style: 'tableHeader', alignment: 'center' },
                  { text: 'Sí', style: 'tableHeader', alignment: 'center' },
                  { text: 'No', style: 'tableHeader', alignment: 'center' },
                  { text: 'Especifique', style: 'tableHeader', alignment: 'center' },
                ],
                // Filas de datos
                ...[
                  ['ALCOHOLISMO', 'XX', 'XX', 'Negado'],
                  ['TABAQUISMO', 'XX', 'XX', 'Negado'],
                  ['TOXICOMANIAS', 'XX', 'XX', 'Negado'],
                ].map(row => row.map((text, i) => ({
                  text,
                  style: i === 0 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera columna
                  alignment: i === 0 ? 'left' : 'center', // Alinea a la izquierda para la primera columna
                }))),
              ],
            },
            layout: {
              hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
              vLineWidth: () => 0,
              hLineColor: () => '#9ca3af',
              paddingTop: (i: number, node: any) => 0,
              paddingBottom: (i: number, node: any) => 0,
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
                  { text: 'ANTECEDENTES PERSONALES PATOLÓGICOS', style: 'tableHeader', colSpan: 4, alignment: 'center' },
                  {}, {}, {}
                ],
                [
                  { text: '-', style: 'tableHeader', alignment: 'center' },
                  { text: 'Sí', style: 'tableHeader', alignment: 'center' },
                  { text: 'No', style: 'tableHeader', alignment: 'center' },
                  { text: 'Especifique', style: 'tableHeader', alignment: 'center' },
                ],
                // Filas de datos
                ...[
                  ['ALIMENTACIÓN', 'XX', 'XX', 'Negado'],
                  ['ACTIVIDAD FÍSICA', 'XX', 'XX', 'Negado'],
                  ['HIGIENE PERSONAL', 'XX', 'XX', 'Negado'],
                ].map(row => row.map((text, i) => ({
                  text,
                  style: i === 0 ? 'tableCellBold' : 'tableCell', // Aplica estilo específico si es la primera columna
                  alignment: i === 0 ? 'left' : 'center', // Alinea a la izquierda para la primera columna
                }))),
              ],
            },
            layout: {
              hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
              vLineWidth: () => 0,
              hLineColor: () => '#9ca3af',
              paddingTop: (i: number, node: any) => 0,
              paddingBottom: (i: number, node: any) => 0,
              paddingLeft: (i: number, node: any) => 2,
              paddingRight: (i: number, node: any) => 2,
            },
            
          },
        ],
        margin: [0, 0, 0, 8],
      },
      // Antecedentes Laborales
      {
        style: 'table',
        table: {
          widths: ['3%', '22%', '25%', '17%', '*'],
          body: [
            // Encabezado
            [
              { text: 'ANTECEDENTES LABORALES', style: 'tableHeader', colSpan: 5, alignment: 'center' },
              {}, {}, {}, {}
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
              ['1', 'Leche Yaqui', 'Soldador', '3 años, 2 meses', 'Ergonómicos, Ruido, Polvos'],
              ['2', 'Grupo GEPP', 'Tecnico Mantenimiento', '10 años', 'Ergonómicos, Ruido, Polvos'],
              ['3', 'Aceros Guamuchil', 'Supervisor', '2 semanas', 'Ergonómicos, Ruido, Polvos'],
            ].map(row => row.map((text, i) => ({
              text,
              style: i === 0 ? 'tableCell' : 'tableCell',
              alignment: 'center', 
            }))),
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => '#9ca3af',
          paddingTop: (i: number, node: any) => 0,
          paddingBottom: (i: number, node: any) => 0,
          paddingLeft: (i: number, node: any) => 2,
          paddingRight: (i: number, node: any) => 2,
        },
        margin: [0, 0, 0, 8],
      },
      // Antecedentes Laborales 2da parte
      {
        style: 'table',
        table: {
          widths: ['20%', '10%', '5%', '5%', '5%', '5%', '*'], // 7 columnas
          body: [
            // Fila principal con encabezado
            [
              { text: 'SUFRIÓ ALGÚN ACCIDENTE DE TRABAJO', style: 'tableCellBold', alignment: 'left', colSpan: 2 },
              {}, // Segunda columna para el colSpan
              { text: 'NO', style: 'tableCellBold', alignment: 'center' },
              { text: 'XX', style: 'tableCell', alignment: 'center' },
              { text: 'SI', style: 'tableCellBold', alignment: 'center' },
              { text: 'XX', style: 'tableCell', alignment: 'center' },
              { text: 'Niega haber sufrido algún accidente', style: 'tableCell', alignment: 'center' },
            ],
            // Fila para "Describa el daño"
            [
              { text: 'DESCRIBA EL DAÑO', style: 'tableCellBold', alignment: 'left' },
              { text: 'Ninguno', colSpan: 6, style: 'tableCell', alignment: 'center' },
              {}, {}, {}, {}, {},
            ],
            // Fila para "Secuelas"
            [
              { text: 'SECUELAS', style: 'tableCellBold', alignment: 'left' },
              { text: 'Sin secuelas', colSpan: 6, style: 'tableCell', alignment: 'center' },
              {}, {}, {}, {}, {},
            ],
          ],
        },
        layout: {
          hLineColor: '#9ca3af',
          vLineColor: '#9ca3af',
          paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
          paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
          paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
          paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
          hLineWidth: () => 1,
          vLineWidth: () => 1,
        },
        margin: [0, 0, 0, 8],
      },
      // Resumen Historia Clínica
      {
        style: 'table',
        table: {
          widths: ['30%', '70%'],
          body: [
            // Encabezado
            [
              { text: 'RESUMEN DE HISTORIA CLÍNICA', style: 'tableHeader', colSpan: 2, alignment: 'center' },
              {}
            ],
            [
              { text: 'Resumen', style: 'tableCellBold', alignment: 'center' },
              { text: 'Se refiere actualmente asintomático', style: 'tableCell', alignment: 'center' },
            ],
          ],
        },
        layout: {
          hLineColor: '#9ca3af',
          vLineColor: '#9ca3af',
          paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
          paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
          paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
          paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
          hLineWidth: () => 1,
          vLineWidth: () => 1,
        },
        margin: [0, 0, 0, 8],
      },
    ],
    // Pie de pagina
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
                {
                  text: 'Dr. Jesús Manuel Coronel Valenzuela\n',
                  bold: true,
                  italics: true,
                },
                {
                  text: 'Cédula Profesional Médico Cirujano No. 1379978\n',
                  bold: false,
                  italics: true,
                },
                {
                  text: 'Cédula Especialidad Med. del Trab. No. 3181172\n',
                  bold: false,
                  italics: true,
                },
                {
                  text: 'Certificado Consejo Mex. de Med. Trab. No.891',
                  bold: false,
                  italics: true,
                },
              ],
              fontSize: 8,
              margin: [40, 0, 0, 0],
            },
            firma,
            {
              text: [
                {
                  text: 'Asesoría Médico Empresarial de Sinaloa\n',
                  bold: true,
                  italics: true,
                },
                {
                  text: 'Ángel Flores No. 2072 Norte, Fracc Las Fuentes.\n',
                  bold: false,
                  italics: true,
                },
                {
                  text: 'Los Mochis, Ahome, Sinaloa. Tel. (668) 136 3973\n',
                  bold: false,
                  italics: true,
                },
                {
                  text: 'www.ames.org.mx',
                  bold: false,
                  link: 'https://www.ames.org.mx',
                  italics: true,
                  color: 'blue',
                },
              ],
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
