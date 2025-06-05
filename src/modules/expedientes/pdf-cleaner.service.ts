// src/modules/expedientes/pdf-cleaner.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { mt } from 'date-fns/locale';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PdfCleanerService {
  private readonly logger = new Logger(PdfCleanerService.name);

  // Ruta absoluta del directorio raíz de PDFs (ajusta según entorno local o VPS)
  private readonly basePath = path.resolve('expedientes-medicos'); // En local
  // En producción podrías usar: path.resolve('/var/www/backend/expedientes-medicos')

  // Tipos válidos de informes generados por Ramazzini
  private readonly tiposValidos = [
    'Antidoping',
    'Aptitud',
    'Certificado',
    'Examen Vista',
    'Historia Clinica',
    'Exploracion Fisica',
    'Nota Medica',
  ];

  @Cron('* * * * *') // Modo prueba
  async handleCron() {
    this.logger.log('🔍 Buscando PDFs antiguos...');
    const archivosAntiguos = await this.buscarPDFsAntiguos(this.basePath);
    this.logger.log(`📂 Explorando: ${this.basePath}`);

    this.logger.log(`🔎 Candidatos encontrados: ${archivosAntiguos.length}`);
    for (const archivo of archivosAntiguos) {
      const { fullPath, sizeMB, createdAt } = archivo;
      this.logger.log(`🗂 ${fullPath} — ${sizeMB.toFixed(2)} MB — Creado: ${createdAt.toLocaleDateString()}`);
    }
  }

  private async buscarPDFsAntiguos(dir: string): Promise<
    { fullPath: string; sizeMB: number; createdAt: Date }[]
  > {
    let resultados: { fullPath: string; sizeMB: number; createdAt: Date }[] = [];

    try {
      const elementos = await fs.readdir(dir, { withFileTypes: true });

      for (const el of elementos) {
        const fullPath = path.join(dir, el.name);
        this.logger.log(`📄 Revisando archivo: ${el.name}`);

        if (el.isDirectory()) {
          const subresultados = await this.buscarPDFsAntiguos(fullPath);
          resultados = resultados.concat(subresultados);
        } else if (
          el.isFile() &&
          el.name.endsWith('.pdf') &&
          this.esInformeGeneradoPorRamazzini(el.name)
        ) {
          const stat = await fs.stat(fullPath);
          const birthtime = stat.birthtime;
          this.logger.log(`🕒 ${el.name} => birthtime: ${birthtime.toLocaleString()}`);

          const mtime = stat.mtime;
          this.logger.log(`🕒 ${el.name} => mtime: ${mtime.toLocaleString()}`);

          const createdAt = stat.birthtime; // O stat.ctime si birthtime falla en algunos sistemas
          // this.logger.log(`🕒 ${el.name} => creado: ${createdAt.toLocaleString()}`);
          
          const edadEnMeses = this.calcularMesesDesde(createdAt);
          this.logger.log(`📅 ${el.name} => edad en meses: ${edadEnMeses}`);

          if (edadEnMeses > 0) {
            resultados.push({
              fullPath,
              sizeMB: stat.size / (1024 * 1024),
              createdAt,
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error recorriendo ${dir}: ${error.message}`);
    }

    return resultados;
  }

  private esInformeGeneradoPorRamazzini(nombre: string): boolean {
    return this.tiposValidos.some((tipo) => nombre.startsWith(tipo + ' ')) &&
      /^.+ \d{2}-\d{2}-\d{4}\.pdf$/.test(nombre);
  }

  private calcularMesesDesde(fecha: Date): number {
    const ahora = new Date();
    return (ahora.getFullYear() - fecha.getFullYear()) * 12 + (ahora.getMonth() - fecha.getMonth());
  }
}

