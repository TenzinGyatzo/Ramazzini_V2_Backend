# PARTE 5: AJUSTES EN EL FRONTEND (CAPTURA)
## NOM-024-SSA3-2012 - Fase 1: Estandarización de Datos

---

## OBJETIVO

Proponer cambios en los formularios de captura del frontend para asegurar que la entrada de datos cumpla con las nuevas reglas de validación:
- Uso de catálogos para selección de datos normalizados
- Formato de fechas y validación de CURP
- Campos obligatorios según NOM-024
- Prevención de abreviaturas y caracteres no permitidos

---

## 1. MODIFICACIONES AL FORMULARIO DE TRABAJADORES

### 1.1. Componente Principal

**Archivo:** `frontend/src/components/ModalTrabajadores.vue`

#### Cambios Requeridos:

**1.1.1. Agregar Campo CURP**

```vue
<template>
  <!-- NUEVO CAMPO: CURP -->
  <FormKit
    type="text"
    name="curp"
    label="CURP *"
    placeholder="VECR850101HDFRGN09"
    validation="required|length:18|curpValida"
    :validation-messages="{
      required: 'La CURP es obligatoria',
      length: 'La CURP debe tener exactamente 18 caracteres',
      curpValida: 'El formato de CURP no es válido'
    }"
    help="Clave Única de Registro de Población (18 caracteres)"
    @input="normalizarCURP"
    @blur="validarCURPconRENAPO"
    v-model="formData.curp"
  />

  <!-- Indicador de validación RENAPO -->
  <div v-if="curpValidandose" class="text-sm text-blue-600">
    <i class="pi pi-spin pi-spinner"></i> Validando con RENAPO...
  </div>
  <div v-if="curpValidada" class="text-sm text-green-600">
    <i class="pi pi-check"></i> CURP validada correctamente
  </div>
  <div v-if="curpErrorRENAPO" class="text-sm text-red-600">
    <i class="pi pi-times"></i> {{ curpErrorRENAPO }}
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { validarCURPFormato, extraerDatosCURP } from '@/helpers/curpValidator';
import TrabajadoresAPI from '@/api/TrabajadoresAPI';

const curpValidandose = ref(false);
const curpValidada = ref(false);
const curpErrorRENAPO = ref(null);

// Normalizar CURP (mayúsculas)
const normalizarCURP = (event) => {
  formData.curp = event.target.value.toUpperCase();
};

// Validar CURP con RENAPO (debounced)
const validarCURPconRENAPO = async () => {
  if (!formData.curp || formData.curp.length !== 18) return;

  curpValidandose.value = true;
  curpValidada.value = false;
  curpErrorRENAPO.value = null;

  try {
    const resultado = await TrabajadoresAPI.validarCURP(formData.curp);
    
    if (resultado.data.valida) {
      curpValidada.value = true;
      
      // Auto-completar datos desde CURP
      autoCompletarDesdeCURP(formData.curp);
    } else {
      curpErrorRENAPO.value = resultado.data.mensaje;
    }
  } catch (error) {
    console.error('Error al validar CURP:', error);
    curpErrorRENAPO.value = 'Error al validar CURP, intente nuevamente';
  } finally {
    curpValidandose.value = false;
  }
};

// Auto-completar campos desde CURP
const autoCompletarDesdeCURP = (curp) => {
  const datos = extraerDatosCURP(curp);
  
  // Establecer fecha de nacimiento
  if (datos.fechaNacimiento) {
    formData.fechaNacimiento = datos.fechaNacimiento;
  }
  
  // Establecer sexo
  if (datos.sexo) {
    formData.sexo = datos.sexo === 'H' ? 'Masculino' : 'Femenino';
  }
  
  // Establecer entidad de nacimiento
  if (datos.entidadNacimiento) {
    formData.entidadNacimiento = datos.entidadNacimiento;
  }
};
</script>
```

**1.1.2. Modificar Campos de Nombres**

