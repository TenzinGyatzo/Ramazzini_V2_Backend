# Technology Stack

**Analysis Date:** 2025-02-04

## Languages

**Primary:**
- TypeScript ~5.4 (frontend), ^5.1 (backend) — toda la aplicación (frontend `frontend/`, backend `backend/src/`)

**Secondary:**
- JavaScript en configs (`.eslintrc.js`, `vite.config.ts`, etc.)

## Runtime

**Environment:**
- Node.js (backend NestJS; versión implícita por `@tsconfig/node20` en frontend)
- Navegador (frontend Vue 3)

**Package Manager:**
- npm (lockfiles: `frontend/package-lock.json`, `backend/package-lock.json`)

## Frameworks

**Core:**
- Vue 3.4 — frontend SPA en `frontend/src/`
- NestJS 10 — API y backend en `backend/src/`
- Vite 5.4 — build y dev server del frontend (`frontend/vite.config.ts`)

**Testing:**
- Vitest 1.0 + @vue/test-utils 2.4 + jsdom — frontend (`frontend/vitest.config.ts`, `frontend/src/views/*.spec.ts`)
- Jest 29 + ts-jest + supertest — backend (`backend/package.json` jest config, `backend/test/`)
- mongodb-memory-server — tests e2e/NOM-024 del backend

**Build/Dev:**
- vue-tsc — type-check del frontend
- @vitejs/plugin-vue — compilación Vue en Vite
- Nest CLI — build del backend (`nest build`)

## Key Dependencies

**Critical:**
- mongoose ^8.7 + @nestjs/mongoose ^10 — persistencia y modelos en backend (`backend/src/app.module.ts`, módulos en `backend/src/modules/*/schemas/`)
- Pinia ^2.1 — estado global en frontend (`frontend/src/stores/`)
- vue-router ^4.3 — rutas en `frontend/src/router/index.ts`
- axios ^1.7 — HTTP en frontend (`frontend/src/lib/axios.ts`, `frontend/src/api/*.ts`) y backend (llamadas externas)
- class-validator + class-transformer — DTOs y validación en backend
- jsonwebtoken + bcrypt — autenticación en `backend/src/modules/auth/`, `backend/src/utils/jwt.ts`

**Infrastructure:**
- @nestjs/config — variables de entorno en backend
- @nestjs/swagger — documentación API en `/api`
- Tailwind CSS 3.4 — estilos en frontend (`frontend/tailwind.config.js`)
- FormKit (@formkit/vue, @formkit/themes) — formularios
- pdfmake, pdf-lib, @vue-pdf-viewer/viewer — PDFs en frontend y backend
- Bootstrap 5 — componentes UI en frontend
- DataTables (datatables.net-*) — tablas avanzadas
- Chart.js + vue-chartjs — gráficas
- posthog-js — analytics

## Configuration

**Environment:**
- Backend: dotenv en `backend/src/main.ts` (`.env` o `.env.production` según NODE_ENV). Variables clave: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `SIGNATORIES_UPLOADS_DIR`, `PROVIDERS_UPLOADS_DIR`.
- Frontend: Vite env — `import.meta.env.VITE_API_URL`, `VITE_VPV_LICENSE`, `import.meta.env.BASE_URL` (ver `frontend/src/lib/axios.ts`, `frontend/src/components/DocumentoItem.vue`).

**Build:**
- Frontend: `frontend/vite.config.ts`, `frontend/tsconfig.app.json`, `frontend/tsconfig.json`
- Backend: `backend/tsconfig.json`, `backend/tsconfig.build.json`, `backend/nest-cli.json`

## Platform Requirements

**Development:**
- Node 20+ (recomendado por @tsconfig/node20)
- MongoDB para backend
- Ejecución: `frontend`: `npm run dev` (Vite), `backend`: `npm run start:dev` (Nest)

**Production:**
- Backend: Node, PM2 opcional (`backend/ecosystem.config.js`)
- Frontend: build estático (`npm run build`); hosting de SPA + proxy/API a backend
- CORS configurado en `backend/src/main.ts` para `https://ramazzini.app` y `http://localhost:5173`

---

*Stack analysis: 2025-02-04*
