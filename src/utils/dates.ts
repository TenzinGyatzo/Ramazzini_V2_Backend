function convertirFechaISOaDDMMYYYY(dateString: string): string {
    const fecha = new Date(dateString);
    
    if (isNaN(fecha.getTime())) {
      throw new Error("La fecha proporcionada no es válida.");
    }
  
    const dia = String(fecha.getDate()).padStart(2, '0'); // Obtiene el día con dos dígitos
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0, por eso se suma 1
    const año = fecha.getFullYear(); // Obtiene el año completo
  
    return `${dia}/${mes}/${año}`;
  }

function convertirFechaISOaYYYYMMDD(dateString: string): string {
    if (!dateString) {
      return ""; // Retorna un string vacío si el parámetro es una cadena vacía
    }
    
    const fecha = new Date(dateString);
    
    if (isNaN(fecha.getTime())) {
      throw new Error("La fecha proporcionada no es válida.");
    }
  
    const dia = String(fecha.getDate()).padStart(2, '0'); // Obtiene el día con dos dígitos
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0, por eso se suma 1
    const año = fecha.getFullYear(); // Obtiene el año completo
  
    return `${año}-${mes}-${dia}`;
  }

function calcularEdad(dateString: string): number {
    const fechaNacimiento = new Date(dateString);
    if (isNaN(fechaNacimiento.getTime())) {
      throw new Error("La fecha proporcionada no es válida.");
    }
  
    const hoy = new Date().getTime(); 
    const edad = Math.floor(
      (hoy - fechaNacimiento.getTime()) / (1000 * 60 * 60 * 24 * 365)
    );
    return edad;
  }

function calcularAntiguedad(dateString: string): string {
  const fechaIngreso = new Date(dateString);
  const fechaIngresoMilisegundos = fechaIngreso.getTime();
  const hoy = new Date();
  const hoyMilisegundos = new Date().getTime();
  const milisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  const antiguedadEnMilisegundos = hoyMilisegundos - fechaIngresoMilisegundos;
  if (antiguedadEnMilisegundos <= milisecondsPerWeek) {
    return "Nuevo Ingreso";
  }
  const totalMonths =
    (hoy.getFullYear() - fechaIngreso.getFullYear()) * 12 +
    hoy.getMonth() -
    fechaIngreso.getMonth();
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years} años, ${months} meses`;
}

  

  export { convertirFechaISOaDDMMYYYY, convertirFechaISOaYYYYMMDD, calcularEdad, calcularAntiguedad };
  