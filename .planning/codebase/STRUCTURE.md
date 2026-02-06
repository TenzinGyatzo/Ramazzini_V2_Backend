# Codebase Structure

**Analysis Date:** 2025-02-04

## Directory Layout

```
Ramazzini-V2/
├── backend/                 # API NestJS + MongoDB
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── modules/         # Dominios (auth, users, trabajadores, expedientes, etc.)
│   │   └── utils/
│   ├── test/                # Jest e2e y NOM-024
│   ├── catalogs/            # CSV normalizados y fuentes
│   ├── assets/              # Firmas y logos
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── .eslintrc.js, .prettierrc
├── frontend/                # SPA Vue 3 + Vite
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── api/             # Clientes API por recurso
│   │   ├── components/      # Componentes y steps
│   │   ├── composables/
│   │   ├── helpers/
│   │   ├── interfaces/
│   │   ├── layouts/
│   │   ├── lib/             # Instancias axios
│   │   ├── router/
│   │   ├── stores/          # Pinia
│   │   ├── views/
│   │   ├── utils/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── tailwind.config.js
├── docs/                    # Documentación proyecto
├── gsd-for-cursor/          # Comandos y plantillas GSD
└── .planning/codebase/      # Este mapeo
```

## Directory Purposes

**backend/src:**
- Purpose: Código fuente del API.
- Contains: Entry (main, app.module), módulos por dominio, filtros, decoradores, utilidades (validadores CURP/CIE-10, JWT, política regulatoria, etc.).
- Key files: `main.ts`, `app.module.ts`, `utils/jwt.ts`, `utils/regulatory-policy.service.ts`, `utils/curp-validator.util.ts`.

**backend/src/modules:**
- Purpose: Dominios de negocio (cada uno: module, controller, service, dto, schemas, entities).
- Contains: auth, users, empresas, centros-trabajo, trabajadores, expedientes, informes, printer, document-merger, proveedores-salud, medicos-firmantes, enfermeras-firmantes, tecnicos-firmantes, emails, pagos, catalogs, nom024-compliance, giis-export, consentimiento-diario, informe-personalizacion, riesgos-trabajo, files.
- Key files: Por módulo `*.module.ts`, `*.controller.ts`, `*.service.ts`; schemas en `schemas/*.schema.ts`.

**frontend/src:**
- Purpose: Código fuente de la SPA.
- Contains: api, components, composables, helpers, interfaces, layouts, lib, router, stores, views, utils, types, test (setup).
- Key files: `main.ts`, `App.vue`, `router/index.ts`, `lib/axios.ts`, stores en `stores/*.ts`.

**frontend/src/components/steps:**
- Purpose: Flujos multi-paso (creación/edición de documentos, expedientes).
- Contains: Muchos componentes Vue de pasos (steps); FormStepper y flujos por tipo de documento.
- Key files: `FormStepper.vue`, componentes de paso por tipo de informe/documento.

**frontend/src/api y frontend/src/lib:**
- Purpose: api = capa de llamadas por recurso; lib = instancias axios (base URL, interceptors).
- Key files: `api/*API.ts`, `lib/axios.ts`, `lib/axiosProveedor.ts`, etc.

## Key File Locations

**Entry Points:**
- `backend/src/main.ts`: arranque NestJS, CORS, Swagger, estáticos.
- `frontend/src/main.ts`: bootstrap Vue; `frontend/index.html`: raíz HTML.

**Configuration:**
- Backend: `backend/tsconfig.json`, `backend/nest-cli.json`, `backend/.env` / `.env.production`.
- Frontend: `frontend/vite.config.ts`, `frontend/vitest.config.ts`, `frontend/tsconfig.app.json`, `frontend/tailwind.config.js`, env en `.env.local` / `.env.production`.

**Core Logic:**
- Backend: servicios en `backend/src/modules/<dominio>/<dominio>.service.ts`; validadores en `backend/src/utils/` y `backend/src/modules/expedientes/validators/`, `backend/src/modules/catalogs/validators/`.
- Frontend: stores en `frontend/src/stores/`; composables en `frontend/src/composables/`.

**Testing:**
- Backend: `backend/test/` (e2e, fixtures, nom024), Jest en `package.json`; specs co-located con `*.spec.ts` en algunos módulos.
- Frontend: `frontend/src/test/setup.ts`; specs en `frontend/src/views/*.spec.ts`, `frontend/src/components/*.spec.ts`; Vitest en `frontend/vitest.config.ts`.

## Naming Conventions

**Files:**
- Backend: kebab-case para módulos y archivos (`trabajadores.service.ts`, `create-trabajador.dto.ts`, `centro-trabajo.schema.ts`).
- Frontend: PascalCase para componentes Vue (`MedicoFirmanteView.vue`, `DocumentoItem.vue`); camelCase o kebab para TS (`AuthAPI.ts`, `regulatory-error-messages.ts`).
- Tests: `*.spec.ts` (backend Jest y frontend Vitest); backend e2e/NOM-024 en `test/` con sufijo `.nom024.spec.ts` o en `jest-e2e.json` / `jest-nom024.json`.

**Directories:**
- kebab-case en backend (`centros-trabajo`, `proveedores-salud`, `consentimiento-diario`).
- camelCase o PascalCase en frontend para vistas/componentes (`MedicoFirmanteView.vue` en `views/`).

## Where to Add New Code

**New Feature (backend):**
- Nuevo dominio: crear `backend/src/modules/<nombre>/` con `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `schemas/` si aplica; registrar en `backend/src/app.module.ts`.
- Nueva ruta en dominio existente: añadir método en controller y servicio en ese módulo.

**New Feature (frontend):**
- Nueva página: vista en `frontend/src/views/`, ruta en `frontend/src/router/index.ts`; si usa API nueva, añadir `frontend/src/api/<Nombre>API.ts` y opcionalmente store en `frontend/src/stores/`.
- Nuevo componente reutilizable: `frontend/src/components/` (o subcarpeta por dominio: `modals/`, `steps/`, etc.).

**Utilities:**
- Backend: `backend/src/utils/` (helpers, validadores, guards, decoradores).
- Frontend: `frontend/src/helpers/`, `frontend/src/utils/`, `frontend/src/composables/`.

**Tests:**
- Backend: unit/co-located `*.spec.ts` junto al archivo; e2e/NOM-024 en `backend/test/` con fixtures en `backend/test/fixtures/`.
- Frontend: `*.spec.ts` junto a la vista o componente; setup en `frontend/src/test/setup.ts`.

## Special Directories

**backend/catalogs:**
- Purpose: Catálogos normalizados (CSV) y fuentes (XLSX) para geografía, diagnósticos, establecimientos, etc.
- Generated: Parcialmente (normalizados desde source).
- Committed: Sí (CSV y fuentes en repo).

**backend/expedientes-medicos:**
- Purpose: PDFs de expedientes servidos por Nest (ServeStaticModule).
- Generated: Por la aplicación al generar/guardar expedientes.
- Committed: No (uploads; típicamente en .gitignore).

**backend/uploads:**
- Purpose: Destino Multer para subidas.
- Generated: Por la aplicación.
- Committed: No.

**frontend/public:**
- Purpose: Assets estáticos (imágenes, etc.) servidos por Vite sin procesar.
- Committed: Sí.

**gsd-for-cursor:**
- Purpose: Comandos Cursor y plantillas GSD (map-codebase, plan-phase, etc.); no es parte del producto Ramazzini.
- Committed: Sí.

---

*Structure analysis: 2025-02-04*
