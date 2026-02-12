/**
 * CIE-10 classification helpers for GIIS-B013 Lesiones.
 * Cap. XIX: S00-T98 (afección lesión). Cap. XX: V01-Y98 (causa externa).
 */

/** Re-export for LES derivation from NotaMedica. */
export { extractCieCode } from '../transformers/cex.mapper';

/** CIE-10 Chapter XIX: injury/poisoning (S00-S99, T00-T98). */
export function isCieAfeccionLesion(code: string | null | undefined): boolean {
  const c = (code || '').trim().toUpperCase();
  if (!c) return false;
  const letter = c.charAt(0);
  const rest = c.slice(1).replace(/\.\d+$/, ''); // strip .subcategory
  const num = parseInt(rest, 10);
  if (Number.isNaN(num)) return false;
  if (letter === 'S') return num >= 0 && num <= 99;
  if (letter === 'T') return num >= 0 && num <= 98;
  return false;
}

/** CIE-10 Chapter XX: external cause (V01-Y98). */
export function isCieCausaExterna(code: string | null | undefined): boolean {
  const c = (code || '').trim().toUpperCase();
  if (!c) return false;
  const letter = c.charAt(0);
  const rest = c.slice(1).replace(/\.\d+$/, '');
  const num = parseInt(rest, 10);
  if (Number.isNaN(num)) return false;
  if (letter === 'V') return num >= 1 && num <= 99;
  if (letter === 'W') return num >= 0 && num <= 99;
  if (letter === 'X') return num >= 0 && num <= 99;
  if (letter === 'Y') return num >= 0 && num <= 98;
  return false;
}
