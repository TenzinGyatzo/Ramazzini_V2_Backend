# PARTE 3: INTEGRACIÓN DE CATÁLOGOS
## NOM-024-SSA3-2012 - Fase 1: Estandarización de Datos

---

## OBJETIVO

Definir la estrategia para cargar, mantener actualizados y utilizar los catálogos obligatorios requeridos por la NOM-024:
- CLUES (Clave Única de Establecimientos de Salud)
- CIE-10 (Clasificación Internacional de Enfermedades)
- INEGI (Catálogos Geográficos)
- Otros catálogos complementarios

---

## 1. CATÁLOGO DE ENTIDADES, MUNICIPIOS Y LOCALIDADES (INEGI)

### 1.1. Fuentes Oficiales

**Fuente:** Instituto Nacional de Estadística y Geografía (INEGI)

**URLs de Descarga:**
- **Catálogo Único de Claves de Áreas Geoestadísticas Estatales, Municipales y Localidades**
  - https://www.inegi.org.mx/app/ageeml/
- **Marco Geoestadístico**
  - https://www.inegi.org.mx/temas/mg/

**Formato:** Excel (.xlsx) y archivos de texto (.txt)

### 1.2. Estructura de Datos

#### Entidades Federativas (32 entidades)

```json
{
  "clave": "01",
  "nombre": "AGUASCALIENTES",
  "nombreAbreviado": "AGS",
  "activo": true,
  "fechaActualizacion": "2025-01-01"
}
```

**Datos a Cargar:**
```
01 - AGUASCALIENTES
02 - BAJA CALIFORNIA
03 - BAJA CALIFORNIA SUR
...
32 - ZACATECAS
```

#### Municipios (~2,469 municipios)

```json
{
  "claveEntidad": "01",
  "claveMunicipio": "001",
  "nombre": "AGUASCALIENTES",
  "activo": true
}
```

#### Localidades (~190,000 localidades)

```json
{
  "claveEntidad": "01",
  "claveMunicipio": "001",
  "claveLocalidad": "0001",
  "nombre": "AGUASCALIENTES",
  "activo": true
}
```

### 1.3. Script de Importación

**Archivo nuevo:** `backend/src/modules/catalogos/scripts/importar-inegi.script.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { CatalogoEntidad } from '../schemas/catalogo-entidades.schema';
import { CatalogoMunicipio } from '../schemas/catalogo-municipios.schema';
import { CatalogoLocalidad } from '../schemas/catalogo-localidades.schema';

@Injectable()
export class ImportarINEGIScript {
  constructor(
    @InjectModel(CatalogoEntidad.name) private entidadModel: Model<CatalogoEntidad>,
    @InjectModel(CatalogoMunicipio.name) private municipioModel: Model<CatalogoMunicipio>,
    @InjectModel(CatalogoLocalidad.name) private localidadModel: Model<CatalogoLocalidad>,
  ) {}

  async importarEntidades(rutaArchivo: string) {
    console.log('Importando catálogo de entidades...');
    
    // Leer archivo Excel descargado de INEGI
    const workbook = XLSX.readFile(rutaArchivo);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Limpiar colección
    await this.entidadModel.deleteMany({});

    // Insertar entidades
    const entidades = data.map(row => ({
      clave: String(row['CVE_ENT']).padStart(2, '0'),
      nombre: String(row['NOM_ENT']).toUpperCase(),
      nombreAbreviado: String(row['NOM_ABR']).toUpperCase(),
      activo: true,
      fechaActualizacion: new Date()
    }));

    await this.entidadModel.insertMany(entidades);
    console.log(`✅ ${entidades.length} entidades importadas`);
  }

  async importarMunicipios(rutaArchivo: string) {
    console.log('Importando catálogo de municipios...');
    
    const workbook = XLSX.readFile(rutaArchivo);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    await this.municipioModel.deleteMany({});

    const municipios = data.map(row => ({
      claveEntidad: String(row['CVE_ENT']).padStart(2, '0'),
      claveMunicipio: String(row['CVE_MUN']).padStart(3, '0'),
      nombre: String(row['NOM_MUN']).toUpperCase(),
      activo: true,
      fechaActualizacion: new Date()
    }));

    await this.municipioModel.insertMany(municipios);
    console.log(`✅ ${municipios.length} municipios importados`);
  }

  async importarLocalidades(rutaArchivo: string) {
    console.log('Importando catálogo de localidades (puede tardar varios minutos)...');
    
    const workbook = XLSX.readFile(rutaArchivo);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    await this.localidadModel.deleteMany({});

    // Procesar en lotes de 1000 para evitar sobrecarga
    const batchSize = 1000;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize).map(row => ({
        claveEntidad: String(row['CVE_ENT']).padStart(2, '0'),
        claveMunicipio: String(row['CVE_MUN']).padStart(3, '0'),
        claveLocalidad: String(row['CVE_LOC']).padStart(4, '0'),
        nombre: String(row['NOM_LOC']).toUpperCase(),
        activo: true
      }));

      await this.localidadModel.insertMany(batch);
      console.log(`Procesados ${Math.min(i + batchSize, data.length)} / ${data.length}`);
    }

    console.log(`✅ ${data.length} localidades importadas`);
  }
}
```

