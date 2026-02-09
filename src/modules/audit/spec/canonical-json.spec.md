# Spec: JSON canónico para hash de eventos (NOM-024 D4)

## Objetivo

Permitir verificación externa (tamper-evident): cualquier alteración del evento invalida el hash. El hash se calcula sobre un JSON canónico con reglas fijas.

## Orden de llaves

El objeto a hashear debe serializarse con las llaves **siempre en este orden**:

1. `proveedorSaludId`
2. `actorId`
3. `timestamp`
4. `actionType`
5. `resourceType`
6. `resourceId`
7. `payload`

## Formato de valores

- **Timestamps:** ISO 8601 UTC, ej. `2026-02-06T12:00:00.000Z`. Usar `date.toISOString()`.
- **Null/undefined:** Serializar como `null` explícito. No omitir la llave.
- **Strings:** UTF-8. Sin espacios ni caracteres de control añadidos.
- **payload:** Objeto plano; si no hay datos, `null`.

## Exclusiones

- **No incluir** en el payload a hashear: `_id`, `hashEvento`, `hashEventoAnterior`, ni ningún campo derivado del propio proceso de auditoría.
- Solo se hashea el contenido que define el hecho (proveedorSalud, actor, momento, acción, recurso, payload de negocio).

## Algoritmo

1. Construir objeto con las llaves en orden y valores normalizados (fechas ISO, null explícito).
2. Serializar a JSON con `JSON.stringify` sobre un objeto cuyas propiedades se añaden en el orden definido (no usar objeto genérico y esperar orden).
3. `hashEvento = SHA-256(JSON canónico)` en hexadecimal (minúsculas).
4. Opcional: `hashEventoAnterior` = hash del evento inmediatamente anterior (cadena ligera) para detectar reordenación o borrado.

## Referencia de implementación

`src/modules/audit/utils/canonical-hash.util.ts` — función `computeCanonicalHash`.