```vue
<!-- MODIFICAR: Validación de nombres -->
<FormKit
  type="text"
  name="primerApellido"
  label="Primer Apellido *"
  placeholder="GARCÍA"
  validation="required|nombreValido"
  :validation-messages="{
    required: 'El primer apellido es obligatorio',
    nombreValido: 'Solo se permiten letras mayúsculas sin abreviaturas'
  }"
  @input="normalizarNombre"
  v-model="formData.primerApellido"
/>

<FormKit
  type="text"
  name="segundoApellido"
  label="Segundo Apellido *"
  validation="required|nombreValido"
  @input="normalizarNombre"
  v-model="formData.segundoApellido"
/>

<FormKit
  type="text"
  name="nombre"
  label="Nombre(s) *"
  placeholder="JUAN CARLOS"
  validation="required|nombreValido"
  @input="normalizarNombre"
  v-model="formData.nombre"
/>

<script setup>
const normalizarNombre = (event) => {
  event.target.value = event.target.value.toUpperCase();
};
</script>
```

**1.1.3. Agregar Selectores de Datos Geográficos**

```vue
<!-- NUEVO: Entidad de Nacimiento -->
<FormKit
  type="select"
  name="entidadNacimiento"
  label="Entidad de Nacimiento *"
  :options="entidadesFederativas"
  validation="required"
  help="Según catálogo INEGI"
  v-model="formData.entidadNacimiento"
/>

<!-- NUEVO: Entidad de Residencia -->
<FormKit
  type="select"
  name="entidadResidencia"
  label="Entidad de Residencia *"
  :options="entidadesFederativas"
  validation="required"
  @change="cargarMunicipios"
  v-model="formData.entidadResidencia"
/>

<!-- NUEVO: Municipio de Residencia -->
<FormKit
  type="select"
  name="municipioResidencia"
  label="Municipio de Residencia *"
  :options="municipiosDisponibles"
  :disabled="!formData.entidadResidencia"
  validation="required"
  @change="cargarLocalidades"
  v-model="formData.municipioResidencia"
/>

<!-- NUEVO: Localidad de Residencia -->
<FormKit
  type="select"
  name="localidadResidencia"
  label="Localidad de Residencia *"
  :options="localidadesDisponibles"
  :disabled="!formData.municipioResidencia"
  validation="required"
  v-model="formData.localidadResidencia"
/>

<!-- OPCIONAL: Domicilio completo -->
<FormKit
  type="textarea"
  name="domicilioResidencia"
  label="Domicilio Completo"
  placeholder="Calle, número, colonia"
  v-model="formData.domicilioResidencia"
/>

<script setup>
import { ref, onMounted } from 'vue';
import CatalogosAPI from '@/api/CatalogosAPI';

const entidadesFederativas = ref([]);
const municipiosDisponibles = ref([]);
const localidadesDisponibles = ref([]);

onMounted(async () => {
  // Cargar catálogo de entidades
  const response = await CatalogosAPI.getEntidades();
  entidadesFederativas.value = response.data.map(ent => ({
    label: ent.nombre,
    value: ent.clave
  }));
});

const cargarMunicipios = async () => {
  if (!formData.entidadResidencia) return;
  
  const response = await CatalogosAPI.getMunicipios(formData.entidadResidencia);
  municipiosDisponibles.value = response.data.map(mun => ({
    label: mun.nombre,
    value: mun.claveMunicipio
  }));
};

const cargarLocalidades = async () => {
  if (!formData.municipioResidencia) return;
  
  const response = await CatalogosAPI.getLocalidades(
    formData.entidadResidencia,
    formData.municipioResidencia
  );
  localidadesDisponibles.value = response.data.map(loc => ({
    label: loc.nombre,
    value: loc.claveLocalidad
  }));
};
</script>
```

---

## 2. MODIFICACIONES AL FORMULARIO DE NOTAS MÉDICAS

### 2.1. Selector de Diagnósticos CIE-10

**Archivo:** `frontend/src/components/steps/notaMedicaSteps/Step4Diagnostico.vue` (nuevo)

