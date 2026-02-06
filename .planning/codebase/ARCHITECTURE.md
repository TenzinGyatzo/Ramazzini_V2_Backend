# Architecture

**Analysis Date:** 2025-02-04

## Pattern Overview

**Overall:** Monolito modular (backend NestJS) + SPA (frontend Vue 3). Backend por capas: controllers → services → Mongoose schemas; frontend por capas: views → components, stores (Pinia), API clients.

**Key Characteristics:**
- Backend modular por dominio (empresas, trabajadores, expedientes, auth, informes, pagos, etc.).
- Frontend centrado en vistas y pasos de flujos (steps); estado global en Pinia; múltiples clientes axios por dominio (api, proveedor, pagos, firmantes).
- Validación regulatoria (NOM-024, CIE-10, CURP, consentimiento diario) repartida entre backend (utils, validators, guards) y frontend (composables, políticas por proveedor).

## Layers

**Backend — API (NestJS):**
- Purpose: Exponer REST, validar y orquestar lógica de negocio.
- Location: `backend/src/`
- Contains: `main.ts`, `app.module.ts`, `modules/*` (controller, service, dto, schemas, entities), `filters/`, `utils/`, `decorators/`.
- Depends on: Mongoose, ConfigModule, class-validator/transformer, JWT, Multer, etc.
- Used by: Frontend vía HTTP.

**Backend — Modules:**
- Purpose: Agrupar por dominio (auth, users, empresas, centros-trabajo, trabajadores, expedientes, informes, printer, document-merger, proveedores-salud, medicos/enfermeras/tecnicos-firmantes, emails, pagos, catalogs, nom024-compliance, giis-export, consentimiento-diario, informe-personalizacion, riesgos-trabajo).
- Location: `backend/src/modules/<nombre>/`
- Contains: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `schemas/` (Mongoose), `entities/` (tipos Document), a veces `validators/`, `constants/`.
- Depends on: Otros módulos vía imports del módulo, MongooseModule, ConfigService.
- Used by: AppModule y entre módulos cuando hay dependencias.

**Frontend — Views & Router:**
- Purpose: Páginas y rutas; protección con auth y permisos.
- Location: `frontend/src/views/`, `frontend/src/router/index.ts`
- Contains: Vistas Vue (`.vue`), rutas con meta `requiresAuth`, `requiresPrincipal`; layout `LayOut.vue`, `SimpleLayout.vue`.
- Depends on: Stores (Pinia), API (axios), composables.
- Used by: Usuario final.

**Frontend — State & API:**
- Purpose: Estado global y comunicación con backend.
- Location: `frontend/src/stores/`, `frontend/src/api/`, `frontend/src/lib/` (instancias axios).
- Contains: Stores Pinia por dominio (user, empresas, trabajadores, documentos, proveedorSalud, etc.); módulos API por recurso (`*API.ts`); interceptors (token, errores regulatorios en `frontend/src/lib/axios.ts`).
- Depends on: Axios, Vue, composables.
- Used by: Views y components.

**Frontend — Components & Steps:**
- Purpose: UI reutilizable y flujos multi-paso (creación de documentos, expedientes).
- Location: `frontend/src/components/`, `frontend/src/components/steps/`
- Contains: Componentes Vue (modales, tablas, selectores, gráficas, badges, onboarding); steps con gran cantidad de pasos en `frontend/src/components/steps/`.
- Depends on: Stores, API, composables, helpers.
- Used by: Views y otros components.

## Data Flow

**Autenticación:**
1. Login en frontend → `AuthAPI` / auth store.
2. Backend valida y devuelve JWT; frontend guarda en localStorage y envía Bearer en `axios` interceptor.
3. Rutas con `requiresAuth` comprueban token/store; backend valida JWT en guards/controllers donde aplica.

**Expedientes y documentos:**
1. Usuario elige empresa, centro, trabajador (stores).
2. Flujos en steps (crear documento, cargar, etc.) llaman a API de expedientes/informes/documentos.
3. Backend lee/escribe MongoDB (schemas de expedientes, documentos) y sirve/guarda PDFs en sistema de archivos.

**Errores regulatorios:**
1. Backend devuelve `errorCode` (ej. `CONSENT_REQUIRED`) en cuerpo de error.
2. Interceptor en `frontend/src/lib/axios.ts` mapea códigos a mensajes UX (`regulatory-error-messages.ts`) y muestra toasts; CONSENT_REQUIRED se delega al composable/modal.

**State Management:**
- Pinia stores por dominio; sin store único global. Datos de sesión y permisos en `user` store; políticas regulatorias en `proveedorSalud`; datos de formularios en `formDataStore`, `steps`, etc.

## Key Abstractions

**Módulo NestJS:**
- Cada dominio es un módulo con Module, Controller, Service; DTOs para entrada; schemas Mongoose para persistencia. Ejemplos: `backend/src/modules/trabajadores/`, `backend/src/modules/expedientes/`.

**API client (frontend):**
- Un archivo por recurso en `frontend/src/api/*API.ts` que usa una instancia de axios (por defecto `frontend/src/lib/axios.ts` o instancias específicas de `lib/`).

**Regulatory policy:**
- Política por proveedor (regimen SIRES_NOM024 vs SIN_REGIMEN, validaciones CURP/CIE-10/geo, etc.) en backend (`regulatory-policy.service.ts`, validators) y frontend (composables como `useCurpPolicy`, stores).

**Expediente / documento:**
- Expediente como agregado de documentos; estados en `backend/src/modules/expedientes/enums/documento-estado.enum.ts`; tipos de informe en `backend/src/modules/informes/documents/*.informe.ts`.

## Entry Points

**Backend:**
- Location: `backend/src/main.ts`
- Triggers: `node dist/main` o `nest start`.
- Responsibilities: Cargar dotenv, crear app Nest, ValidationPipe global, CORS, Swagger en `/api`, límites body 10mb, filtro EnoentSilencer, servir estáticos (signatories, providers-logos), escuchar PORT.

**Frontend:**
- Location: `frontend/index.html`, `frontend/src/main.ts`, `frontend/src/App.vue`
- Triggers: Vite dev o apertura del build.
- Responsibilities: Montar Vue app, Pinia, router; router definido en `frontend/src/router/index.ts` con history y rutas protegidas.

## Error Handling

**Strategy:** Validación en backend con class-validator y ValidationPipe; errores de negocio/regulatorios con códigos en respuesta; frontend interceptor para códigos regulatorios y toasts; filtro global EnoentSilencer para ENOENT en expedientes.

**Patterns:**
- Backend: ValidationPipe `whitelist: true`; respuestas de error con `errorCode` y opcionalmente `details`.
- Frontend: `mapRegulatoryErrorStandalone` en `frontend/src/utils/regulatory-error-messages.ts`; toast vía `getToast()`; CONSENT_REQUIRED no muestra toast (modal).

## Cross-Cutting Concerns

**Logging:** Logger Nest/Node; middleware en `backend/src/modules/users/logger/logger.middleware.ts`.

**Validation:** class-validator en DTOs; validators custom en `backend/src/modules/expedientes/validators/`, `backend/src/modules/catalogs/validators/`; utils CURP/CIE-10/nombres en `backend/src/utils/`.

**Authentication:** JWT en backend (`jwt.ts`, auth module, guards); token en localStorage e interceptor en frontend; guards de consentimiento diario en `backend/src/utils/guards/daily-consent.guard.ts`.

---

*Architecture analysis: 2025-02-04*
