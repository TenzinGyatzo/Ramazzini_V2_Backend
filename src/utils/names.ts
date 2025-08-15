/**
 * Utilidades para el manejo y formateo de nombres
 */

/**
 * Formatea el nombre completo de un trabajador concatenando primer apellido, 
 * segundo apellido y nombre, filtrando valores undefined o vacíos
 * @param primerApellido - Primer apellido del trabajador
 * @param segundoApellido - Segundo apellido del trabajador (opcional)
 * @param nombre - Nombre del trabajador
 * @returns Nombre completo formateado o 'Sin nombre' si no hay datos válidos
 */
export function formatearNombreCompleto(
  primerApellido: string | undefined,
  segundoApellido: string | undefined,
  nombre: string | undefined
): string {
  const partes = [primerApellido, segundoApellido, nombre]
    .filter(parte => parte && parte.trim() !== '');
  
  return partes.join(' ') || 'Sin nombre';
}

/**
 * Formatea el nombre completo de un trabajador usando un objeto Trabajador
 * @param trabajador - Objeto con las propiedades del trabajador
 * @returns Nombre completo formateado o 'Sin nombre' si no hay datos válidos
 */
export function formatearNombreTrabajador(trabajador: {
  primerApellido: string | undefined;
  segundoApellido: string | undefined;
  nombre: string | undefined;
}): string {
  return formatearNombreCompleto(
    trabajador.primerApellido,
    trabajador.segundoApellido,
    trabajador.nombre
  );
}

/**
 * Formatea el nombre completo de un trabajador en el orden: nombre + primer apellido + segundo apellido
 * @param trabajador - Objeto con las propiedades del trabajador
 * @returns Nombre completo formateado o 'Sin nombre' si no hay datos válidos
 */
export function formatearNombreTrabajadorCertificado(trabajador: {
  primerApellido: string | undefined;
  segundoApellido: string | undefined;
  nombre: string | undefined;
}): string {
  const partes = [
    trabajador.nombre,
    trabajador.primerApellido,
    trabajador.segundoApellido
  ].filter(parte => parte && parte.trim() !== '');
  
  return partes.join(' ') || 'Sin nombre';
}