```vue
<template>
  <div class="diagnosticos-container">
    <h3>Diagnósticos (CIE-10)</h3>
    
    <!-- Buscador de diagnósticos -->
    <div class="mb-4">
      <label>Buscar diagnóstico</label>
      <input
        v-model="busquedaDiagnostico"
        type="text"
        placeholder="Escriba código CIE-10 o descripción..."
        @input="buscarCIE10Debounced"
        class="w-full p-2 border rounded"
      />
      
      <!-- Resultados de búsqueda -->
      <div v-if="resultadosCIE10.length > 0" class="resultados-busqueda">
        <div
          v-for="diagnostico in resultadosCIE10"
          :key="diagnostico.codigo"
          @click="agregarDiagnostico(diagnostico)"
          class="resultado-item cursor-pointer hover:bg-blue-50 p-2 border-b"
        >
          <strong>{{ diagnostico.codigo }}</strong> - {{ diagnostico.descripcion }}
        </div>
      </div>
    </div>

    <!-- Diagnósticos seleccionados -->
    <div class="diagnosticos-seleccionados">
      <h4>Diagnósticos agregados:</h4>
      
      <div v-if="formData.diagnosticos.length === 0" class="text-gray-500">
        No se han agregado diagnósticos
      </div>
      
      <div
        v-for="(diag, index) in formData.diagnosticos"
        :key="index"
        class="diagnostico-item border p-3 mb-2 rounded"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="font-semibold">{{ diag.codigoCIE10 }}</div>
            <div class="text-sm">{{ diag.descripcion }}</div>
            
            <!-- Selector tipo de diagnóstico -->
            <select
              v-model="diag.tipo"
              class="mt-2 p-1 border rounded"
            >
              <option value="PRINCIPAL">Principal</option>
              <option value="SECUNDARIO">Secundario</option>
            </select>
          </div>
          
          <button
            @click="removerDiagnostico(index)"
            class="text-red-600 hover:text-red-800"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Validación: Al menos un diagnóstico -->
    <div v-if="diagnosticosValidacion" class="text-red-600 text-sm mt-2">
      Debe agregar al menos un diagnóstico
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useFormDataStore } from '@/stores/formDataStore';
import CatalogosAPI from '@/api/CatalogosAPI';
import { debounce } from 'lodash';

const formData = useFormDataStore();
const busquedaDiagnostico = ref('');
const resultadosCIE10 = ref([]);
const diagnosticosValidacion = ref(false);

// Inicializar array de diagnósticos si no existe
if (!formData.diagnosticos) {
  formData.diagnosticos = [];
}

// Búsqueda con debounce
const buscarCIE10Debounced = debounce(async () => {
  if (busquedaDiagnostico.value.length < 2) {
    resultadosCIE10.value = [];
    return;
  }

  try {
    const response = await CatalogosAPI.buscarCIE10(busquedaDiagnostico.value);
    resultadosCIE10.value = response.data;
  } catch (error) {
    console.error('Error al buscar diagnósticos CIE-10:', error);
  }
}, 300);

// Agregar diagnóstico a la lista
const agregarDiagnostico = (diagnostico) => {
  // Verificar que no esté duplicado
  const existe = formData.diagnosticos.some(d => d.codigoCIE10 === diagnostico.codigo);
  
  if (!existe) {
    formData.diagnosticos.push({
      codigoCIE10: diagnostico.codigo,
      descripcion: diagnostico.descripcion,
      tipo: formData.diagnosticos.length === 0 ? 'PRINCIPAL' : 'SECUNDARIO'
    });
  }

  // Limpiar búsqueda
  busquedaDiagnostico.value = '';
  resultadosCIE10.value = [];
  diagnosticosValidacion.value = false;
};

// Remover diagnóstico
const removerDiagnostico = (index) => {
  formData.diagnosticos.splice(index, 1);
};

// Validar antes de continuar
const validarDiagnosticos = () => {
  if (formData.diagnosticos.length === 0) {
    diagnosticosValidacion.value = true;
    return false;
  }
  
  // Verificar que haya al menos un diagnóstico principal
  const tienePrincipal = formData.diagnosticos.some(d => d.tipo === 'PRINCIPAL');
  if (!tienePrincipal && formData.diagnosticos.length > 0) {
    formData.diagnosticos[0].tipo = 'PRINCIPAL';
  }

  return true;
};

defineExpose({
  validarDiagnosticos
});
</script>

<style scoped>
.resultados-busqueda {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 8px;
}

.resultado-item {
  padding: 8px;
}
</style>
```

---

## 3. MODIFICACIONES EN VALIDADORES PERSONALIZADOS

### 3.1. Validador de CURP para FormKit

**Archivo nuevo:** `frontend/src/helpers/curpValidator.ts`

