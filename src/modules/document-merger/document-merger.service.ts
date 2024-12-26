import { Injectable, BadRequestException } from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentMergerService {
  async mergeFiles(filePaths: string[]): Promise<Buffer> {
    try {
      const mergedPdf = await PDFDocument.create();

      for (const filePath of filePaths) {
        const fileExt = path.extname(filePath).toLowerCase();

        if (fileExt === '.pdf') {
          // Load PDF and merge pages
          const pdfBytes = fs.readFileSync(filePath);
          const pdf = await PDFDocument.load(pdfBytes);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach((page) => mergedPdf.addPage(page));
        } else if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
          // Add image as a new page
          const imageBytes = fs.readFileSync(filePath);
          const image = fileExt === '.png'
            ? await mergedPdf.embedPng(imageBytes)
            : await mergedPdf.embedJpg(imageBytes);

          const page = mergedPdf.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else {
          throw new BadRequestException('Unsupported file type');
        }
      }

      // Save the merged PDF
      return Buffer.from(await mergedPdf.save()); // Convierte Uint8Array a Buffer
    } catch (error) {
      throw new BadRequestException('Failed to merge files: ' + error.message);
    }
  }
}
