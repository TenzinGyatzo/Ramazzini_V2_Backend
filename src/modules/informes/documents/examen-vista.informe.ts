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
  sectionHeader: {
    fontSize: 12,
    bold: true,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  label: { fontSize: 11 },
  value: { bold: true, fontSize: 11, margin: [0, 0, 0, 0] },
  tableHeader: {
    fillColor: '#262626',
    color: '#FFFFFF',
    bold: true,
    fontSize: 12,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  tableCell: {
    fontSize: 11,
    bold: false,
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  tableCellBold: {
    fontSize: 11,
    bold: true,
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
  text: '                                                                                                EXAMEN DE LA VISTA\n',
  style: 'header',
  alignment: 'right',
  margin: [0, 35, 40, 0],
};

const firma: Content = {
  image: 'src/assets/Firma-Dr-Coronel.png',
  width: 32,
};

// ==================== FUNCIONES REUSABLES ====================
const createTableCell = (text: string, style: string): Content => ({
  text,
  style,
  alignment: 'center',
  margin: [4, 4, 4, 4],
});

const createConditionalTableCell = (text: string): Content => ({
  text: text.toUpperCase(),
  style: 'tableCell',
  alignment: 'center',
  margin: [4, 4, 4, 4],
  color: text.toUpperCase() === 'POSITIVO' ? 'red' : 'black', // Aplica rojo si es "POSITIVO"
});

// ==================== INTERFACES ====================


interface Trabajador {
  nombre: string;
  edad: string;
  puesto: string;
  sexo: string;
  escolaridad: string;
  antiguedad: string;
}

interface ExamenVista {
  fechaExamenVista: Date;
  ojoIzquierdoLejanaSinCorreccion: number;
  ojoDerechoLejanaSinCorreccion: number;
  sinCorreccionLejanaInterpretacion: string;
  requiereLentesUsoGeneral: string;
  ojoIzquierdoCercanaSinCorreccion: number;
  ojoDerechoCercanaSinCorreccion: number;
  sinCorreccionCercanaInterpretacion: string;
  requiereLentesParaLectura: string;
  ojoIzquierdoLejanaConCorreccion?: number;
  ojoDerechoLejanaConCorreccion?: number;
  conCorreccionLejanaInterpretacion?: string;
  ojoIzquierdoCercanaConCorreccion?: number;
  ojoDerechoCercanaConCorreccion?: number;
  conCorreccionCercanaInterpretacion?: string;
  placasCorrectas: number;
  porcentajeIshihara: number;
  interpretacionIshihara: string;
}

// ==================== INFORME PRINCIPAL ====================
export const examenVistaInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  examenVista: ExamenVista,
): TDocumentDefinitions => {
  return {
    pageSize: 'LETTER',
    pageMargins: [40, 70, 40, 80],
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
                    text: examenVista.fechaExamenVista
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
              { text: 'ESCOLARIDAD', style: 'label' },
              { text: trabajador.escolaridad, style: 'value' },
              { text: 'ANTIGÜEDAD', style: 'label' },
              { text: trabajador.antiguedad, style: 'value' },
            ],
          ],
        },
        layout: {
          hLineColor: '#e5e7eb',
          vLineColor: '#e5e7eb',
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
          paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
          paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
          paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
        },
        margin: [0, 0, 0, 10],
      },
      // Agudeza Visual Sin Corrección
      {
        style: 'table',
        table: {
          widths: ['20%', '20%', '20%', '*'],
          body: [
            // Encabezado
            [
              {
                text: 'AGUDEZA VISUAL SIN CORRECCIÓN',
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
              { text: 'OJO IZQUIERDO', style: 'tableHeader', alignment: 'center' },
              { text: 'OJO DERECHO', style: 'tableHeader', alignment: 'center' },
              { text: 'INTERPRETACIÓN', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de datos
            ...[
              [
                'LEJANA',
                `20/${examenVista.ojoIzquierdoLejanaSinCorreccion}`,
                `20/${examenVista.ojoDerechoLejanaSinCorreccion}`,
                examenVista.sinCorreccionLejanaInterpretacion,
              ],
              [
                'CERCANA',
                `20/${examenVista.ojoIzquierdoCercanaSinCorreccion}`,
                `20/${examenVista.ojoDerechoCercanaSinCorreccion}`,
                examenVista.sinCorreccionCercanaInterpretacion,
              ],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: '#e5e7eb',
          vLineColor: '#e5e7eb',
          paddingTop: (i: number, node: any) => 0,
          paddingBottom: (i: number, node: any) => 0,
          paddingLeft: (i: number, node: any) => 2,
          paddingRight: (i: number, node: any) => 2,
        },
        margin: [0, 0, 0, 10],
      },
      // Requiere Lentes
      {
        columns: [
          {
            text: [
              {
                text: `Requiere Lentes de Uso General: `,
              },
              {
                text: `(${examenVista.requiereLentesUsoGeneral})`, bold: true
              }
            ]
          },
          {
            text: [
              {
                text: `Requiere Lentes para Lectura: `,
              },
              {
                text: `(${examenVista.requiereLentesParaLectura})`, bold: true
              }
            ]
          }
        ],
        margin: [0, 0, 0, 12],
      },
      // Agudeza Visual Con Corrección
      {
        style: 'table',
        table: {
          widths: ['20%', '20%', '20%', '*'],
          body: [
            // Encabezado
            [
              {
                text: 'AGUDEZA VISUAL CON CORRECCIÓN',
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
              { text: 'OJO IZQUIERDO', style: 'tableHeader', alignment: 'center' },
              { text: 'OJO DERECHO', style: 'tableHeader', alignment: 'center' },
              { text: 'INTERPRETACIÓN', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de datos
            ...[
              [
                'LEJANA',
                examenVista.ojoIzquierdoLejanaConCorreccion
                  ? `20/${examenVista.ojoIzquierdoLejanaConCorreccion}`
                  : 'NA',
                examenVista.ojoDerechoLejanaConCorreccion
                  ? `20/${examenVista.ojoDerechoLejanaConCorreccion}`
                  : 'NA',
                examenVista.conCorreccionLejanaInterpretacion ?? 'NA',
              ],
              [
                'CERCANA',
                examenVista.ojoIzquierdoCercanaConCorreccion
                  ? `20/${examenVista.ojoIzquierdoCercanaConCorreccion}`
                  : 'NA',
                examenVista.ojoDerechoCercanaConCorreccion
                  ? `20/${examenVista.ojoDerechoCercanaConCorreccion}`
                  : 'NA',
                examenVista.conCorreccionCercanaInterpretacion ?? 'NA',
              ],
            ].map((row) =>
              row.map((text, i) => ({
                text,
                style: i === 0 ? 'tableCellBold' : 'tableCell',
                alignment: 'center',
              })),
            ),
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: '#e5e7eb',
          vLineColor: '#e5e7eb',
          paddingTop: (i: number, node: any) => 0,
          paddingBottom: (i: number, node: any) => 0,
          paddingLeft: (i: number, node: any) => 2,
          paddingRight: (i: number, node: any) => 2,
        },
        margin: [0, 0, 0, 10],
      },
      // Prueba de Ishihara
      {
        style: 'table',
        table: {
          widths: ['33.33%', '33.33%', '*'],
          body: [
            // Encabezado
            [
              {
                text: 'PRUEBA DE ISHIHARA',
                style: 'tableHeader',
                colSpan: 3,
                alignment: 'center',
              },
              {},
              {},
            ],
            [
              { text: 'PLACAS CORRECTAS', style: 'tableHeader', alignment: 'center' },
              { text: 'PORCENTAJE', style: 'tableHeader', alignment: 'center' },
              { text: 'INTERPRETACIÓN', style: 'tableHeader', alignment: 'center' },
            ],
            // Filas de datos
            ...[
              [
                `${examenVista.placasCorrectas} de 14`,
                `${examenVista.porcentajeIshihara} %`,
                examenVista.interpretacionIshihara,
              ]
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
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: '#e5e7eb',
          vLineColor: '#e5e7eb',
          paddingTop: (i: number, node: any) => 0,
          paddingBottom: (i: number, node: any) => 0,
          paddingLeft: (i: number, node: any) => 2,
          paddingRight: (i: number, node: any) => 2,
        },
        margin: [0, 0, 0, 10],
      }
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
                },
                {
                  text: 'Cédula Profesional Médico Cirujano No. 1379978\n',
                  bold: false,
                },
                {
                  text: 'Cédula Especialidad Med. del Trab. No. 3181172\n',
                  bold: false,
                },
                {
                  text: 'Certificado Consejo Mex. de Med. Trab. No.891',
                  bold: false,
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
