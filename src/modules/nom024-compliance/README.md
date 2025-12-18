# NOM-024 Compliance Framework

Framework para cumplimiento condicional de NOM-024-SSA3-2012 basado en el país del proveedor.

## Uso

### Inyectar la utilidad

```typescript
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';

constructor(private readonly nom024Util: NOM024ComplianceUtil) {}
```

### Verificar si se requiere cumplimiento

```typescript
const requiresCompliance = await this.nom024Util.requiresNOM024Compliance(proveedorSaludId);
if (requiresCompliance) {
  // Aplicar validaciones NOM-024
}
```

### Obtener país del proveedor

```typescript
const pais = await this.nom024Util.getProveedorPais(proveedorSaludId);
// Retorna: 'MX', 'GT', 'PA', etc. o null
```

### Uso en servicios con validación condicional

```typescript
async create(dto: CreateTrabajadorDto, proveedorSaludId: string) {
  const requiresCompliance = await this.nom024Util.requiresNOM024Compliance(proveedorSaludId);
  
  if (requiresCompliance) {
    // Validaciones específicas para MX
    if (!dto.curp) {
      throw new BadRequestException('CURP es obligatorio para proveedores en México (NOM-024)');
    }
  }
  
  // Continuar con la creación...
}
```

## Decoradores (para DTOs)

Los decoradores están disponibles pero **la validación real debe hacerse en la capa de servicio** usando `NOM024ComplianceUtil` para soporte completo asíncrono.

```typescript
import { RequiredForMX } from '../../decorators/conditional-validation.decorator';

export class CreateTrabajadorDto {
  @RequiredForMX()
  curp?: string; // Obligatorio solo para MX
}
```

**Importante**: Los decoradores marcan el campo pero permiten que pase la validación de DTO. La validación condicional real debe implementarse en el servicio usando `NOM024ComplianceUtil`.

