import { Controller, Get, Param, Res } from '@nestjs/common';
import { InformesService } from './informes.service';
import { Response } from 'express';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Get('antidoping/:empresaId/:trabajadorId/:antidopingId')
  async getInformeAntidoping(
    @Res() response: Response,
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('antidopingId') antidopingId: string,
  ) {
    const pdfDoc = await this.informesService.getInformeAntidoping(empresaId, trabajadorId, antidopingId);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Informe';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get('aptitud/:empresaId/:trabajadorId/:aptitudId')
  async getInformeAptitudPuesto(
    @Res() response: Response,
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('aptitudId') aptitudId: string,
  ) {
    const pdfDoc = await this.informesService.getInformeAptitudPuesto(empresaId, trabajadorId, aptitudId);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Informe';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get('certificado/:empresaId/:trabajadorId/:certificadoId')
  async getInformeCertificado(
    @Res() response: Response,
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('certificadoId') certificadoId: string,
  ) {
    const pdfDoc = await this.informesService.getInformeCertificado(empresaId, trabajadorId, certificadoId);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Informe';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get('examenVista/:empresaId/:trabajadorId/:examenVistaId')
  async getInformeExamenVista(
    @Res() response: Response,
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('examenVistaId') examenVistaId: string,
  ) {
    const pdfDoc = await this.informesService.getInformeExamenVista(empresaId, trabajadorId, examenVistaId);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Informe';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }


  @Get('historiaClinica/:empresaId/:trabajadorId/:historiaClinicaId')
  async getInformeHistoriaClinica(
    @Res() response: Response,
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('historiaClinicaId') historiaClinicaId: string,
  ) {
    const pdfDoc = await this.informesService.getInformeHistoriaClinica(empresaId, trabajadorId, historiaClinicaId);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Informe';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
