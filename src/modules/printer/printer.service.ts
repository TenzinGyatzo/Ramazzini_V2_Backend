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

  // Método existente: guarda en disco
  createPdf(
    docDefinition: TDocumentDefinitions,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);

        const writeStream = fs.createWriteStream(outputPath);

        pdfDoc.pipe(writeStream);

        pdfDoc.end();

        writeStream.on('finish', () => {
          resolve();
        });

        writeStream.on('error', (error) => {
          console.error(
            '[PrinterService] Error occurred during write stream:',
            error,
          );
          reject(error);
        });
      } catch (error) {
        console.error(
          '[PrinterService] Unexpected error during PDF creation:',
          error,
        );
        reject(error);
      }
    });
  }

  // 🚀 NUEVO MÉTODO: retorna un Buffer del PDF (no guarda en disco)
  createPdfBuffer(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const chunks: Uint8Array[] = [];

        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
