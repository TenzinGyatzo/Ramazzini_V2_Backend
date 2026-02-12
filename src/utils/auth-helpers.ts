import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

interface JwtPayload {
  id: string;
}

/**
 * Extrae el ID del usuario desde el JWT token en el request
 * @param req - Express Request object
 * @returns userId - ID del usuario autenticado
 * @throws UnauthorizedException si no hay token o es inválido
 */
export function getUserIdFromRequest(req: Request): string {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    throw new UnauthorizedException('Token de autenticación requerido');
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    if (!decoded.id) {
      throw new BadRequestException(
        'Token inválido: ID de usuario no encontrado',
      );
    }

    return decoded.id;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedException('Token inválido');
    }
    throw error;
  }
}
