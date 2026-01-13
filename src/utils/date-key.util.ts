const moment = require('moment-timezone');
import { ProveedoresSalud } from '../modules/proveedores-salud/entities/proveedores-salud.entity';

/**
 * Calcula dateKey (YYYY-MM-DD) usando timezone del tenant.
 * Si el proveedor no tiene timezone configurado, usa fallback "America/Mazatlan".
 *
 * @param proveedor - ProveedorSalud (o null si no disponible)
 * @param referenceDate - Fecha de referencia (default: "hoy" en server time)
 * @returns dateKey en formato "YYYY-MM-DD"
 *
 * @example
 * calculateDateKey(proveedor, new Date()) // "2024-03-15"
 * calculateDateKey(null, new Date('2024-03-15T23:00:00Z')) // "2024-03-15" (en timezone Mazatlan)
 */
export function calculateDateKey(
  proveedor: ProveedoresSalud | null | any,
  referenceDate?: Date,
): string {
  // 1. Obtener timezone del proveedor o usar fallback
  const timezone = (proveedor?.timezone as string) || 'America/Mazatlan';

  // 2. Usar fecha de referencia o "hoy"
  const date = referenceDate || new Date();

  // 3. Convertir a la zona horaria especificada y formatear como YYYY-MM-DD
  // moment-timezone maneja la conversión correctamente
  try {
    return moment(date).tz(timezone).format('YYYY-MM-DD');
  } catch (error) {
    // Si hay error con el timezone (por ejemplo, timezone inválido), usar fallback
    console.warn(
      `Error al calcular dateKey con timezone ${timezone}, usando fallback:`,
      error,
    );
    return moment(date).tz('America/Mazatlan').format('YYYY-MM-DD');
  }
}
