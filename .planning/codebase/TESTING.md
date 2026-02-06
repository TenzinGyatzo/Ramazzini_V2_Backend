# Testing Patterns

**Analysis Date:** 2025-02-04

## Test Framework

**Backend:**
- Runner: Jest 29
- Config: `backend/package.json` (bloque `jest`) y configs separados `backend/test/jest-e2e.json`, `backend/test/jest-nom024.json`
- Assertions: Jest (expect)
- Run commands:
```bash
cd backend && npm run test              # Unit (specs en src)
npm run test:watch                       # Watch
npm run test:cov                         # Coverage
npm run test:e2e                         # E2E (jest-e2e.json)
npm run test:nom024                      # NOM-024 (jest-nom024.json)
```

**Frontend:**
- Runner: Vitest 1.0
- Config: `frontend/vitest.config.ts` (globals: true, environment: jsdom, setupFiles: `./src/test/setup.ts`, alias `@` → `./src`)
- Assertions: Vitest (expect)
- Run commands:
```bash
cd frontend && npm run test              # Run tests
npm run test:ui                          # UI
npm run test:run                          # Single run
```

## Test File Organization

**Backend:**
- Location: Unit specs co-located con código (`*.spec.ts` en `backend/src/`); e2e y NOM-024 en `backend/test/` (fixtures en `backend/test/fixtures/`, utils en `backend/test/utils/`).
- Naming: `*.spec.ts` para unit; `*.e2e-spec.ts` para e2e; `*.nom024.spec.ts` para NOM-024.
- Structure: `backend/test/` contiene `app.e2e-spec.ts`, `jest-e2e.json`, `jest-nom024.json`, `nom024/*.nom024.spec.ts`, `fixtures/*.fixtures.ts`, `utils/mongodb-memory.util.ts`, `utils/test-module.util.ts`.

**Frontend:**
- Location: Co-located (ej. `frontend/src/views/MedicoFirmanteView.spec.ts`, `EnfermeraFirmanteView.spec.ts`, `PerfilProveedorView.spec.ts`, `TecnicoFirmanteView.spec.ts`, `frontend/src/components/DocumentoItem.spec.ts`).
- Naming: `<ComponentOrView>.spec.ts` junto al `.vue`.

## Test Structure

**Backend (Jest) — unit:**
- Describe/it por módulo o utilidad. Ejemplo en `backend/src/utils/curp-validator.util.spec.ts` (validación CURP y generic CURP).
- Tests NOM-024: describe por entidad o flujo (Lesion GIIS-B013, Deteccion GIIS-B019, catalogs, curp-validation, etc.) en `backend/test/nom024/`.

**Backend (Jest) — e2e/NOM-024:**
- MongoDB en memoria: `backend/test/utils/mongodb-memory.util.ts` (start/stop, clear collections). Uso en NOM-024 con `test-module.util.ts` (MongooseModule).
- Fixtures: `backend/test/fixtures/` (deteccion, lesion, professional, proveedor-salud, trabajador, vital-signs) exportan objetos válidos para schemas.

**Frontend (Vitest):**
- describe/it por vista o comportamiento. Setup: Pinia en beforeEach (createPinia, setActivePinia). Ejemplo en `frontend/src/views/MedicoFirmanteView.spec.ts`:
```typescript
describe('MedicoFirmanteView - CURP Required Marker', () => {
  let pinia: any;
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });
  it('should show asterisk (*) for CURP field in SIRES_NOM024', () => {
    const proveedorSaludStore = useProveedorSaludStore();
    proveedorSaludStore.proveedorSalud = { _id: 'test-id', regulatoryPolicy: createSiresPolicy() } as any;
    // mount + expect
  });
});
```

## Mocking

**Backend:**
- Jest mocks con `jest.mock()`, `jest.spyOn()`; módulos Nest con `@nestjs/testing` (TestingModule). Fixtures evitan mocks de DB en tests NOM-024 usando MongoDB Memory Server.
- En unit tests de servicios se inyectan mocks de Model (Mongoose) o dependencias.

**Frontend:**
- @vue/test-utils `mount()` con stubs o componentes reales; Pinia real en tests (setActivePinia). No se detectó vi.mock sistemático en los specs revisados; se mockea store con datos concretos (ej. `regulatoryPolicy`).

**What to Mock:**
- Backend: MongoDB en e2e/NOM-024 no se mockea (memory server); en unit sí se mockean modelos y dependencias externas.
- Frontend: API y router pueden stubearse si el test no requiere navegación o HTTP; stores se instancian con estado controlado.

**What NOT to Mock:**
- Lógica pura de validación (CURP, CIE-10) en backend; componentes Vue que solo dependen de props/stores cuando el test es de integración ligera.

## Fixtures and Factories

**Backend:**
- Location: `backend/test/fixtures/` — `deteccion.fixtures.ts`, `lesion.fixtures.ts`, `professional.fixtures.ts`, `proveedor-salud.fixtures.ts`, `trabajador.fixtures.ts`, `vital-signs.fixtures.ts`, `index.ts`.
- Pattern: Objetos que cumplen schemas NOM-024/dominio (ej. `validLesionAccidental`, `validDeteccion`) para usar en expect y en tests de integración.

**Frontend:**
- No se detectó carpeta `fixtures` o `factories` dedicada; datos de prueba inline en specs (ej. `createSiresPolicy()`, `createSinRegimenPolicy()` en MedicoFirmanteView.spec.ts).

## Coverage

**Backend:**
- Jest: `collectCoverageFrom: **/*.(t|j)s`, `coverageDirectory: ../coverage`. Comando: `npm run test:cov`. No hay umbral mínimo configurado en el bloque jest revisado.

**Frontend:**
- Vitest no tiene opción coverage en los scripts de `frontend/package.json`; se puede añadir con `vitest run --coverage` si se configura.

## Test Types

**Unit Tests:**
- Backend: Servicios, utils, validators (ej. `curp-validator.util.spec.ts`, `cie10-restrictions.util.spec.ts`, `geography.validator.spec.ts`, `centros-trabajo.service.spec.ts`, `enfermeras-firmantes.service.spec.ts`, `trabajadores.service.spec.ts`).
- Frontend: Vistas y componentes con store mockeado (CURP required marker, etc.).

**Integration Tests:**
- Backend: Tests NOM-024 en `backend/test/nom024/` con MongoDB en memoria y fixtures (validación de schemas, CRUD, export GIIS).

**E2E Tests:**
- Backend: `backend/test/app.e2e-spec.ts` con jest-e2e.json. Frontend: No detectado E2E (Playwright/Cypress) en la exploración.

## Common Patterns

**Async Testing:**
- Backend: async/await en it(); MongoDB memory server async en beforeAll/afterAll.
- Frontend: tests síncronos en los ejemplos (mount + expect); para operaciones async usar await flushPromises o similar si se añaden.

**Error Testing:**
- Backend: expect(() => fn()).toThrow(); validación con expect(result).toEqual(...) o expect(...).toBeDefined() según el caso.
- Frontend: assert sobre DOM o estado del componente tras acción (ej. asterisco visible para CURP en SIRES_NOM024).

---

*Testing analysis: 2025-02-04*
