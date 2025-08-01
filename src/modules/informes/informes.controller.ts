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
    @Res() res: Response,
  ) {
  
    try {
      const rutaPDF = await this.informesService.getInformeAntidoping(empresaId, trabajadorId, antidopingId, userId);
      return res.status(200).json({ message: 'PDF generado exitosamente', ruta: rutaPDF });
    } catch (error) {
      console.error('[getInformeAntidoping] Error al generar el informe antidoping:', error);
      return res.status(500).json({ message: 'Error al generar el informe antidoping', error });
    }
  }
  
  @Get('aptitud/:empresaId/:trabajadorId/:aptitudId/:userId')
  async getInformeAptitudPuesto(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('aptitudId') aptitudId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const rutaPDF = await this.informesService.getInformeAptitudPuesto(empresaId, trabajadorId, aptitudId, userId);
    return res.status(200).json({ message: 'PDF generado exitosamente', ruta: rutaPDF });
  }

  @Get('certificado/:empresaId/:trabajadorId/:certificadoId/:userId')
  async getInformeCertificado(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('certificadoId') certificadoId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const rutaPDF = await this.informesService.getInformeCertificado(empresaId, trabajadorId, certificadoId, userId);
    return res.status(200).json({ message: 'PDF generado exitosamente', ruta: rutaPDF });
  }

  @Get('examenVista/:empresaId/:trabajadorId/:examenVistaId/:userId')
  async getInformeExamenVista(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('examenVistaId') examenVistaId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const rutaPDF = await this.informesService.getInformeExamenVista(empresaId, trabajadorId, examenVistaId, userId);
    return res.status(200).json({ message: 'PDF generado exitosamente', ruta: rutaPDF });
  }

  @Get('exploracionFisica/:empresaId/:trabajadorId/:exploracionFisicaId/:userId')
  async getInformeExploracionFisica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('exploracionFisicaId') exploracionFisicaId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const rutaPDF = await this.informesService.getInformeExploracionFisica(empresaId, trabajadorId, exploracionFisicaId, userId);
    return res.status(200).json({ message: 'PDF generado exitosamente', ruta: rutaPDF });
  }

  @Get('historiaClinica/:empresaId/:trabajadorId/:historiaClinicaId/:userId')
  async getInformeHistoriaClinica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('historiaClinicaId') historiaClinicaId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const rutaPDF = await this.informesService.getInformeHistoriaClinica(empresaId, trabajadorId, historiaClinicaId, userId);
    return res.status(200).json({ message: 'PDF generado exitosamente', ruta: rutaPDF });
  }

  @Get('notaMedica/:empresaId/:trabajadorId/:notaMedicaId/:userId')
  async getInformeNotaMedica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('notaMedicaId') notaMedicaId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
  
    try {
      const rutaPDF = await this.informesService.getInformeNotaMedica(empresaId, trabajadorId, notaMedicaId, userId);
      return res.status(200).json({ message: 'PDF generado exitosamente', ruta: rutaPDF });
    } catch (error) {
      console.error('[getInformeNotaMedica] Error al generar el informe nota médica:', error);
      throw error;
    }
  }

  @Get('dashboard/ver/:empresaId/:trabajadorId/:userId')
  async getInformeDashboard(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.informesService.getInformeDashboard(
        empresaId,
        trabajadorId,
        userId,
      );
  
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="NotaMedica.pdf"',
        'Content-Length': buffer.length,
      });
  
      res.end(buffer);
    } catch (error) {
      console.error('[getInformeDashboard] Error al generar el informe del dashboard:', error);
      res.status(500).json({ message: 'Error al generar el PDF' });
    }
  }

  @Get('dashboard/descargar/:empresaId/:trabajadorId/:userId')
  async descargarInformeDashboard(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.informesService.getInformeDashboard(empresaId, trabajadorId, userId);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="NotaMedica.pdf"',
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      console.error('[descargarInformeDashboard] Error al generar el PDF:', error);
      res.status(500).json({ message: 'Error al generar el informe' });
    }
  }

  @Get('formato-historia-clinica/:empresaId/:trabajadorId/:userId')
  async getFormatoHistoriaClinica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.informesService.getFormatoHistoriaClinica(empresaId, trabajadorId, userId);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Formato_Historia_Clinica.pdf"',
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      console.error('[getFormatoHistoriaClinica] Error al generar el PDF:', error);
      res.status(500).json({ message: 'Error al generar el informe' });
    }
  }

  @Get('formato-historia-clinica/descargar/:empresaId/:trabajadorId/:userId')
  async descargarFormatoHistoriaClinica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.informesService.getFormatoHistoriaClinica(empresaId, trabajadorId, userId);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Formato_Historia_Clinica.pdf"',
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      console.error('[descargarFormatoHistoriaClinica] Error al generar el PDF:', error);
      res.status(500).json({ message: 'Error al generar el informe' });
    }
  }

  @Get('formato-exploracion-fisica/:empresaId/:trabajadorId/:userId')
  async getFormatoExploracionFisica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.informesService.getFormatoExploracionFisica(empresaId, trabajadorId, userId);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Formato_Exploracion_Fisica.pdf"',
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      console.error('[getFormatoExploracionFisica] Error al generar el PDF:', error);
      res.status(500).json({ message: 'Error al generar el informe' });
    }
  }

  @Get('formato-exploracion-fisica/descargar/:empresaId/:trabajadorId/:userId')
  async descargarFormatoExploracionFisica(
    @Param('empresaId') empresaId: string,
    @Param('trabajadorId') trabajadorId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.informesService.getFormatoExploracionFisica(empresaId, trabajadorId, userId);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Formato_Exploracion_Fisica.pdf"',
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      console.error('[descargarFormatoExploracionFisica] Error al generar el PDF:', error);
      res.status(500).json({ message: 'Error al generar el informe' });
    }
  }

}