### 1.4. Actualización Periódica

**Estrategia:**
- Verificar actualizaciones en INEGI cada 6 meses
- Implementar API endpoint para re-importar catálogos
- Mantener versionado de catálogos

```typescript
// backend/src/modules/catalogos/catalogos.controller.ts

@Post('actualizar-inegi')
@UseGuards(AdminGuard)  // Solo administradores
async actualizarINEGI() {
  // Descargar archivos actualizados de INEGI
  // Ejecutar scripts de importación
  // Registrar fecha de actualización
}
```

---

## 2. CATÁLOGO CIE-10

### 2.1. Fuente Oficial

**Fuente:** Organización Mundial de la Salud (OMS) / Secretaría de Salud México

**URLs:**
- **CIE-10 Español (OPS/OMS):**  
  https://www.paho.org/es/temas/clasificacion-internacional-enfermedades-cie
- **Base de datos CIE-10:**  
  https://icd.who.int/browse10/2019/en

**Formato:** CSV, JSON, XML (dependiendo de la fuente)

### 2.2. Estructura de Datos

```json
{
  "codigo": "A00",
  "descripcion": "CÓLERA",
  "categoria": "I. CIERTAS ENFERMEDADES INFECCIOSAS Y PARASITARIAS (A00-B99)",
  "subcategoria": "ENFERMEDADES INFECCIOSAS INTESTINALES (A00-A09)",
  "tipo": "ENFERMEDAD",
  "activo": true,
  "fechaActualizacion": "2025-01-01",
  "notasUso": "Incluye: cólera debido a Vibrio cholerae 01, biotipo cholerae"
}
```

**Ejemplos de Códigos:**
```
A00    - Cólera
B15    - Hepatitis aguda tipo A
C50.9  - Tumor maligno de mama, parte no especificada
I10    - Hipertensión esencial (primaria)
J44.9  - Enfermedad pulmonar obstructiva crónica, no especificada
S72.0  - Fractura del cuello del fémur
T56.0  - Efecto tóxico del plomo y sus compuestos
Z00.0  - Examen médico general
```

### 2.3. Script de Importación

**Archivo nuevo:** `backend/src/modules/catalogos/scripts/importar-cie10.script.ts`

