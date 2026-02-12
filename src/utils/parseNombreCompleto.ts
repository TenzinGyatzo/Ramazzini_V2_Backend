/**
 * Parser robusto de nombre completo (hispanos/México) a 3 campos:
 * nombrePrestador, primerApellidoPrestador, segundoApellidoPrestador.
 * Heurísticas propias, sin librerías externas de parsing de nombres.
 */

export interface ParseNombreCompletoResult {
  nombrePrestador: string;
  primerApellidoPrestador: string;
  segundoApellidoPrestador: string;
  debug?: ParseNombreDebug;
}

export interface ParseNombreDebug {
  rawInput: string;
  afterNormalize: string;
  hadComma: boolean;
  sideApellidos?: string;
  sideNombres?: string;
  tokens: string[];
  blocksFromEnd: string[];
  decision: string;
}

/** Partículas que forman parte de apellidos compuestos (comparación en minúsculas). */
const SURNAME_PARTICLES = new Set([
  'de',
  'del',
  'la',
  'las',
  'los',
  'y',
  'e',
  'da',
  'do',
  'dos',
  'das',
  'van',
  'von',
  'san',
  'santa',
  'mac',
  'mc',
  'st',
  'sto',
  'sta',
]);

/** Prefijos/títulos a eliminar al inicio. Orden: más específicos primero (Dra antes de Dr; C. solo con punto). */
const TITLE_PREFIXES = [
  /^\s*Dra\.?\s*/i,
  /^\s*Dr\.?\s*/i,
  /^\s*Mtra\.?\s*/i,
  /^\s*Mtro\.?\s*/i,
  /^\s*Srta\.?\s*/i,
  /^\s*Sra\.?\s*/i,
  /^\s*Sr\.?\s*/i,
  /^\s*Lic\.?\s*/i,
  /^\s*Ing\.?\s*/i,
  /^\s*Arq\.?\s*/i,
  /^\s*Profa\.?\s*/i,
  /^\s*Prof\.?\s*/i,
  /^\s*C\.\s*/i,
  /^\s*MC\s*/i,
  /^\s*Don\s+/i,
  /^\s*Doña\s+/i,
];

/** Sufijos a eliminar al final (espacio + sufijo opcional punto). */
const SUFFIXES = /\s+(Jr\.?|Sr\.?|II|III|IV|II°|III°|IV°)\s*$/i;

const DEFAULT_DEBUG = false;

/**
 * Normaliza el string: trim, colapsa espacios/tabs, preserva acentos.
 * Elimina títulos al inicio y sufijos al final.
 */
function normalizeInput(input: string): string {
  if (input == null || typeof input !== 'string') return '';
  let s = input.replace(/\s+/g, ' ').replace(/\t/g, ' ').trim();
  for (const re of TITLE_PREFIXES) {
    s = s.replace(re, ' ');
  }
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(SUFFIXES, '').trim();
  return s;
}

/**
 * Tokeniza por espacios; tokens con guión se mantienen enteros (ej. Pérez-Gómez).
 * Elimina tokens vacíos; preserva punto en iniciales (ej. J.).
 */
function tokenize(segment: string): string[] {
  const tokens: string[] = [];
  const parts = segment.trim().split(/\s+/);
  for (const p of parts) {
    const t = p.replace(/^[,]+|[,]+$/g, '').trim();
    if (t && /[\p{L}]/u.test(t)) tokens.push(t);
  }
  return tokens;
}

/**
 * Indica si un token es partícula de apellido (comparación en minúsculas).
 */
function isSurnameParticle(token: string): boolean {
  return SURNAME_PARTICLES.has(token.toLowerCase().replace(/\./g, ''));
}

/** Conectores que pueden unir dos apellidos en uno (García y Vega). */
function isConnectorParticle(token: string): boolean {
  const t = token.toLowerCase().replace(/\./g, '');
  return t === 'y' || t === 'e';
}

/**
 * Agrupa tokens desde el final en "bloques" de apellido:
 * cada bloque termina en una palabra no partícula y puede incluir partículas a su izquierda.
 * Devuelve los bloques en orden: [último_bloque, penúltimo_bloque, ...].
 */
function buildSurnameBlocksFromEnd(tokens: string[]): string[] {
  const blocks: string[] = [];
  let i = tokens.length - 1;
  while (i >= 0) {
    const chunk: string[] = [tokens[i]];
    let j = i - 1;
    while (j >= 0 && isSurnameParticle(tokens[j])) {
      chunk.unshift(tokens[j]);
      j--;
    }
    blocks.push(chunk.join(' '));
    i = j;
  }
  return blocks;
}

