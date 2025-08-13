import type {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';

// ==================== ESTILOS ====================
const styles: StyleDictionary = {
  header: {
    fontSize: 22,
    bold: true,
    color: '#2C3E50',
    alignment: 'center',
    margin: [0, 0, 0, 20],
  },
  nombreEmpresa: {
    fontSize: 16,
    bold: true,
    alignment: 'center',
    color: '#34495E',
    margin: [0, 0, 0, 15],
  },
  fecha: {
    fontSize: 14,
    alignment: 'right',
    color: '#2C3E50',
    margin: [0, 13, 18, 0],
    bold: true,
  },
  sectionHeader: {
    fontSize: 14,
    bold: true,
    color: '#2C3E50',
    margin: [0, 15, 0, 5],
    decoration: 'underline',
    decorationColor: '#3498DB',
  },
  label: { 
    fontSize: 12,
    bold: true,
    color: '#34495E',
    margin: [0, 5, 0, 2],
  },
  value: { 
    fontSize: 12,
    color: '#2C3E50',
    margin: [0, 0, 0, 8],
  },
  medicamento: {
    fontSize: 16,
    bold: true,
    color: '#E74C3C',
    margin: [0, 6, 0, 0],
  },
  dosis: {
    fontSize: 12,
    color: '#2C3E50',
    margin: [20, 0, 0, 3],
  },
  frecuencia: {
    fontSize: 12,
    color: '#7F8C8D',
    margin: [20, 0, 0, 8],
    italics: true,
  },
  paragraph: { 
    fontSize: 12, 
    alignment: 'justify',
    lineHeight: 1.4,
    color: '#2C3E50',
  },
  tableHeader: {
    fillColor: '#3498DB',
    color: '#FFFFFF',
    bold: true,
    fontSize: 12,
    alignment: 'center',
    margin: [3, 3, 3, 3],
  },
  tableCell: {
    fontSize: 12,
    color: '#2C3E50',
    margin: [3, 3, 3, 3],
  },
  firma: {
    fontSize: 10,
    color: '#7F8C8D',
    alignment: 'center',
    margin: [0, 0, 0, 0],
  },
  piePagina: {
    fontSize: 9,
    color: '#95A5A6',
    alignment: 'center',
    margin: [0, 5, 0, 0],
  },
};

// ==================== FUNCIONES REUSABLES ====================
function formatearFechaUTC(fecha: Date): string {
  if (!fecha || isNaN(fecha.getTime())) return '';

  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = fecha.getUTCMonth();
  const año = fecha.getUTCFullYear();

  const nombresMeses = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];

  return `${dia}-${nombresMeses[mes]}-${año}`;
}

function formatearTelefono(telefono: string): string {
  if (!telefono || telefono.length !== 10) {
    return 'No disponible';
  }
  return `(${telefono.slice(0, 3)}) ${telefono.slice(3, 6)} ${telefono.slice(6)}`;
}

// ==================== INTERFACES ====================
interface Trabajador {
  nombre: string;
  edad: string;
  sexo: string;
}

