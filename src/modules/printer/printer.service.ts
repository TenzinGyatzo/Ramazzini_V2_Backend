import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces'; 

const fonts = {
    Roboto: { // Marca error si este no se llama Roboto, no sé por que
        normal: 'fonts/Kanit-Light.ttf',
        bold: 'fonts/Kanit-Medium.ttf',
        italics: 'fonts/Kanit-LightItalic.ttf',
        bolditalics: 'fonts/Kanit-MediumItalic.ttf'
    }
}

@Injectable()
export class PrinterService {
    
    private printer = new PdfPrinter(fonts);

    createPdf(docDefinition: TDocumentDefinitions) {
        return this.printer.createPdfKitDocument(docDefinition);
    }
}
