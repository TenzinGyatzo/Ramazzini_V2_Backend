import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
  async deleteFile(filePath: string): Promise<void> {
    try {
      // Verifica si el archivo existe
      await fs.access(filePath);
      // Elimina el archivo
      await fs.unlink(filePath);
      console.log(`[DEBUG] Archivo eliminado: ${filePath}`);
    } catch (error) {
      console.error(`[ERROR] No se pudo eliminar el archivo: ${filePath} - ${error.message}`);
      throw new Error(`No se pudo eliminar el archivo: ${filePath}`);
    }
  }
}
