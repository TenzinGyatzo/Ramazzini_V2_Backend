import { validateNoDuplicateCIE10PrincipalAndComplementary } from './diagnosis-duplicate.validator';

describe('validateNoDuplicateCIE10PrincipalAndComplementary', () => {
  it('debe retornar isValid=false cuando principal y complementario son iguales', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('A30', [
      'A30',
    ]);
    expect(result.isValid).toBe(false);
    expect(result.duplicated).toBe('A30');
  });

  it('debe retornar isValid=false cuando principal y complementario son iguales con descripción', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary(
      'A30 - X',
      ['A30 - Y'],
    );
    expect(result.isValid).toBe(false);
    expect(result.duplicated).toBe('A30');
  });

  it('debe retornar isValid=true cuando principal y complementario son diferentes', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('A30', [
      'B20',
    ]);
    expect(result.isValid).toBe(true);
    expect(result.duplicated).toBeUndefined();
  });

  it('debe retornar isValid=false cuando principal está duplicado en múltiples complementarios', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('A30', [
      'A30',
      'B20',
    ]);
    expect(result.isValid).toBe(false);
    expect(result.duplicated).toBe('A30');
  });

  it('debe retornar isValid=true cuando principal es undefined', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary(
      undefined,
      ['A30'],
    );
    expect(result.isValid).toBe(true);
    expect(result.duplicated).toBeUndefined();
  });

  it('debe retornar isValid=true cuando complementarios es undefined', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary(
      'A30',
      undefined,
    );
    expect(result.isValid).toBe(true);
    expect(result.duplicated).toBeUndefined();
  });

  it('debe retornar isValid=true cuando complementarios es array vacío', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('A30', []);
    expect(result.isValid).toBe(true);
    expect(result.duplicated).toBeUndefined();
  });

  it('debe retornar isValid=false cuando principal en minúsculas coincide con complementario en mayúsculas', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('a30', [
      'A30',
    ]);
    expect(result.isValid).toBe(false);
    expect(result.duplicated).toBe('A30');
  });

  it('debe retornar isValid=true cuando hay múltiples complementarios sin duplicado', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('A30', [
      'B20',
      'C30',
      'D40',
    ]);
    expect(result.isValid).toBe(true);
    expect(result.duplicated).toBeUndefined();
  });

  it('debe ignorar elementos vacíos en complementarios', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('A30', [
      '',
      '   ',
      'B20',
    ]);
    expect(result.isValid).toBe(true);
    expect(result.duplicated).toBeUndefined();
  });

  it('debe retornar isValid=true cuando principal es string vacío', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('', [
      'A30',
    ]);
    expect(result.isValid).toBe(true);
    expect(result.duplicated).toBeUndefined();
  });

  it('debe retornar isValid=true cuando principal solo tiene espacios', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('   ', [
      'A30',
    ]);
    expect(result.isValid).toBe(true);
    expect(result.duplicated).toBeUndefined();
  });

  it('debe manejar códigos con punto decimal', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('A30.0', [
      'A30.0',
    ]);
    expect(result.isValid).toBe(false);
    expect(result.duplicated).toBe('A30.0');
  });

  it('debe detectar duplicado en cualquier posición del array', () => {
    const result = validateNoDuplicateCIE10PrincipalAndComplementary('A30', [
      'B20',
      'A30',
      'C30',
    ]);
    expect(result.isValid).toBe(false);
    expect(result.duplicated).toBe('A30');
  });
});