```typescript
@Injectable()
export class ImportarCIE10Script {
  constructor(
    @InjectModel(CatalogoCIE10.name) private cie10Model: Model<CatalogoCIE10>,
  ) {}

  async importarDesdeCSV(rutaArchivo: string) {
    console.log('Importando catálogo CIE-10...');
    
    const fs = require('fs');
    const csv = require('csv-parser');
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(rutaArchivo)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          await this.cie10Model.deleteMany({});

          const diagnosticos = results.map(row => ({
            codigo: String(row['CODIGO']).trim().toUpperCase(),
            descripcion: String(row['DESCRIPCION']).trim(),
            categoria: String(row['CATEGORIA']).trim(),
            subcategoria: String(row['SUBCATEGORIA']).trim(),
            tipo: this.determinarTipo(row['CODIGO']),
            activo: true,
            fechaActualizacion: new Date(),
            notasUso: row['NOTAS'] || ''
          }));

          // Insertar en lotes
          const batchSize = 500;
          for (let i = 0; i < diagnosticos.length; i += batchSize) {
            const batch = diagnosticos.slice(i, i + batchSize);
            await this.cie10Model.insertMany(batch);
            console.log(`Procesados ${Math.min(i + batchSize, diagnosticos.length)} / ${diagnosticos.length}`);
          }

          console.log(`✅ ${diagnosticos.length} códigos CIE-10 importados`);
          resolve(diagnosticos.length);
        })
        .on('error', reject);
    });
  }

  private determinarTipo(codigo: string): string {
    // S00-T98: Traumatismos y envenenamientos
    if (codigo.match(/^[ST]\d/)) return 'TRAUMATISMO';
    
    // V01-Y98: Causas externas
    if (codigo.match(/^[VWX-Y]\d/)) return 'CAUSA_EXTERNA';
    
    // Resto: Enfermedades
    return 'ENFERMEDAD';
  }

  // Método para búsqueda de diagnósticos
  async buscarDiagnostico(termino: string, limite: number = 20) {
    return await this.cie10Model
      .find({
        $or: [
          { codigo: { $regex: termino, $options: 'i' } },
          { descripcion: { $regex: termino, $options: 'i' } }
        ],
        activo: true
      })
      .limit(limite)
      .select('codigo descripcion categoria')
      .exec();
  }
}
```

### 2.4. API de Búsqueda

```typescript
// backend/src/modules/catalogos/catalogos.controller.ts

@Get('cie10/buscar')
async buscarCIE10(
  @Query('q') termino: string,
  @Query('limit') limite: number = 20
) {
  if (!termino || termino.length < 2) {
    throw new BadRequestException('El término de búsqueda debe tener al menos 2 caracteres');
  }

  return await this.cie10Script.buscarDiagnostico(termino, limite);
}

// Ejemplo de uso:
// GET /catalogos/cie10/buscar?q=diabetes
// GET /catalogos/cie10/buscar?q=E11
```

---

## 3. CATÁLOGO CLUES

### 3.1. Fuente Oficial

**Fuente:** Secretaría de Salud - Dirección General de Información en Salud (DGIS)

**URL:**
- http://www.dgis.salud.gob.mx/contenidos/basesdedatos/bdc_clues_gobmx.html

**Descarga:**
- Archivo nacional de CLUES (actualización mensual)
- Formato: CSV/Excel

### 3.2. Estructura de Datos

```json
{
  "clues": "CSSSA001835",
  "nombreEstablecimiento": "HOSPITAL GENERAL DR. MIGUEL SILVA",
  "claveEntidad": "16",
  "nombreEntidad": "MICHOACÁN DE OCAMPO",
  "claveMunicipio": "053",
  "nombreMunicipio": "MORELIA",
  "claveLocalidad": "0001",
  "nombreLocalidad": "MORELIA",
  "domicilio": "CALLE ISAURO VENZOR NO. 100",
  "tipoInstitucion": "PUBLICA",
  "nivelAtencion": "SEGUNDO NIVEL",
  "activo": true
}
```

### 3.3. Script de Importación

