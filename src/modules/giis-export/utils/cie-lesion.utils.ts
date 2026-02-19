/**
 * CIE-10 classification helpers for GIIS-B013 Lesiones.
 * Cap. XIX: S00-T98 (afección lesión). Cap. XX: V01-Y98 (causa externa).
 * Rangos permitidos para afección principal: F00-F99, Cap XIX, O04-O07, O20, O26.7, O42.9, O46.8-O46.9, O68, O71.0-O71.9
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

/**
 * Códigos CIE-10 permitidos para afección principal en reporte de lesión.
 * F00-F99, Cap XIX (S00-T98), O04-O07, O20, O26.7, O42.9, O46.8-O46.9, O68, O71.0-O71.9
 * Acepta formato estándar (O26.7) y 4 chars (O267).
 */
export function isCieAfeccionLesionAllowedRanges(
  code: string | null | undefined,
): boolean {
  const c = (code || '').trim().toUpperCase();
  if (!c || !/^[A-Z][0-9]/.test(c)) return false;
  const letter = c.charAt(0);
  const withoutDot = c.replace(/\./g, '');
  const match = c.match(/^([A-Z])(\d{2,3})(?:\.(\d{1,2}))?/);
  if (!match) return false;
  const num = parseInt(match[2], 10);
  const sub = match[3] ? parseInt(match[3], 10) : undefined;

  // F00-F99
  if (letter === 'F') return num >= 0 && num <= 99;

  // Cap XIX: S00-T98
  if (letter === 'S') return num >= 0 && num <= 99;
  if (letter === 'T') return num >= 0 && num <= 98;

  // O04-O07, O20, O68
  if (letter === 'O') {
    if (num >= 4 && num <= 7) return true;
    if (num === 20 || num === 68) return true;
    // O26.7 (O26.x o O267)
    if (num === 26 || withoutDot === 'O267') return true;
    // O42.9 (O42.9 o O429)
    if (num === 42 || withoutDot === 'O429') return true;
    // O46.8-O46.9 (O46.8, O46.9, O468, O469)
    if (num === 46 && (sub === undefined || sub === 8 || sub === 9))
      return true;
    if (withoutDot === 'O468' || withoutDot === 'O469') return true;
    // O71.0-O71.9 (O71.0-O71.9 o O710-O719)
    if (num === 71 && (sub === undefined || (sub >= 0 && sub <= 9)))
      return true;
    if (num >= 710 && num <= 719 && !sub) return true;
  }

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
