# Plan de Migración: Integración CIE-10 en Diagnósticos

## Resumen Ejecutivo

Este documento describe el plan de migración para agregar códigos CIE-10 a los documentos médicos `NotaMedica` y `HistoriaClinica`, cumpliendo con los requisitos NOM-024 para proveedores en México.

## Cambios Implementados

### 1. Campos Nuevos Agregados

**NotaMedica y HistoriaClinica:**
- `codigoCIE10Principal` (string, opcional): Código CIE-10 del diagnóstico principal
- `codigosCIE10Complementarios` (string[], opcional): Array de códigos CIE-10 de diagnósticos complementarios

**Nota Importante:** Los campos de texto libre existentes (`diagnostico` en NotaMedica y `resumenHistoriaClinica` en HistoriaClinica) se mantienen para compatibilidad hacia atrás.

### 2. Validación Condicional

- **Proveedores MX (país = 'MX'):** `codigoCIE10Principal` es **obligatorio** y se valida contra el catálogo CIE-10
- **Proveedores no-MX:** Los campos CIE-10 son **opcionales**

### 3. Formato de Código CIE-10

Formato válido: `[A-Z][0-9]{2}(\.[0-9]{1,2})?`
- Ejemplos válidos: `A00`, `A00.0`, `A00.1`, `Z99.9`
- Ejemplos inválidos: `a00`, `A0`, `A00.`, `A00.123`

## Estrategia de Migración

### Fase 1: Preparación (Completada)

✅ Campos CIE-10 agregados a schemas
✅ Validación condicional implementada
✅ Endpoint de búsqueda CIE-10 disponible
✅ Backend funcional con compatibilidad hacia atrás

### Fase 2: Migración de Datos Existentes

**⚠️ IMPORTANTE: Esta fase requiere revisión médica profesional**

#### 2.1 Identificación de Documentos a Migrar

```javascript
// Query para encontrar documentos sin códigos CIE-10 de proveedores MX
db.notamedicas.find({
  codigoCIE10Principal: { $exists: false },
  // Agregar filtro por proveedor MX cuando esté disponible
});

db.historiaclinicas.find({
  codigoCIE10Principal: { $exists: false },
  // Agregar filtro por proveedor MX cuando esté disponible
});
```

#### 2.2 Proceso de Mapeo Manual

**No se puede automatizar completamente** porque:
- Los diagnósticos en texto libre pueden tener múltiples interpretaciones
- Un mismo texto puede corresponder a diferentes códigos CIE-10 dependiendo del contexto
- Requiere conocimiento médico especializado para asignar códigos correctos

**Proceso recomendado:**

1. **Exportar datos para revisión médica:**
   - Generar reporte con: ID documento, diagnóstico texto libre, fecha, trabajador
   - Entregar a profesionales médicos certificados

2. **Revisión médica:**
   - Profesionales médicos revisan cada diagnóstico
   - Asignan código CIE-10 principal apropiado
   - Identifican códigos secundarios si aplica

3. **Validación de códigos:**
   - Verificar que todos los códigos asignados existan en el catálogo CIE-10
   - Validar formato (puede automatizarse)

4. **Importación de códigos:**
   - Actualizar documentos con códigos CIE-10 validados
   - Mantener texto libre original para referencia

#### 2.3 Script de Actualización (Ejemplo)

```javascript
// EJEMPLO - NO EJECUTAR SIN REVISIÓN MÉDICA PREVIA
// Este script muestra la estructura, pero los códigos deben venir de revisión médica

const migrationMap = [
  {
    documentId: ObjectId("..."),
    codigoCIE10Principal: "A00.0", // Asignado por médico
    codigosCIE10Complementarios: ["B00.1", "C00.2"], // Si aplica
  },
  // ... más documentos
];

for (const item of migrationMap) {
  await db.notamedicas.updateOne(
    { _id: item.documentId },
    {
      $set: {
        codigoCIE10Principal: item.codigoCIE10Principal,
        codigosCIE10Complementarios: item.codigosCIE10Complementarios || [],
      },
    }
  );
}
```

### Fase 3: Validación Post-Migración

1. **Verificar integridad:**
   ```javascript
   // Verificar que todos los documentos MX tengan código principal
   db.notamedicas.find({
     codigoCIE10Principal: { $exists: false },
     // proveedorSalud.pais === 'MX'
   }).count(); // Debe ser 0
   ```

2. **Validar códigos contra catálogo:**
   - Ejecutar validación de todos los códigos CIE-10 asignados
   - Confirmar que todos existen en `catalogs/normalized/diagnosticos.csv`

3. **Pruebas de regresión:**
   - Verificar que la aplicación funcione correctamente con datos migrados
   - Confirmar que nuevos documentos requieren CIE-10 para MX

### Fase 4: Comunicación y Capacitación

1. **Comunicar cambios a usuarios:**
   - Documentar nuevos campos en manual de usuario
   - Explicar obligatoriedad para proveedores MX

2. **Capacitar personal médico:**
   - Uso del endpoint de búsqueda CIE-10 para autocompletado
   - Selección correcta de códigos CIE-10

## Estimación de Tiempo

- **Preparación:** ✅ Completado
- **Migración de datos:** 2-4 semanas (requiere revisión médica profesional)
- **Validación:** 1 semana
- **Capacitación:** 1 semana

**Total estimado:** 4-6 semanas desde el inicio de la migración de datos

## Riesgos y Mitigación

### Riesgo 1: Asignación incorrecta de códigos CIE-10
**Mitigación:** Requerir revisión médica profesional, validación contra catálogo

### Riesgo 2: Documentos existentes sin códigos (proveedores MX)
**Mitigación:** 
- Durante período de transición, permitir documentos sin código con advertencia
- Requerir códigos para documentos nuevos después de fecha límite

### Riesgo 3: Volumen alto de documentos a migrar
**Mitigación:** Priorizar documentos recientes, migrar en lotes

## Rollback

Si es necesario revertir:

1. Los campos CIE-10 son opcionales, no afectan documentos existentes
2. La validación condicional puede desactivarse sin afectar datos
3. Los campos de texto libre originales se mantienen intactos

**Nota:** No es necesario eliminar campos CIE-10 si se revierte la validación.

## Soporte

Para preguntas sobre este plan de migración, contactar al equipo de desarrollo.

**Última actualización:** Diciembre 2025

