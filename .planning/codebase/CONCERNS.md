# Codebase Concerns

**Analysis Date:** 2025-02-04

## Tech Debt

**userId hardcodeado en importación de trabajadores:**
- Issue: `currentUserId` fijo `'6650f38308ac3beedf5ac41b'` en lugar de obtenerlo del usuario autenticado.
- Files: `frontend/src/composables/useImportacionTrabajadores.ts` (líneas ~50 y ~114).
- Impact: En producción puede asociar importaciones al usuario equivocado; pruebas con usuario fijo pueden enmascarar fallos.
- Fix approach: Inyectar o leer userId desde store de usuario (ej. `useUserStore()`) o desde contexto de la petición en backend si la importación se hace por API.

**Texto de consentimiento diario pendiente de producción:**
- Issue: Constante de texto del consentimiento marcada como TODO para actualizar antes de producción.
- Files: `backend/src/modules/consentimiento-diario/constants/consent-text.constants.ts`.
- Impact: Riesgo de usar texto provisional en producción (legal/regulatorio).
- Fix approach: Definir texto final con negocio/legal y reemplazar en `consent-text.constants.ts`; revisar que no queden referencias a "TODO" en ese archivo.

**Validación de código postal no implementada:**
- Issue: Comentario TODO en validador de geografía: "Implement if postal code validation is needed".
- Files: `backend/src/modules/catalogs/validators/geography.validator.ts` (aprox. línea 272).
- Impact: Códigos postales no validados contra catálogo si se activa la validación más estricta.
- Fix approach: Implementar lookup contra `backend/catalogs/normalized/codigos_postales.csv` (o servicio equivalente) si el producto lo requiere.

**Duplicación de lógica de formato de teléfono:**
- Issue: Mismo comentario/lógica "Si el teléfono ya tiene formato internacional (+52...)" repetido en múltiples informes PDF y componentes.
- Files: Varios en `backend/src/modules/informes/documents/*.informe.ts` (audiometria, antidoping, aptitud-puesto, certificado, certificado-expedito, constancia-aptitud, control-prenatal, examen-vista, exploracion-fisica, historia-clinica, historia-otologica, nota-aclaratoria, nota-medica, previo-espirometria, receta), y en `frontend/src/views/PerfilProveedorView.vue`, `frontend/src/components/steps/VisualizadorConstanciaAptitud.vue`.
- Impact: Cambios en reglas de formato de teléfono requieren tocar muchos archivos; riesgo de inconsistencia.
- Fix approach: Extraer helper único (backend y/o frontend) para normalizar/formatear teléfono y usarlo en todos los puntos.

## Known Bugs

- No se identificaron bugs explícitos con síntomas y pasos de reproducción en la exploración. Los TODOs anteriores son deuda o trabajo pendiente, no bugs confirmados.

## Security Considerations

**Secrets y CORS:**
- Risk: `JWT_SECRET` y URIs de MongoDB en `.env`; si se filtran, comprometen sesiones y datos.
- Files: Uso en `backend/src/utils/jwt.ts`, `backend/src/utils/auth-helpers.ts`, `backend/src/app.module.ts`. CORS en `backend/src/main.ts` limita orígenes a `https://ramazzini.app` y `http://localhost:5173`.
- Current mitigation: Variables en entorno; CORS restrictivo.
- Recommendations: No commitear .env; usar secret manager en producción; revisar que no queden URLs o secrets hardcodeados (el userId en useImportacionTrabajadores es un ejemplo de dato sensible hardcodeado).

**Token en frontend:**
- Risk: Token JWT en localStorage es vulnerable a XSS.
- Files: `frontend/src/lib/axios.ts` (localStorage.getItem('AUTH_TOKEN')).
- Current mitigation: Uso estándar en SPAs.
- Recommendations: Considerar httpOnly cookies para refresh token si se endurece seguridad; mantener buenas prácticas de sanitización y CSP.

## Performance Bottlenecks

**Servicio de trabajadores muy grande:**
- Problem: `trabajadores.service.ts` concentra mucha lógica (miles de líneas en el listado del módulo).
- Files: `backend/src/modules/trabajadores/trabajadores.service.ts`.
- Cause: Un solo servicio con muchos casos de uso (CRUD, reportes, NOM-024, etc.).
- Improvement path: Extraer sub-servicios o módulos por responsabilidad (ej. reportes, transferencias, validaciones NOM-024) para mejorar mantenibilidad y posibilidad de optimizar por partes.

**Límites de body 10mb:**
- Configurado en `backend/src/main.ts` (express.json y urlencoded). Para cargas muy grandes (ej. importaciones masivas o PDFs), monitorear tiempos y considerar jobs en background o chunking.

## Fragile Areas

**Steps y FormStepper:**
- Files: `frontend/src/components/steps/` (muchos componentes), `frontend/src/components/steps/FormStepper.vue`.
- Why fragile: Flujos largos y acoplados a tipos de documento y regulación; cambios en NOM-024 o tipos de informe pueden requerir tocar muchos steps.
- Safe modification: Añadir tests de integración o E2E para flujos críticos; documentar dependencias entre step y tipo de documento.
- Test coverage: Tests unitarios en vistas concretas (MedicoFirmante, PerfilProveedor, etc.); no hay E2E de flujo completo de creación de documento en la exploración.

**Generación de informes PDF:**
- Files: `backend/src/modules/informes/documents/*.informe.ts`, `backend/src/modules/printer/printer.service.ts`.
- Why fragile: Muchos informes con lógica similar (teléfono, datos trabajador); cambios en plantillas o datos afectan a todos.
- Safe modification: Centralizar helpers (teléfono, formato de fechas, datos comunes) y usar plantillas o factory por tipo de informe.
- Test coverage: No detectados tests unitarios de generación de cada informe.

## Scaling Limits

- MongoDB como única base: sin caché, el crecimiento de expedientes y documentos puede aumentar latencia en listados y búsquedas. Considerar índices y paginación estricta.
- Archivos estáticos y uploads en disco local: adecuado para un solo nodo; para múltiples instancias hace falta almacenamiento compartido (S3, NFS) o política de afinidad.

## Dependencies at Risk

- No se identificaron dependencias obsoletas o con CVEs conocidos en la exploración. Recomendación rutinaria: ejecutar `npm audit` en backend y frontend y actualizar dependencias con vulnerabilidades.

## Missing Critical Features

- Coverage de tests frontend no obligatorio en CI (sin script coverage en package.json del frontend). E2E para flujos críticos (login, crear documento, consentimiento) no detectado.

## Test Coverage Gaps

**Frontend:**
- What's not tested: Gran parte de vistas y componentes (solo unos pocos *View.spec.ts y DocumentoItem.spec.ts revisados). Flujos completos de steps sin E2E.
- Files: Mayoría de `frontend/src/views/*.vue` y `frontend/src/components/steps/*.vue`.
- Risk: Regresiones en UI y flujos sin detección automática.
- Priority: Medio–Alto si se prioriza calidad antes de nuevas features.

**Backend:**
- Informes: generación de PDF por tipo de informe sin tests unitarios.
- Integraciones: emails y Mercado Pago con mocks en tests no revisados en detalle; asegurar que rutas críticas estén cubiertas.

---

*Concerns audit: 2025-02-04*
