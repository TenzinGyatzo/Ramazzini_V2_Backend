# External Integrations

**Analysis Date:** 2025-02-04

## APIs & External Services

**Backend API (consumida por frontend):**
- Base URL: `import.meta.env.VITE_API_URL` (frontend), ej. `https://ramazzini.app` en producción
- Clientes axios: `frontend/src/lib/axios.ts` (API general), `frontend/src/lib/axiosProveedor.ts`, `axiosAuth.ts`, `axiosEnfermeraFirmante.ts`, `axiosMedicoFirmante.ts`, `axiosPagos.ts`, `axiosRTs.ts`, `axiosTecnicoFirmante.ts`
- Autenticación: Bearer en header desde `localStorage.getItem('AUTH_TOKEN')` (interceptor en `frontend/src/lib/axios.ts`)

**Pagos:**
- Mercado Pago — SDK `mercadopago` en backend (`backend/package.json`), módulo `backend/src/modules/pagos/`

**Email:**
- Nodemailer — `backend/src/modules/emails/` (`emails.service.ts`, `emails.config.ts`)

## Data Storage

**Databases:**
- MongoDB — único almacenamiento persistente
- Conexión: `MONGODB_URI` (ConfigService en `backend/src/app.module.ts`)
- Cliente: Mongoose vía @nestjs/mongoose; schemas en `backend/src/modules/*/schemas/*.schema.ts`

**File Storage:**
- Sistema de archivos local: `backend/uploads` (Multer en `backend/src/app.module.ts`), `backend/assets/signatories`, `backend/assets/providers-logos`, `backend/expedientes-medicos` (servidos estáticamente en `/expedientes-medicos`)

**Caching:**
- No detectado (sin Redis ni capa de caché explícita)

## Authentication & Identity

**Auth Provider:**
- Custom JWT
- Implementación: `backend/src/modules/auth/` (auth.service, auth.controller), `backend/src/utils/jwt.ts` (sign con `process.env.JWT_SECRET`), `backend/src/utils/auth-helpers.ts` (verify). Frontend: login → token en localStorage, interceptor axios Bearer.

## Monitoring & Observability

**Error Tracking:**
- No detectado servicio externo (Sentry, etc.) en el código revisado

**Logs:**
- Logger estándar Nest/Node; middleware de logger en `backend/src/modules/users/logger/logger.middleware.ts`

**Analytics:**
- PostHog — `posthog-js` en frontend, uso en `frontend/src/composables/usePostHog.ts`, `frontend/src/router/index.ts`

## CI/CD & Deployment

**Hosting:**
- Producción referenciada como `https://ramazzini.app` (CORS en `backend/src/main.ts`)

**CI Pipeline:**
- No detectado en el repo (sin `.github/workflows` ni otros configs CI visibles en la exploración)

## Environment Configuration

**Required env vars (backend):**
- `MONGODB_URI` — conexión MongoDB
- `JWT_SECRET` — firma JWT
- `PORT` — puerto (default 3000)
- `SIGNATORIES_UPLOADS_DIR` — directorio firmas (médico/tecnico/enfermera)
- `PROVIDERS_UPLOADS_DIR` — logos proveedores
- Variables de email y Mercado Pago según módulos `emails` y `pagos`

**Frontend:**
- `VITE_API_URL` — URL base del API
- `VITE_VPV_LICENSE` — licencia Vue PDF Viewer (opcional, en `frontend/src/components/DocumentoItem.vue`)

**Secrets location:**
- Archivos `.env` y `.env.production` en `frontend/` y `backend/` (no versionados; presentes en listado de archivos)

## Webhooks & Callbacks

**Incoming:**
- No detectados endpoints de webhook documentados en el flujo mapeado

**Outgoing:**
- No detectados callbacks salientes documentados más allá de llamadas HTTP desde frontend al backend y backend a Mercado Pago/email según módulos

---

*Integration audit: 2025-02-04*
