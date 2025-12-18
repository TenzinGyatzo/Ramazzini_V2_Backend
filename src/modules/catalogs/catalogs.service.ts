import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse';
import { CatalogEntry, CatalogType, INEGIEntry, CIE10Entry, CLUESEntry } from './interfaces/catalog-entry.interface';

/**
 * Catalog Service
 * 
 * Loads and caches NOM-024 mandatory catalogs from CSV files.
 * Provides validation and search methods for catalog entries.
 */
@Injectable()
export class CatalogsService implements OnModuleInit {
  private readonly logger = new Logger(CatalogsService.name);
  
  // In-memory caches: Map<catalogType, Map<code, entry>>
  private catalogCaches = new Map<CatalogType, Map<string, CatalogEntry>>();
  
  // Indexes for hierarchical lookups (INEGI)
  private estadoCache = new Map<string, CatalogEntry>(); // estadoCode -> entry
  private municipioCache = new Map<string, Map<string, CatalogEntry>>(); // estadoCode -> Map<municipioCode, entry>
  private localidadCache = new Map<string, Map<string, CatalogEntry>>(); // municipioKey -> Map<localidadCode, entry>

  // Catalog file mappings
  // Note: GIIS-B013 catalogs are optional until CSV files are available
  private readonly catalogFiles: Partial<Record<CatalogType, string>> = {
    [CatalogType.CIE10]: 'diagnosticos.csv',
    [CatalogType.CLUES]: 'establecimientos_salud.csv',
    [CatalogType.ENTIDADES_FEDERATIVAS]: 'enitades_federativas.csv',
    [CatalogType.MUNICIPIOS]: 'municipios.csv',
    [CatalogType.LOCALIDADES]: 'localidades.csv',
    [CatalogType.CODIGOS_POSTALES]: 'codigos_postales.csv',
    [CatalogType.NACIONALIDADES]: 'cat_nacionalidades.csv',
    [CatalogType.RELIGIONES]: 'cat_religiones.csv',
    [CatalogType.LENGUAS_INDIGENAS]: 'lenguas_indigenas.csv',
    [CatalogType.FORMACION_ACADEMICA]: 'formacion_academica.csv',
    // GIIS-B013 Catalogs (optional - files may not exist yet)
    [CatalogType.SITIO_OCURRENCIA]: 'cat_sitio_ocurrencia.csv',
    [CatalogType.AGENTE_LESION]: 'cat_agente_lesion.csv',
    [CatalogType.AREA_ANATOMICA]: 'cat_area_anatomica.csv',
    [CatalogType.CONSECUENCIA]: 'cat_consecuencia.csv',
  };

  async onModuleInit() {
    this.logger.log('Initializing catalog service...');
    await this.loadAllCatalogs();
    this.logger.log('Catalog service initialized successfully');
  }

  /**
   * Load all catalogs from CSV files
   */
  private async loadAllCatalogs(): Promise<void> {
    const catalogsPath = join(process.cwd(), 'catalogs', 'normalized');
    
    // GIIS-B013 catalogs that may not be available (DGIS does not publish them publicly)
    const optionalCatalogs = [
      CatalogType.SITIO_OCURRENCIA,
      CatalogType.AGENTE_LESION,
      CatalogType.AREA_ANATOMICA,
      CatalogType.CONSECUENCIA,
    ];

    const loadPromises = Object.entries(this.catalogFiles)
      .filter(([_, filename]) => filename) // Filter out undefined entries
      .map(([type, filename]) => {
        const catalogType = type as CatalogType;
        const isOptional = optionalCatalogs.includes(catalogType);
        
        return this.loadCatalog(catalogType, join(catalogsPath, filename)).catch((error) => {
          if (isOptional) {
            this.logger.warn(`Optional catalog ${filename} not found (GIIS-B013 catalog not publicly available). Continuing without strict validation.`);
          } else {
            this.logger.error(`Failed to load catalog ${filename}: ${error.message}`, error.stack);
          }
          // Continue startup even if a catalog fails to load
          return null;
        });
      });

    await Promise.all(loadPromises);
    this.logCacheStatistics();
  }