```typescript
@Injectable()
export class ImportarCLUESScript {
  constructor(
    @InjectModel(CatalogoCLUES.name) private cluesModel: Model<CatalogoCLUES>,
  ) {}

  async importarDesdeExcel(rutaArchivo: string) {
    console.log('Importando catálogo CLUES...');
    
    const workbook = XLSX.readFile(rutaArchivo);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    await this.cluesModel.deleteMany({});

    const establecimientos = data.map(row => ({
      clues: String(row['CLUES']).trim().toUpperCase(),
      nombreEstablecimiento: String(row['NOMBRE_ESTABLECIMIENTO']).trim(),
      claveEntidad: String(row['ENTIDAD']).padStart(2, '0'),
      nombreEntidad: String(row['NOMBRE_ENTIDAD']).trim(),
      claveMunicipio: String(row['MUNICIPIO']).padStart(3, '0'),
      nombreMunicipio: String(row['NOMBRE_MUNICIPIO']).trim(),
      claveLocalidad: row['LOCALIDAD'] ? String(row['LOCALIDAD']).padStart(4, '0') : null,
      nombreLocalidad: row['NOMBRE_LOCALIDAD'] || null,
      domicilio: row['DOMICILIO'] || null,
      tipoInstitucion: this.determinarTipo(row['TIPO_INSTITUCION']),
      nivelAtencion: row['NIVEL_ATENCION'] || null,
      activo: true
    }));

    const batchSize = 500;
    for (let i = 0; i < establecimientos.length; i += batchSize) {
      const batch = establecimientos.slice(i, i + batchSize);
      await this.cluesModel.insertMany(batch);
      console.log(`Procesados ${Math.min(i + batchSize, establecimientos.length)} / ${establecimientos.length}`);
    }

    console.log(`✅ ${establecimientos.length} establecimientos CLUES importados`);
  }

  async buscarCLUES(termino: string) {
    return await this.cluesModel
      .find({
        $or: [
          { clues: { $regex: termino, $options: 'i' } },
          { nombreEstablecimiento: { $regex: termino, $options: 'i' } }
        ],
        activo: true
      })
      .limit(20)
      .select('clues nombreEstablecimiento nombreEntidad nombreMunicipio')
      .exec();
  }
}
```

---

## 4. CATÁLOGOS COMPLEMENTARIOS

### 4.1. Catálogo de Medicamentos (Opcional en Fase 1)

**Fuente:** Consejo de Salubridad General

**Recomendación:** Implementar en fases posteriores o usar texto libre con validación básica.

### 4.2. Catálogo de Material de Curación (Opcional)

Similar a medicamentos, puede implementarse gradualmente.

---

## 5. MÓDULO DE CATÁLOGOS (ESTRUCTURA)

### 5.1. Estructura de Archivos

```
backend/src/modules/catalogos/
├── catalogos.module.ts
├── catalogos.controller.ts
├── catalogos.service.ts
├── schemas/
│   ├── catalogo-entidades.schema.ts
│   ├── catalogo-municipios.schema.ts
│   ├── catalogo-localidades.schema.ts
│   ├── catalogo-cie10.schema.ts
│   └── catalogo-clues.schema.ts
├── scripts/
│   ├── importar-inegi.script.ts
│   ├── importar-cie10.script.ts
│   └── importar-clues.script.ts
└── dto/
    └── buscar-catalogo.dto.ts
```

### 5.2. Module Definition

```typescript
// catalogos.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { CatalogoEntidad, CatalogoEntidadSchema } from './schemas/catalogo-entidades.schema';
import { CatalogoMunicipio, CatalogoMunicipioSchema } from './schemas/catalogo-municipios.schema';
import { CatalogoLocalidad, CatalogoLocalidadSchema } from './schemas/catalogo-localidades.schema';
import { CatalogoCIE10, CatalogoCIE10Schema } from './schemas/catalogo-cie10.schema';
import { CatalogoCLUES, CatalogoCLUESSchema } from './schemas/catalogo-clues.schema';
import { ImportarINEGIScript } from './scripts/importar-inegi.script';
import { ImportarCIE10Script } from './scripts/importar-cie10.script';
import { ImportarCLUESScript } from './scripts/importar-clues.script';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogoEntidad.name, schema: CatalogoEntidadSchema },
      { name: CatalogoMunicipio.name, schema: CatalogoMunicipioSchema },
      { name: CatalogoLocalidad.name, schema: CatalogoLocalidadSchema },
      { name: CatalogoCIE10.name, schema: CatalogoCIE10Schema },
      { name: CatalogoCLUES.name, schema: CatalogoCLUESSchema },
    ])
  ],
  controllers: [CatalogosController],
  providers: [
    CatalogosService,
    ImportarINEGIScript,
    ImportarCIE10Script,
    ImportarCLUESScript
  ],
  exports: [CatalogosService]  // Para usar en otros módulos
})
export class CatalogosModule {}
```

