import { Injectable } from '@nestjs/common';
import { PrinterService } from '../printer/printer.service';
import { antidopingInforme } from './documents/antidoping.informe';

@Injectable()
export class InformesService {
    constructor(private readonly printer: PrinterService) {}

    async getInforme(): Promise<PDFKit.PDFDocument> {
        const docDefinition = antidopingInforme();

        return this.printer.createPdf(docDefinition);
    }
}