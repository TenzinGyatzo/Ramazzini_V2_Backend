/**
 * Interface representing a catalog entry with common fields
 */
export interface CatalogEntry {
  code: string;
  description: string;
  source?: string;
  version?: string;
  [key: string]: any; // Allow additional fields for catalog-specific data
}

/**
 * Interface for INEGI geographic hierarchy entries
 */
export interface INEGIEntry extends CatalogEntry {
  estado?: string;
  estadoCode?: string;
  municipio?: string;
  municipioCode?: string;
  localidad?: string;
  localidadCode?: string;
}

/**
 * Interface for CIE-10 diagnostic entries
 */
export interface CIE10Entry extends CatalogEntry {
  catalogKey?: string;
  nombre?: string;
  lsex?: string; // Sex restriction (LINF/LSUP age restrictions may be in other fields)
  linf?: number; // Lower age limit
  lsup?: number; // Upper age limit
}

/**
 * Interface for CLUES establishment entries
 */
export interface CLUESEntry extends CatalogEntry {
  clues?: string;
  nombreInstitucion?: string;
  entidad?: string;
  municipio?: string;
  localidad?: string;
  estatus?: string;
}

/**
 * Catalog type identifiers
 */
export enum CatalogType {
  // Base catalogs (10) - Required
  CIE10 = 'diagnosticos',
  CLUES = 'establecimientos_salud',
  ENTIDADES_FEDERATIVAS = 'enitades_federativas',
  MUNICIPIOS = 'municipios',
  LOCALIDADES = 'localidades',
  CODIGOS_POSTALES = 'codigos_postales',
  NACIONALIDADES = 'cat_nacionalidades',
  RELIGIONES = 'cat_religiones',
  LENGUAS_INDIGENAS = 'lenguas_indigenas',
  FORMACION_ACADEMICA = 'formacion_academica',

  // GIIS-B013 Catalogs (4) - Optional
  SITIO_OCURRENCIA = 'cat_sitio_ocurrencia',
  AGENTE_LESION = 'cat_agente_lesion',
  AREA_ANATOMICA = 'cat_area_anatomica',
  CONSECUENCIA = 'cat_consecuencia',

  // GIIS-B019 Catalogs (4) - Optional
  TIPO_PERSONAL = 'cat_tipo_personal',
  SERVICIOS_DET = 'cat_servicios_det',
  AFILIACION = 'cat_afiliacion',
  PAIS = 'cat_pais',
}
