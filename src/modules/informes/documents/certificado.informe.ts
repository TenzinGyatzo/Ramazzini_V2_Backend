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
  paragraph: { fontSize: 11, alignment: 'justify' },
};

// ==================== CONTENIDO ====================
const headerText: Content = {
  text: '          CERTIFICADO MÉDICO DE NO IMPEDIMENTO FÍSICO (SALUD FÍSICA)\n',
  style: 'header',
  alignment: 'right',
  margin: [0, 35, 40, 0],
};

const campoFirma: Content = {
  stack: [
    // Línea horizontal para la firma
    {
      canvas: [
        {
          type: 'line',
          x1: 120,
          y1: 0,
          x2: 380,
          y2: 0,
          lineWidth: 1,
          lineColor: '#000000',
        },
      ],
      margin: [0, 10, 0, 0],
    },
    // Nombre y credenciales del médico
    {
      text: [
        {
          text: 'DR. JESÚS MANUEL CORONEL VALENZUELA\n',
          bold: true,
          fontSize: 12,
        },
        { text: 'CED PROF MEDICINA CIRUJANO No. 1379978\n', fontSize: 9 },
        {
          text: 'CED ESPECIALIDAD MEDICINA DEL TRABAJO No. 3181172\n',
          fontSize: 9,
        },
        {
          text: 'CERTIFICADO CONSEJO MEXICANO DE MED TRAB No. 891',
          fontSize: 9,
        },
      ],
      alignment: 'center',
      margin: [0, 0, 0, 0],
    },
  ],
  absolutePosition: { x: 65, y: 610 }, 
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

interface Certificado {
  fechaCertificado: Date;
  impedimentosFisicos: string;
}

interface ExamenVista {
  fechaExamenVista: Date;
  ojoIzquierdoLejanaSinCorreccion: number;
  ojoDerechoLejanaSinCorreccion: number;
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
export const certificadoInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  certificado: Certificado,
  examenVista: ExamenVista | null,
  medicoFirmante: MedicoFirmante,
  proveedorSalud: ProveedorSalud,
): TDocumentDefinitions => {

  const firma: Content = medicoFirmante.firma?.data
  ? { image: `assets/signatories/${medicoFirmante.firma.data}`, width: 150, absolutePosition: { x: 230, y: 530 } }
  : { text: '' };

  const logo: Content = proveedorSalud.logotipoEmpresa?.data
  ? { image: `assets/providers-logos/${proveedorSalud.logotipoEmpresa.data}`, width: 55, margin: [40, 20, 0, 0] }
  : { text: '' };

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 70, 40, 60],
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
                    text: formatearFechaUTC(certificado.fechaCertificado),
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
      // Información del médico
      {
        text: [
          {
            text: medicoFirmante.tituloProfesional === 'Dra.'
              ? 'La suscrita Médica Cirujano, con cédula profesional número '
              : 'El suscrito Médico Cirujano, con cédula profesional número ',
          },
          {
            text: `${medicoFirmante.numeroCedulaProfesional}. `,
            bold: true,
          },
          medicoFirmante.especialistaSaludTrabajo === 'Si'
          ? { text: 'Especialista en Medicina del Trabajo, ' }
          : { text: 'Con formación en Medicina y dedicado a la práctica en el ámbito de la salud laboral, ' },        
        
          {
            text: `${medicoFirmante.tituloProfesional} ${medicoFirmante.nombre}${medicoFirmante.especialistaSaludTrabajo === 'Si' ? '' : '.'}`,  // Sin espacio antes del punto
            bold: true,
          },
        
          medicoFirmante.especialistaSaludTrabajo === 'Si'
            ? {
                text: `, legalmente ${medicoFirmante.tituloProfesional === 'Dr.' ? 'autorizado' : 'autorizada'} por la Dirección General de Profesiones para ejercer la Especialidad en Medicina del Trabajo con cédula profesional número `,
              }
            : null,
        
          medicoFirmante.especialistaSaludTrabajo === 'Si'
            ? {
                text: `${medicoFirmante.numeroCedulaEspecialista}. `,
                bold: true,
              }
            : null,
        
          medicoFirmante.nombreCredencialAdicional
            ? {
                text: ` ${medicoFirmante.nombreCredencialAdicional} con número `,
              }
            : null,
        
          medicoFirmante.nombreCredencialAdicional
            ? {
                text: `${medicoFirmante.numeroCredencialAdicional}. `,
                bold: true,
              }
            : null,
        ].filter(item => item !== null),  // Filtra elementos nulos        
        style: 'paragraph',
        margin: [0, 20, 0, 0],
      },
      // Certificación
      {
        text: 'CERTIFICA',
        fontSize: 32,
        bold: false,
        alignment: 'center',
        characterSpacing: 5,
        margin: [0, 20, 0, 0],
      },
      {
        text: [
          {
        text: 'Que, habiendo practicado reconocimiento médico en esta fecha, al C. ',
          },
          { text: trabajador.nombre, bold: true },
          { text: ' de ' },
          { text: trabajador.edad, bold: true },
          {
        text: ' de edad, lo encontré íntegro físicamente, sin defectos ni anomalías del aparato locomotor, ',
          },
          {
        text: examenVista
          ? `con agudeza visual OI: 20/${examenVista.ojoIzquierdoLejanaSinCorreccion}, OD: 20/${examenVista.ojoDerechoLejanaSinCorreccion}, campo visual, profundidad de campo, estereopsis y percepción cromática `
          : `con agudeza visual, campo visual, profundidad de campo, estereopsis y percepción cromática `,
          },
          {
        text: 'sin alteraciones; agudeza auditiva, aparato respiratorio y aparato locomotor íntegros, el ',
          },
          { text: 'examen neurológico reveló buena coordinación y reflejos.' },
        ],
        style: 'paragraph',
        margin: [0, 20, 0, 0],
      },
      {
        text: [
          { text: 'Por lo anterior se establece que el C. ' },
          { text: trabajador.nombre + ' ', bold: true },
          {
        text: certificado.impedimentosFisicos,
          },
          {
        text: '. Este certificado de salud no implica ninguna garantía de que el trabajador no se lesionará o enfermará en el futuro.',
          },
        ],
        style: 'paragraph',
        margin: [0, 20, 0, 0],
      },

      {
        text: [
          {
        text: 'Expido el presente certificado médico a petición de el C. ',
          },
          { text: trabajador.nombre, bold: true },
          {
        text: ` para los usos legales a que haya lugar, en el municipio de ${proveedorSalud.municipio}, ${proveedorSalud.estado}, en la fecha mencionada al inicio de este certificado.`,
          },
        ],
        style: 'paragraph',
        margin: [0, 20, 0, 0],
      },
      // Firma del médico
      // campoFirma,
      firma,
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
          text: [
            {
              text: [
                proveedorSalud.direccion,
                proveedorSalud.municipio,
                proveedorSalud.estado,
              ]
                .filter(item => item)  // Elimina valores faltantes
                .join(', ') + '.' + (proveedorSalud.telefono ? ` Tel. ${formatearTelefono(proveedorSalud.telefono)}` : ''),  // Aplica el formato al teléfono
              bold: false,
              italics: true,
            },
            proveedorSalud.sitioWeb
              ? {
                  text: `\n${proveedorSalud.sitioWeb}`,
                  bold: false,
                  link: `https://${proveedorSalud.sitioWeb}`,
                  italics: true,
                  color: 'blue',
                }
              : null,
          ].filter(item => item !== null),  // Filtra elementos nulos          
          alignment: 'center',
          fontSize: 8,
          margin: [0, 0, 0, 0],
        },
      ],
    },
    // Estilos
    styles: styles,
  };
};