/**
 * Separa tokens en: nombre (todos los que no son los dos últimos bloques de apellido)
 * y los dos bloques finales (primer y segundo apellido).
 * Si solo hay un bloque de apellido, se asigna a primerApellido y segundo queda vacío.
 * Heurística extra: si hay 2 bloques y no queda nada para "nombre" (todo son apellidos)
 * pero el bloque que sería "primer apellido" es un solo token, se considera nombre + un apellido
 * (ej. "María del Carmen" → nombre "María", primer "del Carmen").
 */
function splitNamesAndSurnames(
  tokens: string[],
  blocksFromEnd: string[],
): { nameTokens: string[]; primerApellido: string; segundoApellido: string } {
  if (blocksFromEnd.length === 0) {
    return {
      nameTokens: [...tokens],
      primerApellido: '',
      segundoApellido: '',
    };
  }
  if (blocksFromEnd.length === 1) {
    const nameTokens = tokens.slice(
      0,
      tokens.length - countTokensInBlock(blocksFromEnd[0]),
    );
    return {
      nameTokens,
      primerApellido: blocksFromEnd[0],
      segundoApellido: '',
    };
  }
  const totalSurnameTokens =
    countTokensInBlock(blocksFromEnd[0]) + countTokensInBlock(blocksFromEnd[1]);
  let nameTokens = tokens.slice(0, tokens.length - totalSurnameTokens);
  let primerApellido = blocksFromEnd[1];
  let segundoApellido = blocksFromEnd[0];
  if (nameTokens.length === 0 && countTokensInBlock(blocksFromEnd[1]) === 1) {
    nameTokens = blocksFromEnd[1].split(/\s+/).filter(Boolean);
    primerApellido = blocksFromEnd[0];
    segundoApellido = '';
  } else if (
    nameTokens.length === 1 &&
    countTokensInBlock(blocksFromEnd[1]) === 1 &&
    countTokensInBlock(blocksFromEnd[0]) > 1
  ) {
    nameTokens = nameTokens.concat(
      blocksFromEnd[1].split(/\s+/).filter(Boolean),
    );
    primerApellido = blocksFromEnd[0];
    segundoApellido = '';
  }
  return {
    nameTokens,
    primerApellido,
    segundoApellido,
  };
}

function countTokensInBlock(block: string): number {
  return block.split(/\s+/).filter(Boolean).length;
}

/**
 * Parsea un segmento ya sin coma (solo "NOMBRES APELLIDOS" o "APELLIDOS" o "NOMBRE APELLIDO").
 */
function parseSegment(
  segment: string,
  enableDebug: boolean,
): Omit<ParseNombreCompletoResult, 'debug'> & { debug?: ParseNombreDebug } {
  const tokens = tokenize(segment);
  if (tokens.length === 0) {
    return {
      nombrePrestador: '',
      primerApellidoPrestador: '',
      segundoApellidoPrestador: '',
      ...(enableDebug && {
        debug: {
          rawInput: segment,
          afterNormalize: segment,
          hadComma: false,
          tokens: [],
          blocksFromEnd: [],
          decision: 'empty',
        },
      }),
    };
  }
  if (tokens.length === 1) {
    return {
      nombrePrestador: '',
      primerApellidoPrestador: tokens[0],
      segundoApellidoPrestador: '',
      ...(enableDebug && {
        debug: {
          rawInput: segment,
          afterNormalize: segment,
          hadComma: false,
          tokens: [...tokens],
          blocksFromEnd: [tokens[0]],
          decision: 'single_token_as_primer_apellido',
        },
      }),
    };
  }
  if (tokens.length === 2) {
    return {
      nombrePrestador: tokens[0],
      primerApellidoPrestador: tokens[1],
      segundoApellidoPrestador: '',
      ...(enableDebug && {
        debug: {
          rawInput: segment,
          afterNormalize: segment,
          hadComma: false,
          tokens: [...tokens],
          blocksFromEnd: [tokens[1]],
          decision: 'two_tokens_name_primer_apellido',
        },
      }),
    };
  }
  const blocksFromEnd = buildSurnameBlocksFromEnd(tokens);
  const { nameTokens, primerApellido, segundoApellido } = splitNamesAndSurnames(
    tokens,
    blocksFromEnd,
  );
  const nombrePrestador = nameTokens.join(' ');
  return {
    nombrePrestador,
    primerApellidoPrestador: primerApellido,
    segundoApellidoPrestador: segundoApellido,
    ...(enableDebug && {
      debug: {
        rawInput: segment,
        afterNormalize: segment,
        hadComma: false,
        tokens: [...tokens],
        blocksFromEnd: [...blocksFromEnd],
        decision: 'three_plus_tokens_blocks_from_end',
      },
    }),
  };
}