  /**
   * Load a single catalog from CSV file
   */
  private async loadCatalog(catalogType: CatalogType, filePath: string): Promise<void> {
    // Check if file exists before attempting to load
    if (!existsSync(filePath)) {
      throw new Error(`Catalog file not found: ${filePath}`);
    }

    this.logger.log(`Loading catalog: ${filePath}`);
    const cache = new Map<string, CatalogEntry>();

    try {
      const records: any[] = await this.parseCSV(filePath);
      
      for (const record of records) {
        const entry = this.mapRecordToEntry(catalogType, record);
        if (entry && entry.code) {
          cache.set(entry.code, entry);
        }
      }

      this.catalogCaches.set(catalogType, cache);

      // Build hierarchical indexes for INEGI catalogs
      if (catalogType === CatalogType.ENTIDADES_FEDERATIVAS) {
        this.buildEstadoIndex(cache);
      } else if (catalogType === CatalogType.MUNICIPIOS) {
        await this.buildMunicipioIndex(cache);
      } else if (catalogType === CatalogType.LOCALIDADES) {
        await this.buildLocalidadIndex(cache);
      }

      this.logger.log(`Loaded ${cache.size} entries from ${catalogType}`);
    } catch (error) {
      this.logger.error(`Error loading catalog ${filePath}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Parse CSV file with streaming support for large files
   */
  private async parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // Defensive check: verify file exists before creating stream
      if (!existsSync(filePath)) {
        reject(new Error(`File not found: ${filePath}`));
        return;
      }

      const records: any[] = [];
      const stream = createReadStream(filePath, { encoding: 'utf-8' });
      
      // Handle stream errors immediately (before pipe)
      stream.on('error', (error) => {
        reject(error);
      });
      
      stream
        .pipe(parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true, // Handle UTF-8 BOM
        }))
        .on('data', (record) => {
          records.push(record);
        })
        .on('end', () => {
          resolve(records);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Map CSV record to CatalogEntry based on catalog type
   */
  private mapRecordToEntry(catalogType: CatalogType, record: any): CatalogEntry | null {
    try {
      switch (catalogType) {
        case CatalogType.ENTIDADES_FEDERATIVAS:
          return {
            code: record.CATALOG_KEY || record.codigo || record.code,
            description: record.ENTIDAD_FEDERATIVA || record.descripcion || record.description,
            source: 'INEGI',
            version: record.version,
            abreviatura: record.ABREVIATURA || record.abreviatura,
          };

        case CatalogType.CIE10:
          return {
            code: record.CATALOG_KEY || record.codigo || record.code,
            description: record.NOMBRE || record.descripcion || record.description,
            source: 'CIE-10',
            version: record.version,
            catalogKey: record.CATALOG_KEY,
            nombre: record.NOMBRE,
            lsex: record.LSEX,
            linf: record.LINF ? parseInt(record.LINF) : undefined,
            lsup: record.LSUP ? parseInt(record.LSUP) : undefined,
          } as CIE10Entry;

        case CatalogType.CLUES:
          return {
            code: record.CLUES || record.clues || record.codigo || record.code,
            description: record['NOMBRE DE LA INSTITUCION'] || record.nombre || record.descripcion || record.description,
            source: 'CLUES',
            version: record.version,
            clues: record.CLUES,
            nombreInstitucion: record['NOMBRE DE LA INSTITUCION'],
            entidad: record.ENTIDAD,
            municipio: record.MUNICIPIO,
            localidad: record.LOCALIDAD,
            estatus: record['ESTATUS DE OPERACION'],
          } as CLUESEntry;

        case CatalogType.MUNICIPIOS:
          return {
            code: record.CATALOG_KEY || record.codigo || record.code,
            description: record.MUNICIPIO || record.descripcion || record.description,
            source: 'INEGI',
            version: record.version,
            estadoCode: record['CLAVE DE LA ENTIDAD'] || record.estadoCode,
            municipioCode: record.CATALOG_KEY,
          } as INEGIEntry;

        case CatalogType.LOCALIDADES:
          return {
            code: record.CATALOG_KEY || record.codigo || record.code,
            description: record.LOCALIDAD || record.descripcion || record.description,
            source: 'INEGI',
            version: record.version,
            estadoCode: record['CLAVE DE LA ENTIDAD'] || record.estadoCode,
            municipioCode: record['CLAVE DEL MUNICIPIO'] || record.municipioCode,
            localidadCode: record.CATALOG_KEY,
          } as INEGIEntry;

        case CatalogType.NACIONALIDADES:
          return {
            code: record['codigo pais'] || record.codigo || record.code,
            description: record.pais || record.descripcion || record.description,
            source: 'RENAPO',
            version: record.version,
            claveNacionalidad: record['clave nacionalidad'],
          };

        default:
          // Generic mapping for other catalogs
          const code = record.codigo || record.code || record.CATALOG_KEY || record.CODIGO;
          const description = record.descripcion || record.description || record.DESCRIPCION || record.NOMBRE;
          
          if (!code || !description) {
            return null;
          }

          return {
            code: String(code),
            description: String(description),
            source: record.source,
            version: record.version,
            ...record, // Include all other fields
          };
      }
    } catch (error) {
      this.logger.warn(`Error mapping record for ${catalogType}: ${error.message}`);
      return null;
    }
  }

  /**
   * Build estado (state) index
   */
  private buildEstadoIndex(cache: Map<string, CatalogEntry>): void {
    for (const [code, entry] of cache) {
      this.estadoCache.set(code, entry);
    }
  }

  /**
   * Build municipio (municipality) index with estado grouping
   */
  private async buildMunicipioIndex(cache: Map<string, CatalogEntry>): Promise<void> {
    for (const [code, entry] of cache) {
      const inegiEntry = entry as INEGIEntry;
      const estadoCode = inegiEntry.estadoCode;
      
      if (estadoCode) {
        if (!this.municipioCache.has(estadoCode)) {
          this.municipioCache.set(estadoCode, new Map());
        }
        this.municipioCache.get(estadoCode)!.set(code, entry);
      }
    }
  }

  /**
   * Build localidad (locality) index with municipio grouping
   */
  private async buildLocalidadIndex(cache: Map<string, CatalogEntry>): Promise<void> {
    for (const [code, entry] of cache) {
      const inegiEntry = entry as INEGIEntry;
      const estadoCode = inegiEntry.estadoCode;
      const municipioCode = inegiEntry.municipioCode;
      
      if (estadoCode && municipioCode) {
        const key = `${estadoCode}-${municipioCode}`;
        if (!this.localidadCache.has(key)) {
          this.localidadCache.set(key, new Map());
        }
        this.localidadCache.get(key)!.set(code, entry);
      }
    }
  }

  /**
   * Log cache statistics
   */
  private logCacheStatistics(): void {
    this.logger.log('=== Catalog Cache Statistics ===');
    for (const [type, cache] of this.catalogCaches) {
      this.logger.log(`${type}: ${cache.size} entries`);
    }
    this.logger.log(`Estado index: ${this.estadoCache.size} entries`);
    this.logger.log(`Municipio index: ${this.municipioCache.size} estados`);
    this.logger.log(`Localidad index: ${this.localidadCache.size} municipios`);
  }

  /**
   * Validate CIE-10 diagnostic code
   */
  async validateCIE10(code: string, sex?: string, age?: number): Promise<boolean> {
    const cache = this.catalogCaches.get(CatalogType.CIE10);
    if (!cache) {
      this.logger.warn('CIE-10 catalog not loaded');
      return false;
    }

    const entry = cache.get(code) as CIE10Entry;
    if (!entry) {
      return false;
    }

    // Validate sex restriction if provided
    if (sex && entry.lsex && entry.lsex !== 'NO' && entry.lsex !== sex) {
      return false;
    }

    // Validate age restrictions if provided
    if (age !== undefined) {
      if (entry.linf !== undefined && age < entry.linf) {
        return false;
      }
      if (entry.lsup !== undefined && age > entry.lsup) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate CLUES establishment code
   */
  async validateCLUES(clues: string): Promise<boolean> {
    const cache = this.catalogCaches.get(CatalogType.CLUES);
    if (!cache) {
      this.logger.warn('CLUES catalog not loaded');
      return false;
    }

    return cache.has(clues);
  }

  /**
   * Validate CLUES establishment code and check if it's in operation
   * @param clues - CLUES code to validate
   * @returns true if CLUES exists and has status "EN OPERACION"
   */
  async validateCLUESInOperation(clues: string): Promise<boolean> {
    const cache = this.catalogCaches.get(CatalogType.CLUES);
    if (!cache) {
      this.logger.warn('CLUES catalog not loaded');
      return false;
    }

    const entry = cache.get(clues) as CLUESEntry;
    if (!entry) {
      return false;
    }

    // Check if establishment is in operation
    return entry.estatus === 'EN OPERACION';
  }

  /**
   * Get CLUES entry by code
   */
  async getCLUESEntry(clues: string): Promise<CLUESEntry | null> {
    const cache = this.catalogCaches.get(CatalogType.CLUES);
    if (!cache) {
      return null;
    }

    return (cache.get(clues) as CLUESEntry) || null;
  }

  /**
   * Validate INEGI geographic code (estado, municipio, or localidad)
   */
  async validateINEGI(type: 'estado' | 'municipio' | 'localidad', code: string, parentCode?: string): Promise<boolean> {
    switch (type) {
      case 'estado':
        return this.estadoCache.has(code);

      case 'municipio':
        if (!parentCode) {
          // Check if code exists in any estado
          for (const municipioMap of this.municipioCache.values()) {
            if (municipioMap.has(code)) {
              return true;
            }
          }
          return false;
        }
        const municipioMap = this.municipioCache.get(parentCode);
        return municipioMap ? municipioMap.has(code) : false;

      case 'localidad':
        if (!parentCode) {
          // Check if code exists in any municipio
          for (const localidadMap of this.localidadCache.values()) {
            if (localidadMap.has(code)) {
              return true;
            }
          }
          return false;
        }
        const localidadMap = this.localidadCache.get(parentCode);
        return localidadMap ? localidadMap.has(code) : false;

      default:
        return false;
    }
  }

  /**
   * Validate nationality code
   */
  async validateNacionalidad(code: string): Promise<boolean> {
    const cache = this.catalogCaches.get(CatalogType.NACIONALIDADES);
    if (!cache) {
      this.logger.warn('Nacionalidades catalog not loaded');
      return false;
    }

    return cache.has(code);
  }

  /**
   * Get catalog entry by code
   */
  async getCatalogEntry(catalog: CatalogType, code: string): Promise<CatalogEntry | null> {
    const cache = this.catalogCaches.get(catalog);
    if (!cache) {
      return null;
    }

    return cache.get(code) || null;
  }

  /**
   * Search catalog entries by query string
   */
  async searchCatalog(catalog: CatalogType, query: string, limit: number = 50): Promise<CatalogEntry[]> {
    const cache = this.catalogCaches.get(catalog);
    if (!cache) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results: CatalogEntry[] = [];

    for (const entry of cache.values()) {
      if (
        entry.code.toLowerCase().includes(lowerQuery) ||
        entry.description.toLowerCase().includes(lowerQuery)
      ) {
        results.push(entry);
        if (results.length >= limit) {
          break;
        }
      }
    }

    return results;
  }
}

