# Casos de Prueba Backend - Hardening Consentimiento Diario (C7)

Este documento describe los casos de prueba para validar el enforcement defensivo y la consistencia temporal del consentimiento diario en el backend.

## Configuración de Pruebas

### Setup Base
- Proveedor de salud con `regimenRegulatorio: 'SIRES_NOM024'`
- Proveedor de salud con `regimenRegulatorio: 'SIN_REGIMEN'`
- Trabajador asociado al proveedor
- Usuario autenticado con JWT válido

## Casos de Prueba

### Test 1: Crear documento sin consentimiento → Bloquea

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Sin consentimiento del día actual
- DateKey esperado: Calculado server-side (ej: "2024-03-15")

**Acción**:
```
POST /api/expedientes/:trabajadorId/documentos/:documentType/crear
Headers: Authorization: Bearer <token>
Body: { ... datos del documento ... }
```

**Esperado**:
- Status: `403 Forbidden`
- Response:
```json
{
  "statusCode": 403,
  "message": "Se requiere consentimiento informado diario para realizar esta acción",
  "errorCode": "CONSENT_REQUIRED",
  "details": {
    "trabajadorId": "...",
    "dateKey": "2024-03-15",
    "action": "CREATE_DOCUMENT"
  }
}
```

---

### Test 2: Crear documento con consentimiento válido → OK

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Con consentimiento del día actual
- DateKey: Calculado server-side (ej: "2024-03-15")
- Consentimiento creado previamente con `dateKey: "2024-03-15"`

**Acción**:
```
POST /api/expedientes/:trabajadorId/documentos/:documentType/crear
Headers: Authorization: Bearer <token>
Body: { ... datos del documento ... }
```

**Esperado**:
- Status: `201 Created`
- Response: Documento creado exitosamente

---

### Test 3: Crear documento con consentimiento de otro día → Bloquea

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Con consentimiento de ayer (`dateKey: "2024-03-14"`)
- DateKey actual del servidor: "2024-03-15"

**Acción**:
```
POST /api/expedientes/:trabajadorId/documentos/:documentType/crear
Headers: Authorization: Bearer <token>
Body: { ... datos del documento ... }
```

**Esperado**:
- Status: `403 Forbidden`
- Response:
```json
{
  "statusCode": 403,
  "message": "El consentimiento usado corresponde a una fecha diferente. Se requiere consentimiento del día actual.",
  "errorCode": "CONSENT_INVALID_DATE",
  "details": {
    "trabajadorId": "...",
    "dateKey": "2024-03-15",
    "action": "CREATE_DOCUMENT"
  }
}
```

**Nota**: Este caso es teóricamente difícil de reproducir porque el guard busca por `dateKey` actual, pero la validación explícita en el guard (línea 9) detecta cualquier inconsistencia.

---

### Test 4: Crear documento en SIN_REGIMEN → OK (sin validación)

**Setup**:
- Proveedor: SIN_REGIMEN
- Trabajador: Sin consentimiento (no requerido)

**Acción**:
```
POST /api/expedientes/:trabajadorId/documentos/:documentType/crear
Headers: Authorization: Bearer <token>
Body: { ... datos del documento ... }
```

**Esperado**:
- Status: `201 Created`
- Response: Documento creado exitosamente
- **Nota**: El guard hace pass-through silencioso cuando `dailyConsentEnabled === false`

---

### Test 5: Intentar modificar consentimiento → Bloquea (Futuro)

**Setup**:
- Endpoint de update (si se agrega en el futuro)

**Acción**:
```
PATCH /api/consentimiento-diario/:id
PUT /api/consentimiento-diario/:id
DELETE /api/consentimiento-diario/:id
```

**Esperado**:
- Status: `404 Not Found` (si no existe endpoint)
- O `403 Forbidden` con código `REGIMEN_DOCUMENT_IMMUTABLE` (si se implementa bloqueo)

**Nota**: Actualmente no existen estos endpoints. Si se agregan en el futuro, deben bloquearse explícitamente.

---

### Test 6: Crear documentoExterno sin consentimiento → Bloquea

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Sin consentimiento del día actual

**Acción**:
```
POST /api/expedientes/:trabajadorId/documentos/documentoExterno
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: { ... datos del documento externo + archivo ... }
```

**Esperado**:
- Status: `403 Forbidden`
- Response: `CONSENT_REQUIRED` (igual que Test 1)

---

### Test 7: Crear lesion sin consentimiento → Bloquea

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Sin consentimiento del día actual

**Acción**:
```
POST /api/expedientes/:trabajadorId/documentos/lesion
Headers: Authorization: Bearer <token>
Body: { 
  "idTrabajador": "...",
  "fechaAtencion": "...",
  "folio": "...",
  ... otros campos ...
}
```

**Esperado**:
- Status: `403 Forbidden`
- Response: `CONSENT_REQUIRED` (igual que Test 1)

**Nota**: El guard extrae `trabajadorId` del body (`idTrabajador`) usando `extractTrabajadorId`.

