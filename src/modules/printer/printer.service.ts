import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as fs from 'fs';
import * as path from 'path';

const fonts = {
  Roboto: {
    // Marca error si este no se llama Roboto, no sé por que
    normal: 'fonts/Kanit-Light.ttf',
    bold: 'fonts/Kanit-Medium.ttf',
    italics: 'fonts/Kanit-LightItalic.ttf',
    bolditalics: 'fonts/Kanit-MediumItalic.ttf',
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);

  createPdf(docDefinition: TDocumentDefinitions, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const writeStream = fs.createWriteStream(outputPath);
        pdfDoc.pipe(writeStream);

        pdfDoc.end();

        writeStream.on('finish', () => resolve());
        writeStream.on('error', (error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  }
}
