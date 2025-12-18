# Backend Test Suite

This directory contains all test files for the Ramazzini V2 backend application.

## Directory Structure

```
test/
├── README.md                    # This file
├── app.e2e-spec.ts              # Application e2e tests
├── jest-e2e.json                # Jest config for e2e tests
├── jest-nom024.json             # Jest config for NOM-024 compliance tests
├── nom024/                      # NOM-024 Phase 1 compliance tests
│   ├── index.ts                 # Re-exports for easy importing
│   ├── catalogs.nom024.spec.ts  # Catalog service tests (Tasks 1, 12, 14)
│   ├── curp-validation.nom024.spec.ts      # CURP validation (Tasks 3, 9)
│   ├── name-validation.nom024.spec.ts      # Name format validation (Task 10)
│   ├── vital-signs.nom024.spec.ts          # Vital signs validation (Task 11)
│   ├── document-state.nom024.spec.ts       # Document lifecycle (Tasks 6, 7)
│   ├── lesion-giis-b013.nom024.spec.ts     # GIIS-B013 Lesion (Tasks 12, 13)
│   ├── deteccion-giis-b019.nom024.spec.ts  # GIIS-B019 Deteccion (Tasks 14, 15)
│   └── giis-export.nom024.spec.ts          # GIIS Export (Task 16)
├── fixtures/                    # Test data fixtures
│   ├── index.ts
│   ├── trabajador.fixtures.ts
│   ├── proveedor-salud.fixtures.ts
│   ├── professional.fixtures.ts
│   ├── lesion.fixtures.ts
│   ├── deteccion.fixtures.ts
│   └── vital-signs.fixtures.ts
└── utils/                       # Test utilities
    ├── index.ts
    ├── mongodb-memory.util.ts   # MongoDB Memory Server setup
    └── test-module.util.ts      # NestJS testing module helpers
```

## Running Tests

### All Unit Tests
```bash
npm test
```

### NOM-024 Compliance Tests
```bash
npm run test:nom024
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

### Watch Mode
```bash
npm run test:watch
```

## NOM-024 Phase 1 Test Suite

The `nom024/` directory contains comprehensive tests for NOM-024-SSA3-2012 compliance implementation (Tasks 1-16).

### Test Coverage by Task

| Task | Description | Test File |
|------|-------------|-----------|
| 1 | Catalog Service | `catalogs.nom024.spec.ts` |
| 2 | Conditional Enforcement | `catalogs.nom024.spec.ts` |
| 3 | CURP Validation | `curp-validation.nom024.spec.ts` |
| 4 | Trabajador NOM-024 Fields | `trabajador.fixtures.ts` |
| 5 | ProveedorSalud CLUES | `catalogs.nom024.spec.ts` |
| 6 | Document State Management | `document-state.nom024.spec.ts` |
| 7 | Document Immutability | `document-state.nom024.spec.ts` |
| 8 | CIE-10 Diagnosis | `catalogs.nom024.spec.ts` |
| 9 | Professional CURP | `curp-validation.nom024.spec.ts` |
| 10 | Name Format Validation | `name-validation.nom024.spec.ts` |
| 11 | Vital Signs Validation | `vital-signs.nom024.spec.ts` |
| 12 | GIIS-B013 Catalogs | `lesion-giis-b013.nom024.spec.ts` |
| 13 | Lesion Entity/CRUD | `lesion-giis-b013.nom024.spec.ts` |
| 14 | GIIS-B019 Catalogs | `deteccion-giis-b019.nom024.spec.ts` |
| 15 | Deteccion Entity/CRUD | `deteccion-giis-b019.nom024.spec.ts` |
| 16 | GIIS Export Layer | `giis-export.nom024.spec.ts` |

### Test Fixtures

The `fixtures/` directory contains reusable test data:

- **trabajador.fixtures.ts**: Sample Trabajador entities with MX/non-MX variations
- **proveedor-salud.fixtures.ts**: Sample healthcare providers with CLUES
- **professional.fixtures.ts**: MedicoFirmante, EnfermeraFirmante, TecnicoFirmante data
- **lesion.fixtures.ts**: GIIS-B013 Lesion records
- **deteccion.fixtures.ts**: GIIS-B019 Deteccion records
- **vital-signs.fixtures.ts**: Vital signs test data

### Test Utilities

The `utils/` directory contains testing helpers:

- **mongodb-memory.util.ts**: MongoDB Memory Server setup/teardown
- **test-module.util.ts**: NestJS TestingModule creation helpers

## Important Notes

### Missing GIIS Catalogs

Some GIIS catalogs are **NOT publicly available** from DGIS:
- SITIO_OCURRENCIA
- AGENTE_LESION
- AREA_ANATOMICA
- CONSECUENCIA
- TIPO_PERSONAL
- SERVICIOS_DET

**Tests are designed to pass even when these catalog CSV files are missing.**

The system uses best-effort validation (type checking + basic bounds) for these fields.

### MX vs Non-MX Behavior

NOM-024 compliance is **conditional** based on `proveedorSalud.pais`:
- **MX providers**: Strict validation with errors
- **Non-MX providers**: Permissive validation with warnings only

Tests cover both scenarios to ensure backward compatibility.

## Writing New Tests

### Unit Tests
Place unit tests alongside the source files:
```
src/modules/example/example.service.ts
src/modules/example/example.service.spec.ts
```

### NOM-024 Compliance Tests
Add to `test/nom024/` with `.nom024.spec.ts` suffix:
```
test/nom024/new-feature.nom024.spec.ts
```

### Integration Tests
Use MongoDB Memory Server for database tests:
```typescript
import { startMongoMemoryServer, stopMongoMemoryServer, clearDatabase } from '../utils';

beforeAll(async () => {
  await startMongoMemoryServer();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await stopMongoMemoryServer();
});
```

