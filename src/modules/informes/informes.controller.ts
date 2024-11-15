import { Controller, Get, Res } from '@nestjs/common';
import { InformesService } from './informes.service';
import { Response } from 'express';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Get('documento')
  async getInforme(@Res() response: Response) {
    const pdfDoc = await this.informesService.getInforme();

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Informe';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  /* @Get('documento')
  async getInforme() {
    return {
      Hola: 'Mundo'
    }    
  } */

}
