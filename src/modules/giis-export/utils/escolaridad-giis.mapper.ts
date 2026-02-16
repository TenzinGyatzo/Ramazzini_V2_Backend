/**
 * Maps app escolaridad values (trabajador.schema nivelesEscolaridad) to GIIS
 * catalog CATALOG_KEY from escolaridad.csv. Used only when generating LES/CEX
 * for SIRES_NOM024; the rest of the app keeps showing the same labels.
 */

/** Default when no worker or no escolaridad: 88 = NO APLICA */
const DEFAULT_CATALOG_KEY = 88;

/**
 * Equivalence: app value (normalized) -> CATALOG_KEY in escolaridad.csv
 * Nula->1, Primaria->31, Secundaria->51, Preparatoria/Diversificado->71,
 * Licenciatura->81, Maestría/Doctorado->101.
 */
const APP_TO_CATALOG_KEY: Record<string, number> = {
  nula: 1, // NINGUNA
  primaria: 31, // PRIMARIA COMPLETA
  secundaria: 51, // SECUNDARIA COMPLETA
  preparatoria: 71, // BACHILLERATO O PREPARATORIA COMPLETA
  diversificado: 71,
  licenciatura: 81, // LICENCIATURA O PROFESIONAL COMPLETO
  maestria: 101, // POSGRADO COMPLETO
  maestría: 101, // with accent (normalize may not strip in all envs)
  doctorado: 101,
};

function normalize(s: string): string {
  const t = s.trim().toLowerCase();
  // Strip common Spanish accents so "maestría" -> "maestria" (NFD can be env-dependent)
  const unaccented = t
    .replace(/\u00E1/g, 'a')
    .replace(/\u00E9/g, 'e')
    .replace(/\u00ED/g, 'i')
    .replace(/\u00F3/g, 'o')
    .replace(/\u00FA/g, 'u')
    .replace(/\u00F1/g, 'n');
  return unaccented.normalize('NFD').replace(/\u0300-\u036f/g, '');
}

/**
 * Maps an app escolaridad string (e.g. "Primaria", "Licenciatura") to the
 * CATALOG_KEY number from escolaridad.csv. Returns 88 (NO APLICA) when
 * input is null, undefined, empty, or unknown.
 */
export function appEscolaridadToCatalogKey(
  escolaridadApp: string | null | undefined,
): number {
  if (escolaridadApp == null) return DEFAULT_CATALOG_KEY;
  const raw = String(escolaridadApp).trim();
  if (raw === '') return DEFAULT_CATALOG_KEY;
  const key = normalize(raw);
  if (APP_TO_CATALOG_KEY[key] !== undefined) return APP_TO_CATALOG_KEY[key];
  return DEFAULT_CATALOG_KEY;
}
