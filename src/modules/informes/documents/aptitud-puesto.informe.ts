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
    fillColor: '#262626',
    color: '#FFFFFF',
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
const logo: Content = {
  image: 'src/assets/AmesBrand.png',
  width: 60,
  margin: [40, 25, 0, 0],
};

const headerText: Content = {
  text: '                      REPORTE DE EVALUACIÓN DE SALUD Y APTITUD AL PUESTO\n',
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

// ==================== INFORME PRINCIPAL ====================
export const aptitudPuestoInforme = (
  trabajador: Trabajador,
  aptitud: Aptitud,
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
                text: 'AGRICULTURE',
                style: 'nombreEmpresa',
                alignment: 'center',
                margin: [0, 0, 0, 0],
              },
              {
                text: [
                  { text: 'Fecha: ', style: 'fecha', bold: false },
                  {
                    text: aptitud.fechaAptitudPuesto
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
        margin: [0, 0, 0, 3],
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
          body: [
            [
              createTableCell('INFORMACIÓN Y ESTUDIOS', 'tableHeader', 'center'),
              createTableCell('FECHAS', 'tableHeader', 'center'),
              createTableCell('RESUMEN Y/O ALTERACIONES ENCONTRADAS', 'tableHeader', 'center'),
            ],
            [
              createTableCell('HISTORIA CLÍNICA LABORAL', 'sectionHeader', 'center'),
              createTableCell('11-09-2024', 'tableCell', 'center'),
              createTableCell('Se refiere actualmente asintomático', 'tableCell', 'center'),
            ],
            [
              createTableCell('EXPLORACIÓN FÍSICA', 'sectionHeader', 'center'),
              createTableCell('11-09-2024', 'tableCell', 'center'),
              createTableCell('TA: 107/62 mmHg - Óptima, Se encuentra clínicamente sano', 'tableCell', 'center'),
            ],
            [
              createTableCell('ADIPOSITDAD CORPORAL', 'sectionHeader', 'center'),
              createTableCell('11-09-2024', 'tableCell', 'center'),
              createTableCell('IMC: 26.87 - Sobrepeso, Circunferencia Cintura: 97cm - Riesgo Aumentado', 'tableCell', 'center'),
            ],
            [
              createTableCell('EXAMEN VISUAL', 'sectionHeader', 'center'),
              createTableCell('11-09-2024', 'tableCell', 'center'),
              createTableCell('OI: 20/20, OD: 20/20 - Visión Normal, Ishihara: 100 % - Normal', 'tableCell', 'center'),
            ],
            [
              createTableCell('ANTIDOPING', 'sectionHeader', 'center'),
              createTableCell('11-09-2024', 'tableCell', 'center'),
              createTableCell('Negativo a cinco parámetros', 'tableCell', 'center'),
            ],
          ],
        },
        layout: {
          hLineColor: '#9ca3af',
          vLineColor: '#9ca3af',
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
                colSpan: 2,  // Aquí se indica que la celda debe abarcar dos columnas.
              },
              {},  // Esta celda debe permanecer vacía para que la combinación funcione.
            ],
            [
              createTableCell('XX', 'sectionHeader', 'center'),
              createTableCell('Apto sin restricciones. No tiene impedimentos para el puesto al que aspira o desempeña.', 'preset', 'left'),
            ],
            [
              createTableCell('XX', 'sectionHeader', 'center'),
              createTableCell('Apto con precaución. Requiere vigilancia médica más frecuente.', 'preset', 'left'),
            ],
            [
              createTableCell('XX', 'sectionHeader', 'center'),
              createTableCell('Apto con restricciones. Requiere adaptaciones razonables para asegurar la seguridad y salud.', 'preset', 'left'),
            ],
            [
              createTableCell('XX', 'sectionHeader', 'center'),
              createTableCell('No apto. No está permitido el desempeño del puesto al que aspira.', 'preset', 'left'),
            ],
            [
              createTableCell('XX', 'sectionHeader', 'center'),
              createTableCell('Evaluación no completada. Para concluir, requiere evaluaciones adicionales o tratamiento médico.', 'preset', 'left'),
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
                colSpan: 2,  // Aquí se indica que la celda debe abarcar dos columnas.
              },
              {},  // Esta celda debe permanecer vacía para que la combinación funcione.
            ],
            [
              createTableCell('Alteraciones a la Salud', 'sectionHeaderResume', 'center'),
              createTableCell('El paciente presenta sobrepeso con un índice de masa corporal (IMC) de 26.87. Tiene una circunferencia de cintura de 97 cm por lo que tiene un riesgo aumentado de desarrollar enfermedades cardiometabólicas. Presenta presión arterial óptima, con una medición de 107/62 mmHg. Tiene una visión normal y tiene una visión cromática normal. Se refiere actualmente asintomático. Se encuentra clínicamente sano.', 'paragraph', 'justify'),
            ],
            [
              createTableCell('Resultados', 'sectionHeaderResume', 'center'),
              createTableCell('Posterior a efectuar el examen integral de salud ocupacional, se determina que actualmente se encuentra CLÍNICAMENTE SANO Y APTO PARA LABORAR SIN RESTRICCIONES en las actividades del puesto al que aspira. El trabajador parece demostrar actualmente los niveles adecuados de agilidad física, fuerza y capacidad cardiorespiratora requeridos para realizar de forma segura las tareas esenciales de su trabajo.Cabe señalar que la determinacion de la aptitud para el trabajo es solamante clínica, toda vez que no contamos con analisis de laboratorio en este momento.', 'paragraph', 'justify'),
            ],
            [
              createTableCell('Medidas Preventivas Específicas', 'sectionHeaderResume', 'center'),
              createTableCell('Es importante usar adecuadamente el EPP, mantener hábitos saludables como una alimentación balanceada, ejercicio regular y descanso adecuado, así como efectuar vigilancia médica con periodicidad anual, incluyendo exámenes generales de laboratorio y gabinete para una vigilancia integral de la salud.', 'paragraph', 'justify'),
            ]
          ],
        },
        layout: {
          hLineColor: '#9ca3af',
          vLineColor: '#9ca3af',
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