```typescript
export const validarCURPFormato = (curp: string): boolean => {
  if (!curp || curp.length !== 18) return false;
  
  const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
  return regex.test(curp);
};

export const validarDigitoVerificador = (curp: string): boolean => {
  // Implementar algoritmo de dígito verificador
  const caracteres = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  let suma = 0;

  for (let i = 0; i < 17; i++) {
    suma += caracteres.indexOf(curp[i]) * (18 - i);
  }

  const residuo = suma % 10;
  const digitoCalculado = residuo === 0 ? '0' : String(10 - residuo);

  return digitoCalculado === curp[17];
};

export const extraerDatosCURP = (curp: string) => {
  if (!validarCURPFormato(curp)) return null;

  // Extraer fecha de nacimiento
  const año = parseInt(curp.substring(4, 6));
  const mes = parseInt(curp.substring(6, 8)) - 1;
  const dia = parseInt(curp.substring(8, 10));
  const añoCompleto = año < 50 ? 2000 + año : 1900 + año;
  const fechaNacimiento = new Date(añoCompleto, mes, dia);

  // Extraer sexo
  const sexo = curp[10];  // H o M

  // Extraer entidad de nacimiento
  const codigoEntidad = curp.substring(11, 13);
  const mapaEntidades: Record<string, string> = {
    'AS': '01', 'BC': '02', 'BS': '03', 'CC': '04', 'CS': '07',
    'CH': '06', 'CL': '08', 'CM': '05', 'DF': '09', 'DG': '10',
    // ... resto del mapeo
  };

  return {
    fechaNacimiento: fechaNacimiento.toISOString().split('T')[0],
    sexo,
    entidadNacimiento: mapaEntidades[codigoEntidad] || null
  };
};
```

### 3.2. Validador de Nombres

**Archivo nuevo:** `frontend/src/helpers/nombreValidator.ts`

```typescript
export const validarNombre = (nombre: string): boolean => {
  if (!nombre || nombre.trim().length === 0) return false;
  
  // Solo letras mayúsculas, Ñ y espacios
  const regex = /^[A-ZÑÁÉÍÓÚÜ\s]+$/;
  return regex.test(nombre);
};

export const tieneAbreviaturas = (texto: string): boolean => {
  const abreviaturas = ['DR', 'LIC', 'ING', 'ARQ', 'C.P.', 'MVZ'];
  const textoMayusculas = texto.toUpperCase();
  return abreviaturas.some(abrev => textoMayusculas.includes(abrev));
};

export const normalizarNombre = (nombre: string): string => {
  return nombre
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');  // Múltiples espacios → uno solo
};
```

### 3.3. Registrar Validadores en FormKit

**Archivo:** `frontend/formkit.config.js`

```javascript
import { es } from '@formkit/i18n';
import { validarCURPFormato, validarDigitoVerificador } from './src/helpers/curpValidator';
import { validarNombre, tieneAbreviaturas } from './src/helpers/nombreValidator';

export default {
  locales: { es },
  locale: 'es',
  rules: {
    // Validación personalizada de CURP
    curpValida: (node) => {
      const value = node.value;
      if (!value) return true;  // El required se maneja aparte
      
      if (!validarCURPFormato(value)) {
        return 'El formato de CURP es inválido';
      }
      
      if (!validarDigitoVerificador(value)) {
        return 'El dígito verificador de la CURP es incorrecto';
      }
      
      return true;
    },
    
    // Validación personalizada de nombres
    nombreValido: (node) => {
      const value = node.value;
      if (!value) return true;
      
      if (!validarNombre(value)) {
        return 'Solo se permiten letras mayúsculas (A-Z, Ñ)';
      }
      
      if (tieneAbreviaturas(value)) {
        return 'No se permiten abreviaturas (DR, LIC, ING, etc.)';
      }
      
      return true;
    }
  }
};
```

---

## 4. NUEVAS APIS EN EL FRONTEND

### 4.1. API de Catálogos

**Archivo nuevo:** `frontend/src/api/CatalogosAPI.ts`

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default {
  // Entidades Federativas
  async getEntidades() {
    return await axios.get(`${API_URL}/catalogos/entidades`);
  },

  // Municipios por entidad
  async getMunicipios(entidad: string) {
    return await axios.get(`${API_URL}/catalogos/municipios/${entidad}`);
  },

  // Localidades por municipio
  async getLocalidades(entidad: string, municipio: string) {
    return await axios.get(`${API_URL}/catalogos/localidades/${entidad}/${municipio}`);
  },

  // Buscar en CIE-10
  async buscarCIE10(termino: string, limite: number = 20) {
    return await axios.get(`${API_URL}/catalogos/cie10/buscar`, {
      params: { q: termino, limit: limite }
    });
  },

  // Buscar CLUES
  async buscarCLUES(termino: string) {
    return await axios.get(`${API_URL}/catalogos/clues/buscar`, {
      params: { q: termino }
    });
  }
};
```

### 4.2. API de Validación de CURP

**Modificar:** `frontend/src/api/TrabajadoresAPI.ts`

```typescript
// Agregar método:

