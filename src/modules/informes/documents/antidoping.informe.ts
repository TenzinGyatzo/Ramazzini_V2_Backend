import type {
    Content,
    StyleDictionary,
    TDocumentDefinitions,
  } from 'pdfmake/interfaces';
  
  // Estilos
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
      characterSpacing: 0,
      alignment: 'center',
      lineHeight: 1,
    },
    fecha: {
      fontSize: 10,
      alignment: 'right',
    },
    sectionHeader: {
      fontSize: 10,
      bold: true,
      // fillColor: '#e5e5e5',
      alignment: 'center',
      margin: [3, 3, 3, 3],
    },
    label: {
      fontSize: 11,
    },
    value: {
      bold: true,
      fontSize: 11,
    },
    tableHeader: {
      fillColor: '#262626',
      color: '#FFFFFF',
      bold: true,
      fontSize: 11,
      alignment: 'center',
      margin: [3, 3, 3, 3],
    },
    tableCell: {
      fontSize: 10,
      bold: true,
      alignment: 'center',
      margin: [3, 3, 3, 3],
    },
  };
  
  // Contenidos Encabezado
  const logo: Content = {
    image: 'src/assets/AmesBrand.png',
    width: 60,
    margin: [40, 25, 0, 0],
  };
  
  const headerText: Content = {
    text: '                                                                                                         ANTIDOPING\n',
    style: 'header',
    alignment: 'right',
    margin: [0, 35, 40, 0],
  };

  const firma: Content = {
    image: 'src/assets/Firma-Dr-Coronel.png',
    width: 32,
    margin: [0, 0, 0, 0],
  };
  
  // ESTRUCTURA DEL INFORME
  export const antidopingInforme = (): TDocumentDefinitions => {
    return {

      pageSize: 'LETTER',
      pageMargins: [40, 70, 40, 80],

      // Estructura Encabezado
      header: {
        columns: [logo, headerText],
      },
  
      // Estructura Cuerpo
      content: [
        {
          style: 'table',
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                { text: 'AGRICULTURE', style: 'nombreEmpresa', alignment: 'center', margin: [0, 0, 0, 0] },
                { 
                  text: [
                    { text: 'Fecha: ', style: 'fecha', bold: false },
                    { text: '10-11-2024', style: 'fecha', bold: true, decoration: 'underline' },
                  ],
                  margin: [0, 3, 0, 0],
                },
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 5],
        },
        {
          style: 'table',
          table: {
            widths: ['15%', '45%', '15%', '25%'],
            body: [
              [
                { text: 'NOMBRE', style: 'label' },
                { text: 'Edgar Omar Coronel González', style: 'value' },
                { text: 'EDAD', style: 'label' },
                { text: '29 años', style: 'value' },
              ],
              [
                { text: 'PUESTO', style: 'label' },
                { text: 'Gerente Administrativo', style: 'value' },
                { text: 'SEXO', style: 'label' },
                { text: 'Masculino', style: 'value' },
              ],
              [
                { text: 'ESCOLARIDAD', style: 'label' },
                { text: 'Primaria', style: 'value' },
                { text: 'ANTIGÜEDAD', style: 'label' },
                { text: '4 años, 10 meses', style: 'value' },
              ],
            ],
          },
          layout: {
            hLineColor: function () {
              return '#9ca3af'; // Color para las líneas horizontales
            },
            vLineColor: function () {
              return '#9ca3af'; // Color para las líneas verticales
            },
            hLineWidth: function () {
              return 1; // Grosor de las líneas horizontales
            },
            vLineWidth: function () {
              return 1; // Grosor de las líneas verticales
            },
          },
          margin: [0, 0, 0, 10],
        },
        {
          style: 'table',
          table: {
            widths: ['33.33%', '33.33%', '33.33%'],
            body: [
              [
                { text: 'DROGAS DE ABUSO', style: 'tableHeader' },
                { text: 'RESULTADOS', style: 'tableHeader' },
                { text: 'VALOR DE REFERENCIA', style: 'tableHeader' },
              ],
              [
                { text: 'MARIHUANA', style: 'sectionHeader' },
                { text: 'NEGATIVO', style: 'tableCell' },
                { text: 'NEGATIVO', style: 'tableCell' },
              ],
              [
                { text: 'COCAINA', style: 'sectionHeader' },
                { text: 'NEGATIVO', style: 'tableCell' },
                { text: 'NEGATIVO', style: 'tableCell' },
              ],
              [
                { text: 'ANFETAMINAS', style: 'sectionHeader' },
                { text: 'NEGATIVO', style: 'tableCell' },
                { text: 'NEGATIVO', style: 'tableCell' },
              ],
              [
                { text: 'METANFETAMINAS', style: 'sectionHeader' },
                { text: 'NEGATIVO', style: 'tableCell' },
                { text: 'NEGATIVO', style: 'tableCell' },
              ],
              [
                { text: 'OPIACEOS', style: 'sectionHeader' },
                { text: 'NEGATIVO', style: 'tableCell' },
                { text: 'NEGATIVO', style: 'tableCell' },
              ],
            ],
          },
          layout: {
            hLineColor: function () {
              return '#9ca3af'; // Color para las líneas horizontales
            },
            vLineColor: function () {
              return '#9ca3af'; // Color para las líneas verticales
            },
            hLineWidth: function () {
              return 1; // Grosor de las líneas horizontales
            },
            vLineWidth: function () {
              return 1; // Grosor de las líneas verticales
            },
          },
          margin: [0, 0, 0, 10],
        },
      ],

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
              }
            ],
            margin: [0, 0, 0, 5],
          },
          {
            columns: [
              {
                text: [
                  { text: 'Dr. Jesús Manuel Coronel Valenzuela\n', bold: true, italics: true },
                  { text: 'Cédula Profesional Médico Cirujano No. 1379978\n', bold: false, italics: true },
                  { text: 'Cédula Especialidad Med. del Trab. No. 3181172\n', bold: false, italics: true },
                  { text: 'Certificado Consejo Mex. de Med. Trab. No.891', bold: false, italics: true },
                ],
                fontSize: 8,
                margin: [40, 0, 0, 0],
              },
              firma,
              {
                text: [
                  { text: 'Asesoría Médico Empresarial de Sinaloa\n', bold: true, italics: true },
                  { text: 'Ángel Flores No. 2072 Norte, Fracc Las Fuentes.\n', bold: false, italics: true },
                  { text: 'Los Mochis, Ahome, Sinaloa. Tel. (668) 136 3973\n', bold: false, italics: true },
                  { text: 'www.ames.org.mx', bold: false, link: 'https://www.ames.org.mx', italics: true, color: 'blue' },
                ],
                alignment: 'right',
                fontSize: 8,
                margin: [0, 0, 40, 0],
              }
            ],
          }
        ]
      },
      
      
  
      // Estilos
      styles: styles,
    };
  };
  