---

## 6. ENDPOINTS DE CONSULTA

```typescript
// catalogos.controller.ts

@Controller('catalogos')
export class CatalogosController {
  
  // ENTIDADES
  @Get('entidades')
  async getEntidades() {
    return await this.catalogosService.getEntidades();
  }

  // MUNICIPIOS POR ENTIDAD
  @Get('municipios/:entidad')
  async getMunicipios(@Param('entidad') entidad: string) {
    return await this.catalogosService.getMunicipios(entidad);
  }

  // LOCALIDADES POR MUNICIPIO
  @Get('localidades/:entidad/:municipio')
  async getLocalidades(
    @Param('entidad') entidad: string,
    @Param('municipio') municipio: string
  ) {
    return await this.catalogosService.getLocalidades(entidad, municipio);
  }

  // BÚSQUEDA CIE-10
  @Get('cie10/buscar')
  async buscarCIE10(@Query('q') termino: string) {
    return await this.catalogosService.buscarCIE10(termino);
  }

  // BÚSQUEDA CLUES
  @Get('clues/buscar')
  async buscarCLUES(@Query('q') termino: string) {
    return await this.catalogosService.buscarCLUES(termino);
  }
}
```

---

## 7. CRONOGRAMA DE IMPLEMENTACIÓN

| Semana | Actividad | Responsable |
|--------|-----------|-------------|
| 1 | Descargar archivos oficiales de INEGI, CIE-10, CLUES | Equipo Backend |
| 1 | Crear esquemas de catálogos | Equipo Backend |
| 2 | Implementar scripts de importación INEGI | Equipo Backend |
| 2 | Probar importación de entidades/municipios | Equipo Backend |
| 3 | Implementar script de importación CIE-10 | Equipo Backend |
| 3 | Implementar script de importación CLUES | Equipo Backend |
| 4 | Crear APIs de consulta de catálogos | Equipo Backend |
| 4 | Implementar búsqueda full-text en CIE-10 | Equipo Backend |
| 5 | Testing de APIs | Equipo QA |
| 5 | Documentar uso de catálogos | Equipo Técnico |

---

## 8. CONSIDERACIONES DE RENDIMIENTO

### 8.1. Indexación

```typescript
// Índices críticos para búsquedas rápidas:

// CIE-10
CatalogoCIE10Schema.index({ codigo: 1 });
CatalogoCIE10Schema.index({ descripcion: 'text' });  // Full-text search

// CLUES
CatalogoCLUESSchema.index({ clues: 1 });
CatalogoCLUESSchema.index({ nombreEstablecimiento: 'text' });

// Localidades (índice compuesto)
CatalogoLocalidadSchema.index({ claveEntidad: 1, claveMunicipio: 1 });
```

### 8.2. Caché

```typescript
// Implementar caché para consultas frecuentes:
// - Entidades (32 registros) → Caché permanente en memoria
// - Municipios por entidad → Caché 24 horas
// - Búsquedas CIE-10 populares → Caché 1 hora
```

---

**Siguiente Paso:** Revisar [PARTE 4: Lógica de Validación y Estructuración](PLAN_NOM024_FASE1_PARTE4_VALIDACION.md)

