# Coding Conventions

**Analysis Date:** 2025-02-04

## Naming Patterns

**Files:**
- Backend: kebab-case para módulos, DTOs, schemas (`trabajadores.service.ts`, `create-trabajador.dto.ts`, `centro-trabajo.schema.ts`). Excepciones: `auth-helpers.ts`, `regulatory-error-messages.ts` en utils.
- Frontend: PascalCase para componentes y vistas Vue (`MedicoFirmanteView.vue`, `DocumentoItem.vue`); camelCase o kebab para TS (`AuthAPI.ts`, `regulatory-error-messages.ts`, `consentimiento-diario.ts`).
- Tests: sufijo `.spec.ts` (co-located con el archivo bajo test).

**Functions:**
- camelCase en backend y frontend (ej. `validateCURP`, `getToast`, `mapRegulatoryErrorStandalone` en `frontend/src/utils/regulatory-error-messages.ts`).

**Variables:**
- camelCase; constantes en UPPER_SNAKE cuando son config (ej. `BASE_URL` en componentes). Stores Pinia: camelCase (`useUserStore`, `useProveedorSaludStore`).

**Types:**
- Interfaces: PascalCase (`backend/src/modules/users/entities/user.entity.ts`). DTOs: CreateXxxDto, UpdateXxxDto. Enums: PascalCase con valores en UPPER_SNAKE o camel según contexto (`DocumentoEstado` en `backend/src/modules/expedientes/enums/documento-estado.enum.ts`).

## Code Style

**Formatting:**
- Backend: Prettier (`backend/.prettierrc`: `singleQuote: true`, `trailingComma: all`). Comando: `npm run format` (Prettier sobre `src` y `test`).
- Frontend: Sin .prettierrc en raíz frontend detectado; Vite/TS estándar. Usar comillas dobles en Vue/template donde se ve en ejemplos; en TS a veces dobles (ej. `frontend/src/lib/axios.ts`).

**Linting:**
- Backend: ESLint en `backend/.eslintrc.js` (parser TypeScript, plugin @typescript-eslint, Prettier integrado). Reglas: interface-name-prefix off, explicit-function-return-type off, explicit-module-boundary-types off, no-explicit-any off; no-unused-vars con args/varsIgnorePattern `^_`. Comando: `npm run lint`.
- Frontend: No se detectó ESLint config en la exploración; el proyecto compila con vue-tsc.

## Import Organization

**Order:**
- Backend: Módulos Node/Nest primero, luego relativos (ej. `backend/src/app.module.ts`: Module, MongooseModule, ConfigModule, luego rutas relativas a módulos).
- Frontend: Externos primero (vue, vue-router, axios, @/...), luego alias `@/` para api, stores, composables, utils.

**Path Aliases:**
- Frontend: `@` → `./src` (definido en `frontend/vite.config.ts` y `frontend/tsconfig.app.json` implícito). Uso: `@/api/AuthAPI`, `@/stores/user`, `@/utils/toast`.
- Backend: Jest `moduleNameMapper`: `^src/(.*)$` → `/<rootDir>/$1` para tests.

## Error Handling

**Patterns:**
- Backend: ValidationPipe global (whitelist); errores de negocio devueltos con cuerpo `{ errorCode, details? }`. Filtro global `EnoentSilencerFilter` en `backend/src/filters/enoent-silencer.filter.ts` para ENOENT. Excepciones HTTP con códigos apropiados desde controllers/services.
- Frontend: Interceptor axios en `frontend/src/lib/axios.ts` captura respuestas con `errorCode`, mapea con `mapRegulatoryErrorStandalone` y muestra toast; re-lanza el error para manejo en componente. CONSENT_REQUIRED no muestra toast (modal dedicado).

## Logging

**Framework:** Logger estándar Nest/Node en backend; `console` en frontend para fallbacks (ej. `console.error` en interceptor).

**Patterns:**
- Backend: Middleware de logger en `backend/src/modules/users/logger/logger.middleware.ts`. No hay convención explícita de niveles en el código revisado.
- Frontend: Evitar console en producción en flujos críticos; usar solo en catch de mapeo de errores si es necesario.

## Comments

**When to Comment:**
- Comentarios en español e inglés mezclados (ej. "Si el teléfono ya tiene formato internacional", "TODO: Obtener dinámicamente"). Se usan para TODOs, aclaraciones de negocio (CURP genérica XXXX999999XXXXXX99) y bloques complejos.

**JSDoc/TSDoc:**
- Usado en backend en validadores y utils (ej. `backend/src/utils/curp-validator.util.ts` para documentar generic CURP). No obligatorio en todo el código.

## Function Design

**Size:**
- Servicios backend con métodos largos en dominios complejos (ej. `trabajadores.service.ts`); preferir extraer helpers o sub-servicios cuando se refactorice.

**Parameters:**
- DTOs para entrada en controllers; inyección por constructor en Nest (InjectModel, ConfigService, etc.). Frontend: composables con parámetros opcionales donde tenga sentido.

**Return Values:**
- Backend: Tipos explícitos en servicios cuando hay retorno no trivial; DTOs o entidades. Frontend: tipos en interfaces cuando existen (`frontend/src/interfaces/`).

## Module Design

**Exports:**
- Backend: Módulos exportan con `@Module({ imports: [...], controllers: [...], providers: [...] })`; no re-exportar servicios por defecto salvo si otro módulo los importa.
- Frontend: Componentes Vue export default; stores Pinia `defineStore`; API y composables export default o named según uso.

**Barrel Files:**
- Backend: `backend/test/utils/index.ts`, `backend/test/nom024/index.ts` re-exportan utilidades y fixtures. No hay barrels generales en `backend/src/modules/`.
- Frontend: No detectado patrón barrel sistemático en `api/` o `stores/`.

---

*Convention analysis: 2025-02-04*
