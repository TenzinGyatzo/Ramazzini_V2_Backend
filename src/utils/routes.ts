// src/helpers/ruta-publica.ts
import * as path from 'path';

export function convertirRutaAPublica(rutaAbsoluta: string): string {
  return rutaAbsoluta
    .replace(path.resolve('./'), '') // quita la raíz del proyecto
    .replace(/\\/g, '/'); // estandariza separadores
}
