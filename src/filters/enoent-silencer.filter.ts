import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class EnoentSilencerFilter implements ExceptionFilter {
  private readonly logger = new Logger(EnoentSilencerFilter.name);

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

    // Para otras excepciones, loguear y devolver una respuesta de error apropiada
    this.logger.error(`Error no manejado: ${exception.message}`, exception.stack);
    
    // Determinar el código de estado apropiado
    let statusCode = 500;
    let message = 'Error interno del servidor';

    if (exception?.status) {
      statusCode = exception.status;
    } else if (exception?.statusCode) {
      statusCode = exception.statusCode;
    }

    if (exception?.message) {
      message = exception.message;
    }

    // Asegurar que el statusCode sea válido
    if (statusCode < 100 || statusCode >= 600) {
      statusCode = 500;
    }

    // Devolver respuesta de error sin interrumpir el servidor
    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
} 