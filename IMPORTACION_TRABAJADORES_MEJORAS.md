# Mejoras en la Importación de Trabajadores

## Problema Identificado

La importación de trabajadores desde Excel fallaba cuando las fechas no eran exactamente del tipo texto (string) en el formato "DD/MM/YYYY". El sistema no era suficientemente robusto para manejar diferentes tipos de datos que pueden venir desde Excel.

## Soluciones Implementadas

### 1. Método `parseExcelDate` Mejorado

Nuevo método que maneja múltiples formatos de fecha:

- **Fechas seriales de Excel**: Números que representan días desde 1900-01-01
- **Strings en múltiples formatos**: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, etc.
- **Objetos Date**: Fechas ya parseadas
- **Formatos con separadores**: Guiones, barras, puntos
- **Años cortos y largos**: YY y YYYY

### 2. Limpieza y Normalización de Datos

Método `cleanWorkerData` que:

- Elimina espacios en blanco de todos los campos string
- Convierte valores "null", "undefined" y strings vacíos a `null`
- Normaliza tipos de datos antes de la validación
- Maneja casos especiales de Excel
- **Normaliza enumeraciones automáticamente** (mayúsculas/minúsculas, variaciones, sinónimos)

### 3. Validación Robusta

Método `validateAndCleanWorkerData` que:

- Valida campos requeridos
- Valida enumeraciones (sexo, escolaridad, estado civil, etc.)
- Valida formato de número de empleado
- Proporciona mensajes de error detallados
- Incluye información del tipo de dato en los errores

### 4. Logging y Depuración Mejorado

- Logs detallados de cada paso del proceso
- Información de tipos de datos recibidos
- Trazabilidad completa de errores
- Estadísticas de importación (total, exitosos, fallidos)

## Normalización de Enumeraciones

### Sistema Inteligente de Normalización

El sistema ahora incluye un motor de normalización que maneja automáticamente:

#### **1. Variaciones de Mayúsculas/Minúsculas**
- `"SOLTERO/A"` → `"Soltero/a"`
- `"femenino"` → `"Femenino"`
- `"UNION LIBRE"` → `"Unión libre"`

#### **2. Mapeos de Sinónimos**
- `"hombre"` → `"Masculino"`
- `"mujer"` → `"Femenino"`
- `"bachillerato"` → `"Preparatoria"`
- `"universidad"` → `"Licenciatura"`
- `"trabajando"` → `"Activo"`
- `"desempleado"` → `"Inactivo"`

#### **3. Búsqueda Parcial**
- `"Soltero"` → `"Soltero/a"`
- `"Casado"` → `"Casado/a"`
- `"Union"` → `"Unión libre"`

#### **4. Búsqueda Fuzzy**
- Maneja errores tipográficos menores
- Umbral de similitud del 70%
- Usa algoritmo de distancia de Levenshtein

#### **5. Normalización de Acentos**
- `"union libre"` → `"Unión libre"`
- `"maestria"` → `"Maestría"`

### Enumeraciones Soportadas

#### **Sexo**
- Valores válidos: `["Masculino", "Femenino"]`
- Acepta: `"M", "HOMBRE", "VARON", "F", "MUJER", "HEMBRA"`

#### **Estado Civil**
- Valores válidos: `["Soltero/a", "Casado/a", "Unión libre", "Separado/a", "Divorciado/a", "Viudo/a"]`
- Acepta: `"SOLTERO", "CASADO", "UNION LIBRE", "SEPARADO", "DIVORCIADO", "VIUDO"`

#### **Escolaridad**
- Valores válidos: `["Primaria", "Secundaria", "Preparatoria", "Licenciatura", "Maestría", "Doctorado", "Nula"]`
- Acepta: `"BACHILLERATO", "UNIVERSIDAD", "MAESTRIA", "SIN ESTUDIOS"`

#### **Estado Laboral**
- Valores válidos: `["Activo", "Inactivo"]`
- Acepta: `"TRABAJANDO", "EMPLEADO", "DESEMPLEADO", "CESADO"`

## Formatos de Fecha Soportados

### Strings
- `DD/MM/YYYY` (ej: 15/03/1990)
- `MM/DD/YYYY` (ej: 03/15/1990)
- `YYYY-MM-DD` (ej: 1990-03-15)
- `DD-MM-YYYY` (ej: 15-03-1990)
- `MM-DD-YYYY` (ej: 03-15-1990)
- `YYYY/MM/DD` (ej: 1990/03/15)
- `DD.MM.YYYY` (ej: 15.03.1990)
- `MM.DD.YYYY` (ej: 03.15.1990)
- `YYYY.MM.DD` (ej: 1990.03.15)
- Años cortos: `DD/MM/YY`, `MM/DD/YY`, etc.

