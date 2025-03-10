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
  

  @Get('aptitud/:empresaId/:trabajadorId/:aptitudId/:userId')
  async getInformeAptitudPuesto(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('aptitudId') aptitudId: string,
    @Param('userId') userId: string,
  ) {
    const rutaPDF = await this.informesService.getInformeAptitudPuesto(empresaId, trabajadorId, aptitudId, userId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }

  @Get('certificado/:empresaId/:trabajadorId/:certificadoId/:userId')
  async getInformeCertificado(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('certificadoId') certificadoId: string,
    @Param('userId') userId: string
  ) {
    const rutaPDF = await this.informesService.getInformeCertificado(empresaId, trabajadorId, certificadoId, userId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }

  @Get('examenVista/:empresaId/:trabajadorId/:examenVistaId/:userId')
  async getInformeExamenVista(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('examenVistaId') examenVistaId: string,
    @Param('userId') userId: string
  ) {
    const rutaPDF = await this.informesService.getInformeExamenVista(empresaId, trabajadorId, examenVistaId, userId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }


  @Get('exploracionFisica/:empresaId/:trabajadorId/:exploracionFisicaId/:userId')
  async getInformeExploracionFisica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('exploracionFisicaId') exploracionFisicaId: string,
    @Param('userId') userId: string
  ) {
    const rutaPDF = await this.informesService.getInformeExploracionFisica(empresaId, trabajadorId, exploracionFisicaId, userId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }

  @Get('historiaClinica/:empresaId/:trabajadorId/:historiaClinicaId/:userId')
  async getInformeHistoriaClinica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('historiaClinicaId') historiaClinicaId: string,
    @Param('userId') userId: string
  ) {
    const rutaPDF = await this.informesService.getInformeHistoriaClinica(empresaId, trabajadorId, historiaClinicaId, userId);
    return { message: 'PDF generado exitosamente', ruta: rutaPDF };
  }

  @Get('notaMedica/:empresaId/:trabajadorId/:notaMedicaId/:userId')
  async getInformeNotaMedica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('notaMedicaId') notaMedicaId: string,
    @Param('userId') userId: string,
  ) {
  
    try {
      const rutaPDF = await this.informesService.getInformeNotaMedica(empresaId, trabajadorId, notaMedicaId, userId);
      return { message: 'PDF generado exitosamente', ruta: rutaPDF };
    } catch (error) {
      console.error('[getInformeNotaMedica] Error al generar el informe nota médica:', error);
      throw error;
    }
  }
}