interface Receta {
  fechaReceta: Date;
  medicamentos: string[];
  diagnostico?: string;
  indicaciones?: string;
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
export const recetaInforme = (
  trabajador: Trabajador,
  receta: Receta,
  medicoFirmante: MedicoFirmante,
  proveedorSalud: ProveedorSalud,
): TDocumentDefinitions => {

  const firma: Content = medicoFirmante.firma?.data
    ? { image: `assets/signatories/${medicoFirmante.firma.data}`, width: 100, height: 100, margin: [50, 0, 0, 0]  }
    : { text: '_________________', style: 'firma' };

  const logo: Content = proveedorSalud.logotipoEmpresa?.data
    ? { image: `assets/providers-logos/${proveedorSalud.logotipoEmpresa.data}`, width: 100, height: 100, margin: [50, 0, 0, 0] }
    : { text: '' };

  return {
    pageSize: 'LETTER',
    pageMargins: [50, 80, 50, 80],
    header: {
      columns: [
        logo,
        {
          text: 'RECETA MÉDICA',
          style: 'header',
          alignment: 'center',
          margin: [0, 25, 0, 0],
        }
      ],
      margin: [0, 20, 0, 35],
    },
    content: [
      // Datos del trabajador
      {
        columns: [
          {
            text: 'PACIENTE',
            style: 'sectionHeader',
            width: '50%',
          },
          {
            text: `Fecha: ${formatearFechaUTC(receta.fechaReceta)}`,
            style: 'fecha',
            width: '50%',
          }
        ],
        margin: [0, 30, 0, 0]
      },
      {
        stack: [
          { text: 'Nombre:', style: 'label' },
          { text: trabajador.nombre, style: 'value' },
          {
            columns: [
              {
                width: '15%',
                stack: [
                  { text: 'Sexo:', style: 'label' },
                  { text: trabajador.sexo, style: 'value' },
                ]
              },
              {
                width: '15%',
                stack: [
                  { text: 'Edad:', style: 'label' },
                  { text: trabajador.edad, style: 'value' },
                ]
              }
            ]
          }
        ],
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },

      // Medicamentos
      {
        text: 'MEDICAMENTO',
        style: 'sectionHeader',
      },
      ...receta.medicamentos.flatMap((medicamento, index) => [
        {
          text: `${index + 1}. ${medicamento}`,
          style: 'medicamento',
        },
        { text: '', margin: [0, 0, 0, 0] as [number, number, number, number] }, // Espacio entre medicamentos
      ]),

      // Firma del médico
      {
        absolutePosition: { x: 50, y: 555 }, // Posición absoluta desde la esquina superior izquierda
        columns: [
          {
            width: '62%',
            stack: [
              { text: 'MÉDICO TRATANTE', style: 'sectionHeader', margin: [0, 0, 0, 5] as [number, number, number, number] },
              medicoFirmante.tituloProfesional ? {
                text: `${medicoFirmante.tituloProfesional} ${medicoFirmante.nombre}`,
                style: 'value',
                bold: true,
              } : undefined,
              medicoFirmante.numeroCedulaProfesional ? {
                text: `Cédula Profesional: ${medicoFirmante.numeroCedulaProfesional}`,
                style: 'value',
              } : undefined,
              medicoFirmante.numeroCedulaEspecialista ? {
                text: `Cédula Especialidad: ${medicoFirmante.numeroCedulaEspecialista}`,
                style: 'value',
              } : undefined,
              medicoFirmante.nombreCredencialAdicional ? {
                 text: medicoFirmante.numeroCredencialAdicional 
                   ? `${medicoFirmante.nombreCredencialAdicional}: ${medicoFirmante.numeroCredencialAdicional}`
                   : medicoFirmante.nombreCredencialAdicional,
                 style: 'value',
               } : undefined,
            ].filter(item => item !== undefined),
          },
          {
            width: '38%',
            stack: [
              { text: 'FIRMA:', style: 'sectionHeader', alignment: 'center', margin: [0, 0, 0, 10] as [number, number, number, number] },
              firma,
            ],
          }
        ],
        // Eliminamos el margin ya que no es necesario con posicionamiento absoluto
      },
    ],
    
    // Pie de página
    footer: {
      stack: [
        {
          canvas: [
            {
              type: 'line',
              x1: 50,
              y1: 0,
              x2: 550,
              y2: 0,
              lineWidth: 1,
              lineColor: '#3498DB',
            },
          ],
          margin: [0, 0, 0, 5]
        },
        {
          text: [
            { text: proveedorSalud.nombre, style: 'piePagina', bold: true },
            { text: '\n' },
            { text: proveedorSalud.direccion, style: 'piePagina' },
            { text: ` ${proveedorSalud.municipio}, ${proveedorSalud.estado}`, style: 'piePagina' },
            { text: ` Tel: ${formatearTelefono(proveedorSalud.telefono)}`, style: 'piePagina' },
          ],
          alignment: 'center',
        },
      ],
    },
    
    // Estilos
    styles: styles,
  };
};
