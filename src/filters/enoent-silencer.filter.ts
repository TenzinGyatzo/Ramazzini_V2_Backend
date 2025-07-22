import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class EnoentSilencerFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Silenciar ENOENT solo para la ruta de expedientes-medicos
    if (
      exception?.code === 'ENOENT' &&
      request?.url?.startsWith('/expedientes-medicos')
    ) {
      // Devuelve un 404 limpio sin loguear el error
      response.status(404).json({
        statusCode: 404,
        message: 'Archivo no encontrado',
      });
      return;
    }

    // Si no es ENOENT, sigue el flujo normal
    throw exception;
  }
} 