import { Controller, Get, Param, Res } from '@nestjs/common';
import { InformesService } from './informes.service';
import { Response } from 'express';

@Controller('informes')
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Get('antidoping/:empresaId/:trabajadorId/:antidopingId/:userId')
  async getInformeAntidoping(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('antidopingId') antidopingId: string,
    @Param('userId') userId: string,
  ) {
  
    try {
      const rutaPDF = await this.informesService.getInformeAntidoping(empresaId, trabajadorId, antidopingId, userId);
      return { message: 'PDF generado exitosamente', ruta: rutaPDF };
    } catch (error) {
      console.error('[getInformeAntidoping] Error al generar el informe antidoping:', error);
      throw error;
    }
  }
  

  @Get('aptitud/:empresaId/:trabajadorId/:aptitudId')
  async getInformeAptitudPuesto(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('aptitudId') aptitudId: string,
  ) {
    const rutaPDF = await this.informesService.getInformeAptitudPuesto(empresaId, trabajadorId, aptitudId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }

  @Get('certificado/:empresaId/:trabajadorId/:certificadoId')
  async getInformeCertificado(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('certificadoId') certificadoId: string,
  ) {
    const rutaPDF = await this.informesService.getInformeCertificado(empresaId, trabajadorId, certificadoId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }

  @Get('examenVista/:empresaId/:trabajadorId/:examenVistaId')
  async getInformeExamenVista(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('examenVistaId') examenVistaId: string,
  ) {
    const rutaPDF = await this.informesService.getInformeExamenVista(empresaId, trabajadorId, examenVistaId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }


  @Get('exploracionFisica/:empresaId/:trabajadorId/:exploracionFisicaId')
  async getInformeExploracionFisica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('exploracionFisicaId') exploracionFisicaId: string,
  ) {
    const rutaPDF = await this.informesService.getInformeExploracionFisica(empresaId, trabajadorId, exploracionFisicaId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }

  @Get('historiaClinica/:empresaId/:trabajadorId/:historiaClinicaId')
  async getInformeHistoriaClinica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('historiaClinicaId') historiaClinicaId: string,
  ) {
    const rutaPDF = await this.informesService.getInformeHistoriaClinica(empresaId, trabajadorId, historiaClinicaId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }
}