/**
 * Parsea nombre completo y devuelve los 3 campos.
 * Si input está vacío o solo espacios, devuelve todo vacío.
 *
 * @param input - Nombre completo en un solo string (con o sin coma, con/sin títulos).
 * @param options - enableDebug: si true, incluye objeto debug en la salida.
 */
export function parseNombreCompleto(
  input: string,
  options?: { enableDebug?: boolean },
): ParseNombreCompletoResult {
  const enableDebug = options?.enableDebug ?? DEFAULT_DEBUG;
  const raw = input;
  const normalized = normalizeInput(input);
  if (!normalized) {
    return {
      nombrePrestador: '',
      primerApellidoPrestador: '',
      segundoApellidoPrestador: '',
      ...(enableDebug && {
        debug: {
          rawInput: raw,
          afterNormalize: '',
          hadComma: false,
          tokens: [],
          blocksFromEnd: [],
          decision: 'empty_after_normalize',
        },
      }),
    };
  }

  const commaIndex = normalized.indexOf(',');
  if (commaIndex >= 0) {
    const sideApellidos = normalized.slice(0, commaIndex).trim();
    const sideNombres = normalized.slice(commaIndex + 1).trim();
    const apellidosPart = sideApellidos;
    const nombresPart = sideNombres;
    const tokensApellidos = tokenize(apellidosPart);
    const blocksApellidos = buildSurnameBlocksFromEnd(tokensApellidos);
    let primerApellidoPrestador: string;
    let segundoApellidoPrestador: string;
    if (blocksApellidos.length === 0) {
      primerApellidoPrestador = '';
      segundoApellidoPrestador = '';
    } else if (blocksApellidos.length === 1) {
      primerApellidoPrestador = blocksApellidos[0];
      segundoApellidoPrestador = '';
    } else if (
      blocksApellidos.length === 2 &&
      isConnectorParticle(blocksApellidos[0].split(/\s+/)[0])
    ) {
      primerApellidoPrestador =
        `${blocksApellidos[1]} ${blocksApellidos[0]}`.trim();
      segundoApellidoPrestador = '';
    } else {
      primerApellidoPrestador = blocksApellidos[1];
      segundoApellidoPrestador = blocksApellidos[0];
    }
    const nombrePrestador = nombresPart;
    return {
      nombrePrestador,
      primerApellidoPrestador,
      segundoApellidoPrestador,
      ...(enableDebug && {
        debug: {
          rawInput: raw,
          afterNormalize: normalized,
          hadComma: true,
          sideApellidos: apellidosPart,
          sideNombres: nombresPart,
          tokens: tokenize(apellidosPart).concat(tokenize(nombresPart)),
          blocksFromEnd: blocksApellidos,
          decision: 'comma_format_apellidos_nombres',
        },
      }),
    };
  }

  const result = parseSegment(normalized, enableDebug);
  if (result.debug) {
    result.debug.rawInput = raw;
    result.debug.afterNormalize = normalized;
  }
  return {
    nombrePrestador: result.nombrePrestador,
    primerApellidoPrestador: result.primerApellidoPrestador,
    segundoApellidoPrestador: result.segundoApellidoPrestador,
    ...(result.debug && { debug: result.debug }),
  };
}

/*
 * Ejemplos de uso:
 *
 * parseNombreCompleto("María del Carmen López Hernández")
 * // => { nombrePrestador: "María del Carmen", primerApellidoPrestador: "López", segundoApellidoPrestador: "Hernández" }
 *
 * parseNombreCompleto("Ana Sofía Del Río Martínez")
 * // => { nombrePrestador: "Ana Sofía", primerApellidoPrestador: "Del Río", segundoApellidoPrestador: "Martínez" }
 *
 * parseNombreCompleto("Juan Carlos De la O")
 * // => { nombrePrestador: "Juan Carlos", primerApellidoPrestador: "De la O", segundoApellidoPrestador: "" }
 *
 * parseNombreCompleto("LÓPEZ HERNÁNDEZ, MARÍA DEL CARMEN")
 * // => { nombrePrestador: "MARÍA DEL CARMEN", primerApellidoPrestador: "LÓPEZ", segundoApellidoPrestador: "HERNÁNDEZ" }
 *
 * parseNombreCompleto("Dr. José Luis Pérez-Gómez Ruiz")
 * // => { nombrePrestador: "José Luis", primerApellidoPrestador: "Pérez-Gómez", segundoApellidoPrestador: "Ruiz" }
 *
 * parseNombreCompleto("  María   del   Carmen   ")
 * // => { nombrePrestador: "María", primerApellidoPrestador: "del Carmen", segundoApellidoPrestador: "" }
 *
 * parseNombreCompleto("García y Vega, Juan")
 * // => { nombrePrestador: "Juan", primerApellidoPrestador: "García y Vega", segundoApellidoPrestador: "" }
 */
