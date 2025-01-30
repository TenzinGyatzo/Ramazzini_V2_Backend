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
    margin: [3, 3, 3, 3],
  },
  label: { fontSize: 11 },
  value: { bold: true, fontSize: 11 },
  tableHeader: {
    fillColor: '#262626',
    color: '#FFFFFF',
    bold: true,
    fontSize: 12,
    alignment: 'center',
    margin: [3, 3, 3, 3],
  },
  tableCell: {
    fontSize: 12,
    bold: true,
    alignment: 'center',
    margin: [3, 3, 3, 3],
  },
};

// ==================== CONTENIDO ====================
const logo: Content = {
  image: 'assets/AmesBrand.png',
  width: 60,
  margin: [40, 25, 0, 0],
};

const headerText: Content = {
  text: '                                                                                                         ANTIDOPING\n',
  style: 'header',
  alignment: 'right',
  margin: [0, 35, 40, 0],
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

function formatearFechaUTC(fecha: Date): string {
  if (!fecha || isNaN(fecha.getTime())) return '';

  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const año = fecha.getUTCFullYear();

  return `${dia}-${mes}-${año}`;
}
// ==================== INTERFACES ====================


interface Trabajador {
  nombre: string;
  edad: string;
  puesto: string;
  sexo: string;
  escolaridad: string;
  antiguedad: string;
}

interface Antidoping {
  fechaAntidoping: Date;
  marihuana: string;
  cocaina: string;
  anfetaminas: string;
  metanfetaminas: string;
  opiaceos: string;
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

// ==================== INFORME PRINCIPAL ====================
export const antidopingInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  antidoping: Antidoping,
  medicoFirmante: MedicoFirmante,
): TDocumentDefinitions => {

  const firma: Content = {
    image: `assets/signatories/${medicoFirmante.firma.data}`,
    width: 65,
  };

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
                    text: formatearFechaUTC(antidoping.fechaAntidoping),
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
        },
        margin: [0, 0, 0, 10],
      },
      // Tabla de resultados
      {
        style: 'table',
        table: {
          widths: ['33.33%', '33.33%', '33.33%'],
          body: [
            [
              createTableCell('DROGAS DE ABUSO', 'tableHeader'),
              createTableCell('RESULTADOS', 'tableHeader'),
              createTableCell('VALOR DE REFERENCIA', 'tableHeader'),
            ],
            [
              createTableCell('MARIHUANA', 'sectionHeader'),
              createConditionalTableCell(antidoping.marihuana),
              createTableCell('NEGATIVO', 'tableCell'),
            ],
            [
              createTableCell('COCAINA', 'sectionHeader'),
              createConditionalTableCell(antidoping.cocaina),
              createTableCell('NEGATIVO', 'tableCell'),
            ],
            [
              createTableCell('ANFETAMINAS', 'sectionHeader'),
              createConditionalTableCell(antidoping.anfetaminas),
              createTableCell('NEGATIVO', 'tableCell'),
            ],
            [
              createTableCell('METANFETAMINAS', 'sectionHeader'),
              createConditionalTableCell(antidoping.metanfetaminas),
              createTableCell('NEGATIVO', 'tableCell'),
            ],
            [
              createTableCell('OPIACEOS', 'sectionHeader'),
              createConditionalTableCell(antidoping.opiaceos),
              createTableCell('NEGATIVO', 'tableCell'),
            ],
          ],
        },
        layout: {
          hLineColor: '#e5e7eb',
          vLineColor: '#e5e7eb',
          hLineWidth: () => 1,
          vLineWidth: () => 1,
        },
        margin: [0, 0, 0, 10],
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
                  text: `${medicoFirmante.tituloProfesional} ${medicoFirmante.nombre}\n`,
                  bold: true,
                },
                {
                  text: `Cédula Profesional Médico Cirujano No. ${medicoFirmante.numeroCedulaProfesional}\n`,
                  bold: false,
                },
                {
                  text: `Cédula Especialidad Med. del Trab. No. ${medicoFirmante.numeroCedulaEspecialista}\n`,
                  bold: false,
                },
                {
                  text: `${medicoFirmante.nombreCredencialAdicional} No. ${medicoFirmante.numeroCredencialAdicional}\n`,
                  bold: false,
                },
              ],
              fontSize: 8,
              margin: [40, 0, 0, 0],
            },
            {
              ...firma,
              margin: [0, -3, 0, 0],  // Mueve el elemento más arriba
            },
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
