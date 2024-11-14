import type {
    Content,
    StyleDictionary,
    TDocumentDefinitions,
  } from 'pdfmake/interfaces';
  
  // Estilos
  const styles: StyleDictionary = {
    header: {
      fontSize: 13,
      bold: false,
      color: 'blue', // #ff5500 rojo
      decoration: 'underline',
      decorationColor: 'red',
    },
    h1: {
      fontSize: 16,
      bold: true,
      alignment: 'center',
      margin: [0, 20, 0, 0]
    },
    sectionHeader: {
      fontSize: 10,
      bold: true,
      fillColor: '#e5e5e5',
      alignment: 'center',
    },
    label: {
      bold: true,
      fontSize: 9,
    },
    value: {
      fontSize: 9,
    },
    tableHeader: {
      fillColor: '#262626',
      color: '#FFFFFF',
      bold: true,
      fontSize: 9,
      alignment: 'center',
    },
    tableCell: {
      fontSize: 9,
      alignment: 'center',
    },
  };
  
  // Contenidos Encabezado
  const logo: Content = {
    image: 'src/assets/AmesBrand.png',
    width: 60,
    margin: [40, 20, 0, 0],
  };
  
  const headerText: Content = {
    text: '                                                                                                                      ANTIDOPING\n',
    style: 'header',
    alignment: 'right',
    margin: [0, 20, 45, 0],
  };
  
  // ESTRUCTURA DEL INFORME
  export const antidopingInforme = (): TDocumentDefinitions => {
    return {

        pageSize: 'LETTER',
        pageMargins: [40, 80, 40, 60],

      // Estructura Encabezado
      header: {
        columns: [logo, headerText],
      },
  
      // Estructura Cuerpo
      content: [
        {
          text: 'AGRICULTURE',
          style: 'h1',
        },
        {
          style: 'table',
          table: {
            widths: ['15%', '35%', '15%', '35%'],
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
          layout: 'noBorders',
          margin: [0, 20, 0, 10],
        },
        {
          style: 'table',
          table: {
            widths: ['33%', '33%', '33%'],
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
            fillColor: (rowIndex: number) => {
              return rowIndex === 0 ? '#000000' : '#FFFFFF';
            },
          },
          margin: [0, 10, 0, 0],
        },
      ],
  
      // Estilos
      styles: styles,
    };
  };
  