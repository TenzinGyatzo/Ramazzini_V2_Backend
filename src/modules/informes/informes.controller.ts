import { Controller, Get, Param, Res } from '@nestjs/common';
import { InformesService } from './informes.service';
import { Response } from 'express';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Get('antidoping/:trabajadorId/:antidopingId')
  async getInformeAntidoping(
    @Res() response: Response,
    @Param('trabajadorId') trabajadorId: string,
    @Param('antidopingId') antidopingId: string,
  ) {
    const pdfDoc = await this.informesService.getInformeAntidoping(trabajadorId, antidopingId);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Informe';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get('aptitud/:trabajadorId/:aptitudId')
  async getInformeAptitudPuesto(
    @Res() response: Response,
    @Param('trabajadorId') trabajadorId: string,
    @Param('aptitudId') aptitudId: string,
  ) {
    const pdfDoc = await this.informesService.getInformeAptitudPuesto(trabajadorId, aptitudId);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Informe';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