---

### Test 8: Crear deteccion sin consentimiento → Bloquea

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Sin consentimiento del día actual

**Acción**:
```
POST /api/expedientes/:trabajadorId/documentos/deteccion
Headers: Authorization: Bearer <token>
Body: { 
  "idTrabajador": "...",
  "fechaAtencion": "...",
  ... otros campos ...
}
```

**Esperado**:
- Status: `403 Forbidden`
- Response: `CONSENT_REQUIRED` (igual que Test 1)

**Nota**: Similar a Test 7, el guard extrae `trabajadorId` del body.

---

### Test 9: Crear documento con consentimiento válido (todos los endpoints) → OK

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Con consentimiento del día actual
- DateKey: Calculado server-side

**Acciones** (todas deben pasar):
1. `POST /api/expedientes/:trabajadorId/documentos/:documentType/crear`
2. `POST /api/expedientes/:trabajadorId/documentos/documentoExterno`
3. `POST /api/expedientes/:trabajadorId/documentos/lesion`
4. `POST /api/expedientes/:trabajadorId/documentos/deteccion`

**Esperado**:
- Todas: Status `201 Created`
- Documentos creados exitosamente

---

### Test 10: Race Condition - Dos requests simultáneos creando consentimiento

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Sin consentimiento
- Dos requests POST simultáneos a `/api/consentimiento-diario`

**Acción**:
```
Request 1: POST /api/consentimiento-diario
Request 2: POST /api/consentimiento-diario (simultáneo)
Body: { trabajadorId: "...", consentMethod: "AUTOGRAFO" }
```

**Esperado**:
- Uno de los requests: Status `201 Created`
- El otro request: Status `409 Conflict` con `CONSENT_ALREADY_EXISTS`
- **Nota**: El índice único compuesto en MongoDB previene duplicados a nivel DB

---

### Test 11: Crear documento inmediatamente después de POST consentimiento

**Setup**:
- Proveedor: SIRES_NOM024
- Trabajador: Sin consentimiento inicial

**Acción**:
```
1. POST /api/consentimiento-diario
   Body: { trabajadorId: "...", consentMethod: "AUTOGRAFO" }
   Response: 201 Created

2. POST /api/expedientes/:trabajadorId/documentos/:documentType/crear (inmediatamente después)
   Body: { ... datos del documento ... }
```

**Esperado**:
- Request 1: Status `201 Created`
- Request 2: Status `201 Created` (el guard busca en tiempo real, no cache)

---

### Test 12: Validación de dateKey con timezone del proveedor

**Setup**:
- Proveedor: SIRES_NOM024 con `timezone: "America/Mexico_City"`
- Trabajador: Con consentimiento
- Fecha del servidor: 2024-03-15 23:30:00 UTC
- DateKey esperado en timezone del proveedor: "2024-03-15" (si aún es 15 en Mexico_City)

**Acción**:
```
POST /api/expedientes/:trabajadorId/documentos/:documentType/crear
```

**Esperado**:
- El guard calcula `dateKey` usando `calculateDateKey()` con timezone del proveedor
- Si el consentimiento tiene el `dateKey` correcto según el timezone → Status `201 Created`
- Si el consentimiento tiene un `dateKey` diferente → Status `403 Forbidden` con `CONSENT_INVALID_DATE`

---

## Validaciones Adicionales

### Validación de Inmutabilidad del Consentimiento

**Verificación**:
- ✅ No existen endpoints `@Patch`, `@Put`, o `@Delete` en `ConsentimientoDiarioController`
- ✅ El schema tiene índice único compuesto: `{proveedorSaludId, trabajadorId, dateKey}`
- ✅ El servicio valida unicidad antes de crear (línea 226-238)
- ✅ Si se intenta crear duplicado, lanza `CONSENT_ALREADY_EXISTS`

### Validación de Consistencia Temporal

**Verificación**:
- ✅ El guard calcula `dateKey` server-side usando `calculateDateKey()`
- ✅ El guard busca consentimiento por `dateKey` calculado
- ✅ El guard valida explícitamente que `consentimiento.dateKey === dateKey` (defensa en profundidad)
- ✅ Si no coincide, lanza `CONSENT_INVALID_DATE`

---

## Notas de Implementación

1. **DateKey Calculation**: El `dateKey` se calcula usando `calculateDateKey()` que considera el timezone del proveedor. Si el proveedor no tiene timezone, usa fallback `America/Mazatlan`.

2. **Performance**: El guard hace 3-4 queries por request:
   - Trabajador (para obtener proveedorSaludId)
   - CentroTrabajo
   - Empresa
   - ConsentimientoDiario

3. **Backward Compatibility**: Los cambios son **no-breaking** para SIN_REGIMEN (guard hace pass-through silencioso).

4. **Error Handling**: Todos los errores regulatorios usan el formato estándar con `errorCode`, `message`, y `details` para facilitar el manejo en frontend.
