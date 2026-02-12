/**
 * Script de demostración: ejecutar con
 *   npx ts-node -r tsconfig-paths/register src/utils/parseNombreCompleto.demo.ts
 * desde la raíz del backend.
 */
import { parseNombreCompleto } from './parseNombreCompleto';

const ENTRADA = 'Juan Pedro Sanchez Moreno';

console.log('--- Entrada ---');
console.log(ENTRADA);
console.log('');

const resultado = parseNombreCompleto(ENTRADA, { enableDebug: true });

console.log('--- Salida ---');
console.log(
  'nombrePrestador:          ',
  JSON.stringify(resultado.nombrePrestador),
);
console.log(
  'primerApellidoPrestador:  ',
  JSON.stringify(resultado.primerApellidoPrestador),
);
console.log(
  'segundoApellidoPrestador: ',
  JSON.stringify(resultado.segundoApellidoPrestador),
);
console.log('');

if (resultado.debug) {
  console.log('--- Debug ---');
  console.log(JSON.stringify(resultado.debug, null, 2));
}
