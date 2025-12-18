# Catalog Integration Service

Servicio para cargar, cachear y validar catálogos obligatorios de NOM-024-SSA3-2012.

## Uso

### Inyectar el servicio

```typescript
import { CatalogsService } from '../catalogs/catalogs.service';

constructor(private readonly catalogsService: CatalogsService) {}
```

### Validar códigos CIE-10

```typescript
const isValid = await this.catalogsService.validateCIE10('A00', 'M', 25);
```

### Validar CLUES

```typescript
const isValid = await this.catalogsService.validateCLUES('ASCIJ000012');
```

### Validar códigos INEGI

```typescript
// Validar estado
const isValidEstado = await this.catalogsService.validateINEGI('estado', '01');

// Validar municipio (con código de estado padre)
const isValidMunicipio = await this.catalogsService.validateINEGI('municipio', '001', '01');

// Validar localidad (con código de municipio padre)
const isValidLocalidad = await this.catalogsService.validateINEGI('localidad', '0001', '01-001');
```

### Buscar entradas

```typescript
const results = await this.catalogsService.searchCatalog(CatalogType.CIE10, 'cólera', 10);
```

### Obtener entrada por código

```typescript
const entry = await this.catalogsService.getCatalogEntry(CatalogType.CIE10, 'A00');
```

## Catálogos Soportados

- CIE-10 (diagnosticos.csv)
- CLUES (establecimientos_salud.csv)
- Entidades Federativas (enitades_federativas.csv)
- Municipios (municipios.csv)
- Localidades (localidades.csv)
- Códigos Postales (codigos_postales.csv)
- Nacionalidades (cat_nacionalidades.csv)
- Religiones (cat_religiones.csv)
- Lenguas Indígenas (lenguas_indigenas.csv)
- Formación Académica (formacion_academica.csv)

