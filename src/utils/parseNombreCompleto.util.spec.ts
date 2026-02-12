import {
  parseNombreCompleto,
  ParseNombreCompletoResult,
} from './parseNombreCompleto';

function expectResult(
  result: ParseNombreCompletoResult,
  expected: {
    nombrePrestador: string;
    primerApellidoPrestador: string;
    segundoApellidoPrestador: string;
  },
) {
  expect(result.nombrePrestador).toBe(expected.nombrePrestador);
  expect(result.primerApellidoPrestador).toBe(expected.primerApellidoPrestador);
  expect(result.segundoApellidoPrestador).toBe(
    expected.segundoApellidoPrestador,
  );
}

describe('parseNombreCompleto', () => {
  describe('entrada vacía o solo espacios', () => {
    it('devuelve todo vacío para string vacío', () => {
      expectResult(parseNombreCompleto(''), {
        nombrePrestador: '',
        primerApellidoPrestador: '',
        segundoApellidoPrestador: '',
      });
    });

    it('devuelve todo vacío para solo espacios y tabs', () => {
      expectResult(parseNombreCompleto('   \t  '), {
        nombrePrestador: '',
        primerApellidoPrestador: '',
        segundoApellidoPrestador: '',
      });
    });

    it('devuelve todo vacío para null/undefined (tratado como vacío)', () => {
      expectResult(parseNombreCompleto(null as any), {
        nombrePrestador: '',
        primerApellidoPrestador: '',
        segundoApellidoPrestador: '',
      });
      expectResult(parseNombreCompleto(undefined as any), {
        nombrePrestador: '',
        primerApellidoPrestador: '',
        segundoApellidoPrestador: '',
      });
    });
  });

  describe('un solo token', () => {
    it('asigna todo a primerApellidoPrestador', () => {
      expectResult(parseNombreCompleto('López'), {
        nombrePrestador: '',
        primerApellidoPrestador: 'López',
        segundoApellidoPrestador: '',
      });
    });
  });

  describe('dos tokens', () => {
    it('primer token = nombre, segundo = primer apellido', () => {
      expectResult(parseNombreCompleto('Juan Pérez'), {
        nombrePrestador: 'Juan',
        primerApellidoPrestador: 'Pérez',
        segundoApellidoPrestador: '',
      });
    });
  });

  describe('nombres compuestos y apellidos clásicos (3+ tokens)', () => {
    it('María del Carmen López Hernández', () => {
      expectResult(parseNombreCompleto('María del Carmen López Hernández'), {
        nombrePrestador: 'María del Carmen',
        primerApellidoPrestador: 'López',
        segundoApellidoPrestador: 'Hernández',
      });
    });

    it('Ana Sofía Del Río Martínez', () => {
      expectResult(parseNombreCompleto('Ana Sofía Del Río Martínez'), {
        nombrePrestador: 'Ana Sofía',
        primerApellidoPrestador: 'Del Río',
        segundoApellidoPrestador: 'Martínez',
      });
    });

    it('Juan Carlos De la O (un solo apellido compuesto)', () => {
      expectResult(parseNombreCompleto('Juan Carlos De la O'), {
        nombrePrestador: 'Juan Carlos',
        primerApellidoPrestador: 'De la O',
        segundoApellidoPrestador: '',
      });
    });

    it('María del Carmen (3 tokens: nombre + apellido compuesto)', () => {
      expectResult(parseNombreCompleto('María del Carmen'), {
        nombrePrestador: 'María',
        primerApellidoPrestador: 'del Carmen',
        segundoApellidoPrestador: '',
      });
    });

    it('José Luis García Hernández', () => {
      expectResult(parseNombreCompleto('José Luis García Hernández'), {
        nombrePrestador: 'José Luis',
        primerApellidoPrestador: 'García',
        segundoApellidoPrestador: 'Hernández',
      });
    });

    it('De los Santos como apellido compuesto', () => {
      expectResult(parseNombreCompleto('Carlos De los Santos Ruiz'), {
        nombrePrestador: 'Carlos',
        primerApellidoPrestador: 'De los Santos',
        segundoApellidoPrestador: 'Ruiz',
      });
    });

    it('Van Helsing (partícula no hispana)', () => {
      expectResult(parseNombreCompleto('Abraham Van Helsing'), {
        nombrePrestador: 'Abraham',
        primerApellidoPrestador: 'Van Helsing',
        segundoApellidoPrestador: '',
      });
    });
  });

  describe('formato con coma (APELLIDOS, NOMBRES)', () => {
    it('LÓPEZ HERNÁNDEZ, MARÍA DEL CARMEN', () => {
      expectResult(parseNombreCompleto('LÓPEZ HERNÁNDEZ, MARÍA DEL CARMEN'), {
        nombrePrestador: 'MARÍA DEL CARMEN',
        primerApellidoPrestador: 'LÓPEZ',
        segundoApellidoPrestador: 'HERNÁNDEZ',
      });
    });

    it('DEL RÍO, ANA SOFÍA (apellido compuesto a la izquierda)', () => {
      expectResult(parseNombreCompleto('DEL RÍO, ANA SOFÍA'), {
        nombrePrestador: 'ANA SOFÍA',
        primerApellidoPrestador: 'DEL RÍO',
        segundoApellidoPrestador: '',
      });
    });

    it('García y Vega, Juan (conector y)', () => {
      expectResult(parseNombreCompleto('García y Vega, Juan'), {
        nombrePrestador: 'Juan',
        primerApellidoPrestador: 'García y Vega',
        segundoApellidoPrestador: '',
      });
    });

    it('DE LA O, JUAN CARLOS', () => {
      expectResult(parseNombreCompleto('DE LA O, JUAN CARLOS'), {
        nombrePrestador: 'JUAN CARLOS',
        primerApellidoPrestador: 'DE LA O',
        segundoApellidoPrestador: '',
      });
    });
  });

  describe('prefijos y sufijos', () => {
    it('elimina Dr. al inicio', () => {
      expectResult(parseNombreCompleto('Dr. José Luis Pérez Gómez'), {
        nombrePrestador: 'José Luis',
        primerApellidoPrestador: 'Pérez',
        segundoApellidoPrestador: 'Gómez',
      });
    });

    it('elimina Dra. al inicio', () => {
      expectResult(parseNombreCompleto('Dra. María López Hernández'), {
        nombrePrestador: 'María',
        primerApellidoPrestador: 'López',
        segundoApellidoPrestador: 'Hernández',
      });
    });

    it('elimina Lic. e Ing.', () => {
      expectResult(parseNombreCompleto('Lic. Ana Martínez García'), {
        nombrePrestador: 'Ana',
        primerApellidoPrestador: 'Martínez',
        segundoApellidoPrestador: 'García',
      });
      expectResult(parseNombreCompleto('Ing. Carlos Ruiz Sánchez'), {
        nombrePrestador: 'Carlos',
        primerApellidoPrestador: 'Ruiz',
        segundoApellidoPrestador: 'Sánchez',
      });
    });

    it('elimina sufijo Jr al final', () => {
      expectResult(parseNombreCompleto('Juan Pérez Gómez Jr'), {
        nombrePrestador: 'Juan',
        primerApellidoPrestador: 'Pérez',
        segundoApellidoPrestador: 'Gómez',
      });
    });

    it('elimina sufijo II/III/IV al final', () => {
      expectResult(parseNombreCompleto('Carlos López Hernández III'), {
        nombrePrestador: 'Carlos',
        primerApellidoPrestador: 'López',
        segundoApellidoPrestador: 'Hernández',
      });
    });
  });

  describe('normalización de espacios y ruido', () => {
    it('colapsa espacios múltiples', () => {
      expectResult(
        parseNombreCompleto('María    del   Carmen   López   Hernández'),
        {
          nombrePrestador: 'María del Carmen',
          primerApellidoPrestador: 'López',
          segundoApellidoPrestador: 'Hernández',
        },
      );
    });

    it('preserva acentos en la salida', () => {
      const r = parseNombreCompleto('José María Niño García');
      expect(r.nombrePrestador).toBe('José María');
      expect(r.primerApellidoPrestador).toBe('Niño');
      expect(r.segundoApellidoPrestador).toBe('García');
    });

    it('no fuerza Title Case', () => {
      const r = parseNombreCompleto('MARÍA DEL CARMEN LÓPEZ HERNÁNDEZ');
      expect(r.nombrePrestador).toBe('MARÍA DEL CARMEN');
      expect(r.primerApellidoPrestador).toBe('LÓPEZ');
      expect(r.segundoApellidoPrestador).toBe('HERNÁNDEZ');
    });
  });

  describe('guiones (apellidos compuestos con guión)', () => {
    it('mantiene Pérez-Gómez como un solo token', () => {
      expectResult(parseNombreCompleto('María José Pérez-Gómez Ruiz'), {
        nombrePrestador: 'María José',
        primerApellidoPrestador: 'Pérez-Gómez',
        segundoApellidoPrestador: 'Ruiz',
      });
    });

    it('Dr. José Luis Pérez-Gómez Ruiz', () => {
      expectResult(parseNombreCompleto('Dr. José Luis Pérez-Gómez Ruiz'), {
        nombrePrestador: 'José Luis',
        primerApellidoPrestador: 'Pérez-Gómez',
        segundoApellidoPrestador: 'Ruiz',
      });
    });
  });

  describe('iniciales', () => {
    it('mantiene J. Carlos como nombre si aparece así', () => {
      expectResult(parseNombreCompleto('J. Carlos Pérez Gómez'), {
        nombrePrestador: 'J. Carlos',
        primerApellidoPrestador: 'Pérez',
        segundoApellidoPrestador: 'Gómez',
      });
    });
  });

  describe('enableDebug', () => {
    it('incluye objeto debug cuando enableDebug es true', () => {
      const r = parseNombreCompleto('María López Hernández', {
        enableDebug: true,
      });
      expect(r.debug).toBeDefined();
      expect(r.debug?.rawInput).toBe('María López Hernández');
      expect(r.debug?.tokens).toEqual(['María', 'López', 'Hernández']);
      expect(r.debug?.hadComma).toBe(false);
    });

    it('no incluye debug por defecto', () => {
      const r = parseNombreCompleto('María López');
      expect(r.debug).toBeUndefined();
    });

    it('debug con coma incluye sideApellidos y sideNombres', () => {
      const r = parseNombreCompleto('LÓPEZ HERNÁNDEZ, MARÍA', {
        enableDebug: true,
      });
      expect(r.debug?.hadComma).toBe(true);
      expect(r.debug?.sideApellidos).toBe('LÓPEZ HERNÁNDEZ');
      expect(r.debug?.sideNombres).toBe('MARÍA');
    });
  });
});
