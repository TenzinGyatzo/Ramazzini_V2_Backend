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
  signoVital: { fontSize: 9 },
  // value: { bold: true, fontSize: 11 },
  paragraph: { fontSize: 11, alignment: 'justify' },
  tableHeader: {
    fillColor: '#343A40',
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
const headerText: Content = {
  text: '                                                              CONSTANCIA DE VALORACIÓN MÉDICA\n',
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

function construirSignosVitales(notaMedica): Content {
  const signosVitales = [];

  const agregarDato = (etiqueta, valor, unidad) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      if (signosVitales.length > 0) {
        signosVitales.push({ text: '  |  ' }); // Agrega el separador solo si ya hay datos previos
      }
      signosVitales.push({ text: ` ${etiqueta}: `, bold: true });
      signosVitales.push({ text: `${valor}${unidad}` });
    }
  };

  agregarDato('TA', 
    notaMedica.tensionArterialSistolica && notaMedica.tensionArterialDiastolica 
      ? `${notaMedica.tensionArterialSistolica}/${notaMedica.tensionArterialDiastolica}` 
      : null, 
    ' mmHg'
  );
  agregarDato('FC', notaMedica.frecuenciaCardiaca, ' lpm');
  agregarDato('FR', notaMedica.frecuenciaRespiratoria, ' lpm');
  agregarDato('Temp', notaMedica.temperatura, ' °C');
  agregarDato('SatO2', notaMedica.saturacionOxigeno, '%');

  return {
    text: [
      { text: 'Signos Vitales: ', bold: true },
      ...signosVitales
    ],
    margin: [0, 0, 0, 10],
    style: 'paragraph'
  };
}

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
  edad: string;
  puesto: string;
  sexo: string;
  escolaridad: string;
  antiguedad: string;
  telefono: string;
  estadoCivil: string;
  numeroEmpleado: string;
}

