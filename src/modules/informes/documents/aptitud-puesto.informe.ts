import type {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { Interface } from 'readline';

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
    fontSize: 10,
    lineHeight: 0.9,
    margin: [0, 0, 0, 0], // Reducir el margen superior e inferior
  },
  value: {
    bold: true,
    fontSize: 11,
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
    // fillColor: '#262626', // Casi Negro
    // fillColor: '#007BFF' // Azul profesional
    // fillColor: '#004085' // Azul Oscuro
    // fillColor: '#28A745' // Verde médico
    // fillColor: '#1E7E34' // Verde Oscuro
    // fillColor: '#6C757D' // Gris
    // fillColor: '#F8F9FA' // Gris Muy Claro
    // fillColor: '#DC3545' // Rojo Médico
    // fillColor: '#C82333' // Rojo Oscuro
    // fillColor: '#17A2B8' // Turquesa
    // fillColor: '#138496' // Turquesa Oscuro
    // fillColor: '#E0A800' // Oro (Se ve bien con texto blanco y texto negro)
    // fillColor: '' // 
    fillColor: '#343A40', // Gris Oscuro
    color: 'white',
    /* color: '#FFFFFF', */
    bold: true,
    fontSize: 11,
    alignment: 'center',
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
const headerText: Content = {
  text: '                                            EVALUACIÓN DE SALUD Y APTITUD AL PUESTO\n',
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
  color?: string
): Content => ({
  text,
  style,
  alignment,
  color,
});

const getColorForAptitud = (aptitudPuesto: string): string | undefined => {
  switch (aptitudPuesto) {
    case 'Apto Sin Restricciones':
      return undefined; // 'green'
    case 'Apto Con Precaución':
      return undefined; // 'orange'
    case 'Apto Con Restricciones':
      return undefined; // 'orange'
    case 'No Apto':
      return undefined; // 'red'
    case 'Evaluación No Completada':
    default:
      return undefined; // No cambia el color
  }
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

interface Aptitud {
  fechaAptitudPuesto: Date;
  evaluacionAdicional1: string;
  fechaEvaluacionAdicional1: Date;
  resultadosEvaluacionAdicional1: string;
  evaluacionAdicional2: string;
  fechaEvaluacionAdicional2: Date;
  resultadosEvaluacionAdicional2: string;
  evaluacionAdicional3: string;
  fechaEvaluacionAdicional3: Date;
  resultadosEvaluacionAdicional3: string;
  evaluacionAdicional4: string;
  fechaEvaluacionAdicional4: Date;
  resultadosEvaluacionAdicional4: string;
  evaluacionAdicional5: string;
  fechaEvaluacionAdicional5: Date;
  resultadosEvaluacionAdicional5: string;
  aptitudPuesto: string;
  alteracionesSalud: string;
  resultados: string;
  medidasPreventivas: string;
}

interface HistoriaClinica {
  fechaHistoriaClinica: Date;
  resumenHistoriaClinica: string;
}

interface ExploracionFisica {
  fechaExploracionFisica: Date;
  tensionArterialSistolica: number;
  tensionArterialDiastolica: number;
  categoriaTensionArterial: string;
  indiceMasaCorporal: number;
  categoriaIMC: string;
  circunferenciaCintura: number;
  categoriaCircunferenciaCintura: string;
  resumenExploracionFisica: string;
}

interface ExamenVista {
  fechaExamenVista: Date;
  ojoIzquierdoLejanaSinCorreccion: number;
  ojoDerechoLejanaSinCorreccion: number;
  sinCorreccionLejanaInterpretacion: string;
  ojoIzquierdoLejanaConCorreccion?: number;
  ojoDerechoLejanaConCorreccion?: number;
  conCorreccionLejanaInterpretacion?: string;
  porcentajeIshihara: number;
  interpretacionIshihara: string;
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
export const aptitudPuestoInforme = (
  nombreEmpresa: string,
  trabajador: Trabajador,
  aptitud: Aptitud,
  historiaClinica: HistoriaClinica | null,
  exploracionFisica: ExploracionFisica | null,
  examenVista: ExamenVista | null,
  antidoping: Antidoping | null,
  medicoFirmante: MedicoFirmante,
  proveedorSalud: ProveedorSalud,
): TDocumentDefinitions => {

  ///////////// ESPECÍFICO PARA EL DR. GARCÍA //////////////
  // Verificar si el RFC es el especificado
  const isRFCMatch = proveedorSalud.RFC === 'ECS171130Q41';

  // Clonamos los estilos y cambiamos fillColor antes de pasarlos a pdfMake
  const updatedStyles: StyleDictionary = { ...styles };

  updatedStyles.tableHeader = {
    ...updatedStyles.tableHeader,
    fillColor: isRFCMatch ? '#2BB9D9' : '#343A40', // Azul del logo
  };
  //////////////////////////////////////////////////////////

  const firma: Content = medicoFirmante.firma?.data
  ? { image: `assets/signatories/${medicoFirmante.firma.data}`, width: 65 }
  : { text: '' };

  const logo: Content = proveedorSalud.logotipoEmpresa?.data
  ? { image: `assets/providers-logos/${proveedorSalud.logotipoEmpresa.data}`, width: 55, margin: [40, 20, 0, 0] }
  : { text: '' };

  const header: Content = proveedorSalud.logotipoEmpresa?.data
  ? {
      columns: [logo, headerText],
    }
  : {
      columns: [
        {
          width: '*',
          text: headerText.text, // Mantén el texto pero ajusta márgenes y alineación
          style: 'header',
          alignment: 'right', // Alineación central para ocupar todo el espacio disponible
          margin: [0, 35, 40, 0], // Reducir márgenes laterales
        },
      ],
    };

  const examenVistaResumen = examenVista
    ? (examenVista.ojoIzquierdoLejanaConCorreccion === 0 ||
        examenVista.ojoIzquierdoLejanaConCorreccion == null) &&
      (examenVista.ojoDerechoLejanaConCorreccion === 0 ||
        examenVista.ojoDerechoLejanaConCorreccion == null)
      ? `OI: 20/${examenVista.ojoIzquierdoLejanaSinCorreccion}, OD: 20/${examenVista.ojoDerechoLejanaSinCorreccion} - ${examenVista.sinCorreccionLejanaInterpretacion}, Ishihara: ${examenVista.porcentajeIshihara}% - ${examenVista.interpretacionIshihara}`
      : `OI: 20/${examenVista.ojoIzquierdoLejanaConCorreccion}, OD: 20/${examenVista.ojoDerechoLejanaConCorreccion} - ${examenVista.conCorreccionLejanaInterpretacion} Corregida, Ishihara: ${examenVista.porcentajeIshihara}% - ${examenVista.interpretacionIshihara}`
    : 'No se cuenta con examen visual';

  const resumenYAlteraciones = [
    [
      createTableCell('INFORMACIÓN Y ESTUDIOS', 'tableHeader', 'center'),
      createTableCell('FECHAS', 'tableHeader', 'center'),
      createTableCell(
        'RESUMEN Y/O ALTERACIONES ENCONTRADAS',
        'tableHeader',
        'center',
      ),
    ],
    [
      createTableCell('HISTORIA CLÍNICA LABORAL', 'sectionHeader', 'center'),
      createTableCell(
        historiaClinica
          ? formatearFechaUTC(historiaClinica.fechaHistoriaClinica)
          : '-',
        'tableCell',
        'center',
      ),
      createTableCell(
        historiaClinica
          ? historiaClinica.resumenHistoriaClinica
          : 'No se cuenta con historia clínica laboral',
        'tableCell',
        'center',
      ),
    ],
    [
      createTableCell('EXPLORACIÓN FÍSICA', 'sectionHeader', 'center'),
      createTableCell(
        exploracionFisica
          ? formatearFechaUTC(exploracionFisica.fechaExploracionFisica)
          : '-',
        'tableCell',
        'center',
      ),
      createTableCell(
        exploracionFisica
          ? `TA: ${exploracionFisica.tensionArterialSistolica}/${exploracionFisica.tensionArterialDiastolica} mmHg - ${exploracionFisica.categoriaTensionArterial}. ${exploracionFisica.resumenExploracionFisica}.`
          : 'No se cuenta con exploración física',
        'tableCell',
        'center',
      ),
    ],
    [
      createTableCell('EXAMEN VISUAL', 'sectionHeader', 'center'),
      createTableCell(
        examenVista ? formatearFechaUTC(examenVista.fechaExamenVista) : '-',
        'tableCell',
        'center',
      ),
      createTableCell(examenVistaResumen, 'tableCell', 'center'),
    ],
    // ANTIDOPING solo se incluye si existen datos
    ...(antidoping
      ? [
          [
            createTableCell('ANTIDOPING', 'sectionHeader', 'center'),
            createTableCell(
              formatearFechaUTC(antidoping.fechaAntidoping),
              'tableCell',
              'center',
            ),
            createTableCell(
              antidoping.marihuana === 'Negativo' &&
                antidoping.cocaina === 'Negativo' &&
                antidoping.anfetaminas === 'Negativo' &&
                antidoping.metanfetaminas === 'Negativo' &&
                antidoping.opiaceos === 'Negativo'
                ? 'Negativo a cinco parámetros'
                : `Positivo a: ${[
                    antidoping.marihuana !== 'Negativo' ? 'Marihuana' : null,
                    antidoping.cocaina !== 'Negativo' ? 'Cocaína' : null,
                    antidoping.anfetaminas !== 'Negativo'
                      ? 'Anfetaminas'
                      : null,
                    antidoping.metanfetaminas !== 'Negativo'
                      ? 'Metanfetaminas'
                      : null,
                    antidoping.opiaceos !== 'Negativo' ? 'Opiáceos' : null,
                  ]
                    .filter(Boolean)
                    .join(', ')}`,
              'tableCell',
              'center',
            ),
          ],
        ]
      : []),
  ];

  // Agregar filas para cada evaluación adicional si existen los datos
  for (let i = 1; i <= 6; i++) {
    const evaluacion = aptitud[`evaluacionAdicional${i}`];
    const fecha = aptitud[`fechaEvaluacionAdicional${i}`];
    const resultados = aptitud[`resultadosEvaluacionAdicional${i}`];

    if (evaluacion && fecha && resultados) {
      resumenYAlteraciones.push([
        createTableCell(evaluacion.toUpperCase(), 'sectionHeader', 'center'),
        createTableCell(formatearFechaUTC(fecha), 'tableCell', 'center'),
        createTableCell(resultados, 'tableCell', 'center'),
      ]);
    }
  }

  const aptitudPuesto = aptitud.aptitudPuesto;
  const aptitudColor = getColorForAptitud(aptitudPuesto);

  // Función para determinar si se coloca 'XX' o un string vacío
  const getXXForAptitud = (option: string): string =>
    aptitudPuesto === option ? 'XX' : '';

  return {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 80],
    header: header,
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
                    text: formatearFechaUTC(aptitud.fechaAptitudPuesto),
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
          hLineColor: '#e5e7eb',
          vLineColor: '#e5e7eb',
          paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
          paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
          paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
          paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
          hLineWidth: () => 1,
          vLineWidth: () => 1,
        },
        margin: [0, 0, 0, 6],
      },
      {
        text: 'La evaluación médica para la aptitud ante el puesto está basada en la siguiente información:',
      },
      // Resumen y/o alteraciones encontradas
      {
        style: 'table',
        table: {
          widths: ['29%', '11%', '*'],
          body: resumenYAlteraciones,
        },
        layout: {
          hLineColor: '#e5e7eb',
          vLineColor: '#e5e7eb',
          paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
          paddingBottom: (i: number, node: any) => 0, // Reducir el espacio inferior
          paddingLeft: (i: number, node: any) => 0, // Reducir el espacio izquierdo
          paddingRight: (i: number, node: any) => 0, // Reducir el espacio derecho
          hLineWidth: () => 1,
          vLineWidth: () => 1,
        },
        margin: [0, 0, 0, 6],
      },
      // Aptitud al puesto
      {
        style: 'table',
        table: {
          widths: ['7%', '*'],
          body: [
            [
              {
                text: 'BASADO EN LA INFORMACIÓN ANTERIOR SE HA DETERMINADO:',
                style: 'tableHeader',
                alignment: 'center',
                colSpan: 2, // Aquí se indica que la celda debe abarcar dos columnas.
              },
              {}, // Esta celda debe permanecer vacía para que la combinación funcione.
            ],
            [
              createTableCell(
                getXXForAptitud('Apto Sin Restricciones'),
                'sectionHeader',
                'center',
                aptitudPuesto === 'Apto Sin Restricciones' ? aptitudColor : undefined
              ),
              createTableCell(
                'Apto sin restricciones. No tiene impedimentos para el puesto al que aspira o desempeña.',
                'preset',
                'left',
                aptitudPuesto === 'Apto Sin Restricciones' ? aptitudColor : undefined
              ),
            ],
            [
              createTableCell(
                getXXForAptitud('Apto Con Precaución'),
                'sectionHeader',
                'center',
                aptitudPuesto === 'Apto Con Precaución' ? aptitudColor : undefined
              ),
              createTableCell(
                'Apto con precaución. Requiere vigilancia médica más frecuente.',
                'preset',
                'left',
                aptitudPuesto === 'Apto Con Precaución' ? aptitudColor : undefined
              ),
            ],
            [
              createTableCell(
                getXXForAptitud('Apto Con Restricciones'),
                'sectionHeader',
                'center',
                aptitudPuesto === 'Apto Con Restricciones' ? aptitudColor : undefined
              ),
              createTableCell(
                'Apto con restricciones. Requiere adaptaciones razonables para asegurar la seguridad y salud.',
                'preset',
                'left',
                aptitudPuesto === 'Apto Con Restricciones' ? aptitudColor : undefined
              ),
            ],
            [
              createTableCell(
                getXXForAptitud('No Apto'),
                'sectionHeader',
                'center',
                aptitudPuesto === 'No Apto' ? aptitudColor : undefined
              ),
              createTableCell(
                'No apto. No está permitido el desempeño del puesto al que aspira.',
                'preset',
                'left',
                aptitudPuesto === 'No Apto' ? aptitudColor : undefined
              ),
            ],
            [
              createTableCell(
                getXXForAptitud('Evaluación No Completada'),
                'sectionHeader',
                'center',
                aptitudPuesto === 'Evaluación No Completada' ? aptitudColor : undefined
              ),
              createTableCell(
                'Evaluación no completada. Para concluir, requiere evaluaciones adicionales o tratamiento médico.',
                'preset',
                'left',
                aptitudPuesto === 'Evaluación No Completada' ? aptitudColor : undefined
              ),
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
        margin: [0, 0, 0, 6],
      },
      // Conclusión y recomendaciones
      {
        style: 'table',
        table: {
          widths: ['15%', '*'],
          body: [
            [
              {
                text: 'CONCLUSIÓN Y RECOMENDACIONES',
                style: 'tableHeader',
                alignment: 'center',
                colSpan: 2, // Aquí se indica que la celda debe abarcar dos columnas.
              },
              {}, // Esta celda debe permanecer vacía para que la combinación funcione.
            ],
            [
              createTableCell(
                'Alteraciones a la Salud',
                'sectionHeaderResume',
                'center',
              ),
              createTableCell(
                aptitud.alteracionesSalud,
                'paragraph',
                'justify',
              ),
            ],
            [
              createTableCell('Resultados', 'sectionHeaderResume', 'center'),
              createTableCell(aptitud.resultados, 'paragraph', 'justify'),
            ],
            [
              createTableCell(
                'Medidas Preventivas Específicas',
                'sectionHeaderResume',
                'center',
              ),
              createTableCell(
                aptitud.medidasPreventivas,
                'paragraph',
                'justify',
              ),
            ],
          ],
        },
        layout: {
          hLineColor: '#e5e7eb',
          vLineColor: '#e5e7eb',
          paddingTop: (i: number, node: any) => 0, // Reducir el espacio superior
          paddingBottom: (i: number, node: any) => {
            // Si es la primera fila (que suele ser el encabezado), no aplicar padding inferior
            if (i === 0) {
              return 0; // Sin padding inferior en la primera fila (tableHeader)
            }
            return 4; // Para el resto de las filas, aplicar padding inferior
          },
          paddingLeft: (i: number, node: any) => 2, // Reducir el espacio izquierdo
          paddingRight: (i: number, node: any) => 2, // Reducir el espacio derecho
          hLineWidth: () => 1,
          vLineWidth: () => 1,
        },
        margin: [0, 0, 0, 5],
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
    styles: updatedStyles, // Regresar a styles cuando se elimine la parte específica para el Dr. García
  };
};