async validarCURP(curp: string) {
  return await axios.post(`${API_URL}/trabajadores/validar-curp`, { curp });
}
```

---

## 5. COMPONENTE DE FINALIZACIÓN DE DOCUMENTOS

### 5.1. Modal de Confirmación de Finalización

**Archivo nuevo:** `frontend/src/components/ModalFinalizarDocumento.vue`

```vue
<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-container">
      <h2>Finalizar Documento</h2>
      
      <div class="warning-box">
        <i class="pi pi-exclamation-triangle"></i>
        <p>
          <strong>Atención:</strong> Una vez finalizado, este documento no podrá ser modificado.
          Esta acción garantiza la integridad del registro médico según la NOM-024-SSA3-2012.
        </p>
      </div>

      <!-- Validaciones pendientes -->
      <div v-if="erroresValidacion.length > 0" class="errores-validacion">
        <h3>Corrija los siguientes errores antes de finalizar:</h3>
        <ul>
          <li v-for="(error, index) in erroresValidacion" :key="index">
            {{ error }}
          </li>
        </ul>
      </div>

      <!-- Resumen del documento -->
      <div v-else class="resumen-documento">
        <h3>Resumen del Documento:</h3>
        <p><strong>Tipo:</strong> {{ tipoDocumento }}</p>
        <p><strong>Fecha:</strong> {{ fechaDocumento }}</p>
        <p><strong>Trabajador:</strong> {{ nombreTrabajador }}</p>
        <p v-if="diagnosticos"><strong>Diagnósticos:</strong> {{ diagnosticos }}</p>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-4 mt-6">
        <button @click="cerrar" class="btn-secondary">
          Cancelar
        </button>
        <button
          @click="confirmarFinalizacion"
          :disabled="erroresValidacion.length > 0"
          class="btn-primary"
        >
          <i class="pi pi-lock"></i> Finalizar Documento
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ExpedientesAPI from '@/api/ExpedientesAPI';

const props = defineProps({
  mostrar: Boolean,
  tipoDocumento: String,
  idDocumento: String,
  documento: Object
});

const emit = defineEmits(['cerrar', 'finalizado']);

const erroresValidacion = computed(() => {
  const errores = [];
  
  // Validar según tipo de documento
  if (props.tipoDocumento === 'NotaMedica') {
    if (!props.documento?.diagnosticos || props.documento.diagnosticos.length === 0) {
      errores.push('Debe agregar al menos un diagnóstico CIE-10');
    }
    if (!props.documento?.motivoConsulta) {
      errores.push('El motivo de consulta es obligatorio');
    }
  }
  
  // Validar que tenga PDF generado
  if (!props.documento?.rutaPDF) {
    errores.push('El documento debe tener un PDF generado');
  }

  return errores;
});

const confirmarFinalizacion = async () => {
  try {
    await ExpedientesAPI.finalizarDocumento(props.tipoDocumento, props.idDocumento);
    
    emit('finalizado');
    emit('cerrar');
    
    toast.success('Documento finalizado correctamente. Ahora es inmutable.');
  } catch (error) {
    console.error('Error al finalizar documento:', error);
    toast.error('Error al finalizar el documento');
  }
};

const cerrar = () => {
  emit('cerrar');
};
</script>

<style scoped>
.warning-box {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  gap: 12px;
  align-items: start;
}

.errores-validacion {
  background-color: #f8d7da;
  border: 1px solid #dc3545;
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
}

.errores-validacion ul {
  margin-left: 20px;
  margin-top: 8px;
}
</style>
```

---

## 6. INDICADORES DE ESTADO DE DOCUMENTO

### 6.1. Badge de Estado

**Archivo nuevo:** `frontend/src/components/BadgeEstadoDocumento.vue`

```vue
<template>
  <span :class="['badge-estado', claseEstado]">
    <i :class="iconoEstado"></i> {{ textoEstado }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  estado: {
    type: String,
    required: true,
    validator: (value) => ['BORRADOR', 'FINALIZADO', 'CANCELADO'].includes(value)
  }
});

const claseEstado = computed(() => {
  switch (props.estado) {
    case 'BORRADOR': return 'estado-borrador';
    case 'FINALIZADO': return 'estado-finalizado';
    case 'CANCELADO': return 'estado-cancelado';
    default: return '';
  }
});