interface NotaMedica {
  tipoNota: string;
  fechaNotaMedica: Date;
  motivoConsulta: string;
  antecedentes: string;
  exploracionFisica: string;
  tensionArterialSistolica: number;
  tensionArterialDiastolica: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  temperatura: number;
  saturacionOxigeno: number;
  diagnostico: string;
  tratamiento: string[];
  recomendaciones: string[];
  observaciones: string;
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
export const notaMedicaInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  notaMedica: NotaMedica,
  medicoFirmante: MedicoFirmante,
  proveedorSalud: ProveedorSalud,
): TDocumentDefinitions => {

  const firma: Content = medicoFirmante.firma?.data
  ? { image: `assets/signatories/${medicoFirmante.firma.data}`, width: 65 }
  : { text: '' };

  const logo: Content = proveedorSalud.logotipoEmpresa?.data
  ? { image: `assets/providers-logos/${proveedorSalud.logotipoEmpresa.data}`, width: 55, margin: [40, 20, 0, 0] }
  : { text: '' };

  const tipoNota = notaMedica.tipoNota;
  const tipoNotaTexto = [
    { text: 'Inicial (', style: 'fecha' },
    {
      text: tipoNota === 'Inicial' ? 'X' : ' ',
      style: 'fecha',
      bold: tipoNota === 'Inicial',
    },
    { text: ')    Seguimiento (', style: 'fecha' },
    {
      text: tipoNota === 'Seguimiento' ? 'X' : ' ',
      style: 'fecha',
      bold: tipoNota === 'Seguimiento',
    },
    { text: ')    Alta (', style: 'fecha' },
    {
      text: tipoNota === 'Alta' ? 'X' : ' ',
      style: 'fecha',
      bold: tipoNota === 'Alta',
    },
    { text: ')', style: 'fecha' },
  ];

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 70, 40, 80],
    header: {
      columns: [logo, headerText],
    },
    content: [
      // Fecha
      {
        style: 'table',
        table: {
          widths: ['75%', '25%'],
          body: [
        [
          {
            text: tipoNotaTexto,
            style: 'fecha',
            alignment: 'right',
            margin: [0, 4, 0, 0],
          },
          {
            text: [
          { text: 'Fecha: ', style: 'fecha', bold: false },
          {
            text: formatearFechaUTC(notaMedica.fechaNotaMedica),
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
          widths: ['70%', '30%'],
          body: [
        [
          {
                            text: formatearNombreTrabajador(trabajador),
            style: 'nombreEmpresa',
            alignment: 'left',
            margin: [0, 0, 0, 0],
          },
          {
            text: [
          { text: 'CEL: ', style: 'fecha', bold: false },
          {
            text: trabajador.telefono ? `${trabajador.telefono}` : 'No disponible',
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
        text: [
          { text: `Se trata de ` },
          { text: trabajador.sexo === 'Masculino' ? 'un trabajador' : 'una trabajadora', bold: true },
          { text: ` de ` },
          { text: ` ${trabajador.edad} `, bold: true },
          { text: ` de edad, que labora en la empresa ` },
          { text: `${nombreEmpresa}`, bold: true },
          { text: `, ocupando el puesto de ` },
          { text: `${trabajador.puesto}`, bold: true },
          { text: `, con escolaridad ` },
          { text: `${trabajador.escolaridad}`, bold: true },
          { text: ` y una antigüedad de ` },
          { text: `${trabajador.antiguedad}`, bold: true },
          { text: `. Estado civil: ` },
          { text: `${trabajador.estadoCivil}`, bold: true },
          { text: `, número de empleado: ` },
          { text: `${trabajador.numeroEmpleado}`, bold: true }
        ],
        margin: [0, 0, 0, 10],
        style: 'paragraph'
      },
      // Motivo de consulta
      {
        text: [
          { text: `Motivo de consulta:`, bold: true },
          { text: ` ${notaMedica.motivoConsulta} `},
        ],
        margin: [0, 0, 0, 10],
        style: 'paragraph'
      },

      // Antecedentes
      notaMedica.antecedentes ? {
        text: [
          { text: `Antecedentes:`, bold: true },
          { text: ` ${notaMedica.antecedentes} `},
        ],
        margin: [0, 0, 0, 10],
        style: 'paragraph'
      } : null,

      // Exploracion Física
      {
        text: [
          { text: `Exploración Física:`, bold: true },
          { text: ` ${notaMedica.exploracionFisica} `},
        ],
        margin: [0, 0, 0, 10],
        style: 'paragraph'
      },
      
      // Signos Vitales
      construirSignosVitales(notaMedica),

      // Diagnóstico
      {
        text: [
          { text: `IDX:`, bold: true },
          { text: ` ${notaMedica.diagnostico.toUpperCase()} `, bold: true },
        ],
        margin: [0, 0, 0, 10],
        style: 'paragraph'
      },

      // Tratamiento
      notaMedica.tratamiento && notaMedica.tratamiento.length > 0 ? {
        text: [
          { text: `TX:`, bold: true },
          ...notaMedica.tratamiento.flatMap((item, index) => ([
            { text: `\n     ${index + 1}. `, preserveLeadingSpaces: true }, // Espacios antes del número
            { text: item, bold: true }
          ])) // 🔹 Se usa `flatMap` para evitar la anidación de arrays
        ],
        margin: [0, 0, 0, 10], // Mantiene formato correcto
        style: 'paragraph'
      } : undefined,  // 🔹 Se usa `undefined` en lugar de `null`

      // Recomendaciones
      notaMedica.recomendaciones && notaMedica.recomendaciones.length > 0 ? {
        text: [
          { text: `Recomendaciones:`, bold: true }, // Solo la etiqueta en negrita
          ...notaMedica.recomendaciones.flatMap((item, index) => ([
            { text: `\n     ${String.fromCharCode(97 + index)}. `, preserveLeadingSpaces: true }, // Letra en lugar de número
            { text: item } // Texto normal, sin negrita
          ])) // 🔹 `flatMap` evita arrays anidados
        ],
        margin: [0, 0, 0, 10], // Mantiene formato correcto
        style: 'paragraph'
      } : undefined, // 🔹 Se usa `undefined` en lugar de `null`      

      // Observaciones
      notaMedica.observaciones ? {
        text: [
          { text: `Observaciones:`, bold: true },
          { text: ` ${notaMedica.observaciones} `},
        ],
        margin: [0, 0, 0, 10],
        style: 'paragraph'
      } : null,
      
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
    styles: styles,
  };
};
