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
    } catch (error) {
      throw new Error(`No se pudo eliminar el archivo: ${filePath}`);
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    const fs = require('fs').promises;
    await fs.rename(oldPath, newPath);
  }
  
}