const iconoEstado = computed(() => {
  switch (props.estado) {
    case 'BORRADOR': return 'pi pi-pencil';
    case 'FINALIZADO': return 'pi pi-lock';
    case 'CANCELADO': return 'pi pi-ban';
    default: return '';
  }
});

const textoEstado = computed(() => {
  switch (props.estado) {
    case 'BORRADOR': return 'Borrador';
    case 'FINALIZADO': return 'Finalizado';
    case 'CANCELADO': return 'Cancelado';
    default: return props.estado;
  }
});
</script>

<style scoped>
.badge-estado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.estado-borrador {
  background-color: #fff3cd;
  color: #856404;
}

.estado-finalizado {
  background-color: #d4edda;
  color: #155724;
}

.estado-cancelado {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
```

---

## 7. RESUMEN DE CAMBIOS EN EL FRONTEND

| Componente | Cambios | Prioridad |
|------------|---------|-----------|
| `ModalTrabajadores.vue` | Agregar campo CURP, selectores geográficos | 🔴 CRÍTICA |
| `Step4Diagnostico.vue` | Nuevo componente buscador CIE-10 | 🔴 CRÍTICA |
| `formkit.config.js` | Agregar validadores personalizados | 🔴 CRÍTICA |
| `CatalogosAPI.ts` | Nueva API de catálogos | 🔴 CRÍTICA |
| `curpValidator.ts` | Nuevo helper de validación CURP | 🔴 CRÍTICA |
| `nombreValidator.ts` | Nuevo helper de validación nombres | 🟡 ALTA |
| `ModalFinalizarDocumento.vue` | Nuevo modal de finalización | 🟡 ALTA |
| `BadgeEstadoDocumento.vue` | Nuevo componente de estado | 🟢 MEDIA |

---

## 8. CRONOGRAMA DE IMPLEMENTACIÓN

| Semana | Actividad | Equipo |
|--------|-----------|--------|
| 1 | Crear helpers de validación (CURP, nombres) | Frontend |
| 1 | Configurar validadores en FormKit | Frontend |
| 2 | Crear API de catálogos | Frontend |
| 2 | Modificar formulario de trabajadores | Frontend |
| 3 | Crear componente de búsqueda CIE-10 | Frontend |
| 3 | Integrar selectores geográficos | Frontend |
| 4 | Crear modal de finalización | Frontend |
| 4 | Agregar badges de estado | Frontend |
| 5 | Pruebas de integración | QA |
| 5 | Ajustes finales y documentación | Frontend |

---

## 9. CONSIDERACIONES DE UX

### 9.1. Auto-completado desde CURP
- Cuando el usuario ingresa una CURP válida, auto-completar:
  - Fecha de nacimiento
  - Sexo
  - Entidad de nacimiento

### 9.2. Búsqueda Inteligente CIE-10
- Búsqueda por código o descripción
- Debouncing para evitar múltiples requests
- Mostrar categoría del diagnóstico
- Resaltar resultados coincidentes

### 9.3. Indicadores Visuales
- CURP validada: ✅ verde
- CURP inválida: ❌ rojo
- Campos obligatorios: asterisco rojo
- Documento finalizado: 🔒 icono de candado

### 9.4. Prevención de Errores
- Normalización automática (mayúsculas)
- Validación en tiempo real
- Mensajes de error claros
- Confirmación antes de finalizar documentos

---

## 10. EJEMPLO DE FLUJO COMPLETO

**Escenario: Registrar Nuevo Trabajador**

1. Usuario abre modal "Nuevo Trabajador"
2. Usuario ingresa CURP → validación automática
3. Sistema auto-completa fecha nacimiento, sexo, entidad nacimiento
4. Usuario ingresa nombres y apellidos (normalización automática a mayúsculas)
5. Usuario selecciona entidad de residencia → carga municipios
6. Usuario selecciona municipio → carga localidades
7. Usuario selecciona localidad
8. Usuario completa demás campos
9. Usuario guarda → validaciones completas
10. Sistema guarda trabajador con todos los datos NOM-024

---

**FIN DEL PLAN DE IMPLEMENTACIÓN**

**Siguiente Paso:** Iniciar implementación comenzando por la [PARTE 1: Auditoría de Datos](PLAN_NOM024_FASE1_PARTE1_AUDITORIA.md)