### Números (Fechas Seriales de Excel)
- Excel almacena fechas como días desde 1900-01-01
- Ejemplo: 36525 = 2000-01-01
- Se corrige el bug de Excel del año 1900 (no bisiesto)

### Objetos Date
- Fechas ya parseadas por JavaScript
- Se valida que sean fechas válidas

## Manejo de Errores

### Errores de Validación
- Campos requeridos faltantes
- Formatos de fecha inválidos
- Valores de enumeración incorrectos
- Números de empleado mal formateados

### Errores de Base de Datos
- Errores de unicidad
- Errores de validación de Mongoose
- Errores de conexión

### Respuesta de Error Mejorada
```json
{
  "message": "Hubo errores durante la importación. Revisa los datos y asegúrate de usar el formato correcto.",
  "data": [...],
  "totalProcessed": 10,
  "successful": 7,
  "failed": 3
}
```

## Uso

### Importación Básica
```typescript
const resultado = await trabajadoresService.importarTrabajadores(
  excelData, 
  idCentroTrabajo, 
  userId
);
```

### Datos de Excel Esperados
```typescript
interface ExcelWorker {
  nombre: string;
  fechaNacimiento: string | number | Date;
  fechaIngreso: string | number | Date;
  sexo: string;           // Acepta: "MASCULINO", "hombre", "M", etc.
  escolaridad: string;    // Acepta: "BACHILLERATO", "universidad", etc.
  puesto: string;
  telefono?: string;
  estadoCivil: string;    // Acepta: "SOLTERO", "union libre", etc.
  numeroEmpleado?: string;
  estadoLaboral?: string; // Acepta: "TRABAJANDO", "empleado", etc.
  agentesRiesgoActuales?: string[];
}
```

### Ejemplos de Normalización Automática

```typescript
// El sistema normaliza automáticamente estos valores:

// Sexo
"SOLTERO/A" → "Soltero/a"        // ✅ Aceptado
"femenino" → "Femenino"          // ✅ Aceptado
"hombre" → "Masculino"           // ✅ Aceptado
"m" → "Masculino"                // ✅ Aceptado

// Estado Civil
"union libre" → "Unión libre"    // ✅ Aceptado
"Union Libre" → "Unión libre"    // ✅ Aceptado
"casado" → "Casado/a"            // ✅ Aceptado
"separado" → "Separado/a"        // ✅ Aceptado

// Escolaridad
"BACHILLERATO" → "Preparatoria"  // ✅ Aceptado
"universidad" → "Licenciatura"   // ✅ Aceptado
"MAESTRIA" → "Maestría"          // ✅ Aceptado
"sin estudios" → "Nula"          // ✅ Aceptado

// Estado Laboral
"TRABAJANDO" → "Activo"          // ✅ Aceptado
"empleado" → "Activo"            // ✅ Aceptado
"DESEMPLEADO" → "Inactivo"       // ✅ Aceptado
```

## Recomendaciones para Usuarios

### Formato de Excel Recomendado
1. **Fechas**: Usar formato de celda "Fecha" en Excel
2. **Campos de texto**: Evitar espacios extra al inicio/final
3. **Enumeraciones**: Usar exactamente los valores permitidos
4. **Números**: Usar formato de celda "Texto" para números de empleado

### Plantilla de Excel
- Incluir encabezados exactos
- Usar validación de datos en Excel
- Probar con pocos registros primero
- Verificar formatos de fecha antes de importar

## Logs de Depuración

### Nivel DEBUG
- Estructura de datos recibidos
- Proceso de cada trabajador
- Datos procesados y tipos
- Estadísticas de importación

### Nivel ERROR
- Errores de validación
- Errores de base de datos
- Stack traces completos
- Datos del trabajador que falló

## Mantenimiento

### Agregar Nuevos Formatos de Fecha
Editar el array `formats` en `parseExcelDate`:

```typescript
const formats = [
  'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD',
  // Agregar nuevos formatos aquí
];
```

### Agregar Nuevas Validaciones
Editar `validateAndCleanWorkerData` para incluir nuevas reglas de validación.

### Agregar Nuevas Enumeraciones
Para agregar nuevas enumeraciones, editar `getSpecificMappings`:

```typescript
// Ejemplo: Agregar nuevo campo "Tipo de Contrato"
if (validValues.includes('Indefinido') || validValues.includes('Temporal')) {
  const tipoContratoMappings: Record<string, string> = {
    'indefinido': 'Indefinido',
    'permanente': 'Indefinido',
    'temporal': 'Temporal',
    'por obra': 'Temporal'
  };
  
  if (tipoContratoMappings[inputLower]) return tipoContratoMappings[inputLower];
}
```

### Modificar Logging
Ajustar los niveles de log según necesidades de producción.

### Probar Normalización
Usar el método `testNormalization()` para probar la normalización:

```typescript
// En el servicio
await trabajadoresService.testNormalization();
```
