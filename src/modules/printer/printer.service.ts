import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces'; 

const fonts = {
    Roboto: { // Marca error si este no se llama Roboto, no sé por que
        normal: 'fonts/Kanit-Regular.ttf',
        bold: 'fonts/Kanit-Bold.ttf',
        italics: 'fonts/Kanit-Italic.ttf',
        bolditalics: 'fonts/Kanit-BoldItalic.ttf'
    }
}

@Injectable()
export class PrinterService {
    
    private printer = new PdfPrinter(fonts);

    createPdf(docDefinition: TDocumentDefinitions) {
        return this.printer.createPdfKitDocument(docDefinition);
    }
}
