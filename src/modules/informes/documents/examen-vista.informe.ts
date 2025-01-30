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
const headerText: Content = {
  text: '                                                                                              EXAMEN DE LA VISTA\n',
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

function formatearTelefono(telefono: string): string {
  if (!telefono || telefono.length !== 10) {
    return 'Teléfono inválido';  // Mensaje de error si el número no tiene 10 dígitos
  }
  return `(${telefono.slice(0, 3)}) ${telefono.slice(3, 6)} ${telefono.slice(6)}`;
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
export const examenVistaInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  examenVista: ExamenVista,
  medicoFirmante: MedicoFirmante,
  proveedorSalud: ProveedorSalud,
): TDocumentDefinitions => {

  const firma: Content = medicoFirmante.firma?.data
  ? { image: `assets/signatories/${medicoFirmante.firma.data}`, width: 65 }
  : { text: '' };

  const logo: Content = proveedorSalud.logotipoEmpresa?.data
  ? { image: `assets/providers-logos/${proveedorSalud.logotipoEmpresa.data}`, width: 55, margin: [40, 20, 0, 0] }
  : { text: '' };

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
                    text: formatearFechaUTC(examenVista.fechaExamenVista),
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
                      text: `${medicoFirmante.nombreCredencialAdicional} No. ${medicoFirmante.numeroCredencialAdicional}\n`,
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
