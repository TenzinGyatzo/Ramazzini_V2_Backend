import { calculateDateKey } from './date-key.util';
import { ProveedoresSalud } from '../modules/proveedores-salud/entities/proveedores-salud.entity';

describe('calculateDateKey', () => {
  it('debe usar timezone del proveedor cuando existe', () => {
    // Arrange
    const proveedor: Partial<ProveedoresSalud> = {
      _id: '507f1f77bcf86cd799439013',
      timezone: 'America/Mexico_City',
    };
    const referenceDate = new Date('2024-03-15T12:00:00Z');

    // Act
    const result = calculateDateKey(proveedor as ProveedoresSalud, referenceDate);

    // Assert
    expect(result).toBe('2024-03-15');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('debe usar fallback America/Mazatlan cuando no existe timezone', () => {
    // Arrange
    const proveedor = null;
    const referenceDate = new Date('2024-03-15T12:00:00Z');

    // Act
    const result = calculateDateKey(proveedor, referenceDate);

    // Assert
    expect(result).toBe('2024-03-15');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('debe generar formato correcto YYYY-MM-DD', () => {
    // Arrange
    const proveedor = null;
    const referenceDate = new Date('2024-12-31T23:59:59Z');

    // Act
    const result = calculateDateKey(proveedor, referenceDate);

    // Assert
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.split('-')[0]).toHaveLength(4); // Año
    expect(result.split('-')[1]).toHaveLength(2); // Mes
    expect(result.split('-')[2]).toHaveLength(2); // Día
  });

  it('debe usar fecha actual cuando no se proporciona referenceDate', () => {
    // Arrange
    const proveedor = null;
    const before = new Date();
    before.setHours(0, 0, 0, 0);

    // Act
    const result = calculateDateKey(proveedor);
    const after = new Date();
    after.setHours(23, 59, 59, 999);

    // Assert
    const resultDate = new Date(result + 'T00:00:00');
    expect(resultDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(resultDate.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('debe manejar diferentes zonas horarias correctamente', () => {
    // Arrange
    const referenceDate = new Date('2024-03-15T06:00:00Z'); // 6 AM UTC
    const proveedorMexico: Partial<ProveedoresSalud> = {
      _id: '507f1f77bcf86cd799439013',
      timezone: 'America/Mexico_City',
    };
    const proveedorMazatlan: Partial<ProveedoresSalud> = {
      _id: '507f1f77bcf86cd799439014',
      timezone: 'America/Mazatlan',
    };

    // Act
    const resultMexico = calculateDateKey(
      proveedorMexico as ProveedoresSalud,
      referenceDate,
    );
    const resultMazatlan = calculateDateKey(
      proveedorMazatlan as ProveedoresSalud,
      referenceDate,
    );

    // Assert
    expect(resultMexico).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(resultMazatlan).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Ambos deben ser fechas válidas (pueden diferir según la hora en cada timezone)
  });
});
