# PARTE 4: LÓGICA DE VALIDACIÓN Y ESTRUCTURACIÓN (BACKEND/MIDDLEWARE)
## NOM-024-SSA3-2012 - Fase 1: Estandarización de Datos

---

## OBJETIVO

Proponer la lógica para:
- Validación de CURP contra RENAPO
- Validación de datos de identificación según Tabla 1 de la NOM
- Validación de formato `[aaaammdd]` para fecha de nacimiento
- Mecanismo para asegurar que los registros de atención sean **inalterables**

---

## 1. VALIDACIÓN DE CURP

### 1.1. Validación de Formato (Algoritmo Local)

**Archivo nuevo:** `backend/src/utils/validators/curp.validator.ts`

```typescript
export class CURPValidator {
  
  // Expresión regular para validar formato CURP
  private static readonly CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;

  // Validar formato básico
  static validarFormato(curp: string): boolean {
    if (!curp || curp.length !== 18) return false;
    return this.CURP_REGEX.test(curp.toUpperCase());
  }

  // Validar dígito verificador (algoritmo oficial)
  static validarDigitoVerificador(curp: string): boolean {
    curp = curp.toUpperCase();
    const digitoCalculado = this.calcularDigitoVerificador(curp.substring(0, 17));
    return digitoCalculado === curp[17];
  }

  private static calcularDigitoVerificador(curpBase: string): string {
    const caracteres = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    let suma = 0;

    for (let i = 0; i < 17; i++) {
      suma += caracteres.indexOf(curpBase[i]) * (18 - i);
    }

    const residuo = suma % 10;
    const digitoVerificador = residuo === 0 ? '0' : String(10 - residuo);

    return digitoVerificador;
  }

  // Extraer fecha de nacimiento de CURP
  static extraerFechaNacimiento(curp: string): Date | null {
    if (!this.validarFormato(curp)) return null;

    const año = parseInt(curp.substring(4, 6));
    const mes = parseInt(curp.substring(6, 8)) - 1;  // Meses en JS: 0-11
    const dia = parseInt(curp.substring(8, 10));

    // Determinar siglo (asumiendo que años < 50 son 2000+, >= 50 son 1900+)
    const añoCompleto = año < 50 ? 2000 + año : 1900 + año;

    return new Date(añoCompleto, mes, dia);
  }

  // Extraer sexo de CURP
  static extraerSexo(curp: string): string | null {
    if (!this.validarFormato(curp)) return null;
    const sexoCaracter = curp[10];
    return sexoCaracter === 'H' ? '1' : sexoCaracter === 'M' ? '2' : null;
  }

  // Extraer entidad de nacimiento
  static extraerEntidadNacimiento(curp: string): string | null {
    if (!this.validarFormato(curp)) return null;
    
    const codigoEntidad = curp.substring(11, 13);
    const mapaEntidades: Record<string, string> = {
      'AS': '01', 'BC': '02', 'BS': '03', 'CC': '04', 'CS': '07',
      'CH': '06', 'CL': '08', 'CM': '05', 'DF': '09', 'DG': '10',
      'GT': '11', 'GR': '12', 'HG': '13', 'JC': '14', 'MC': '15',
      'MN': '16', 'MS': '17', 'NT': '18', 'NL': '19', 'OC': '20',
      'PL': '21', 'QT': '22', 'QR': '23', 'SP': '24', 'SL': '25',
      'SR': '26', 'TC': '27', 'TS': '28', 'TL': '29', 'VZ': '30',
      'YN': '31', 'ZS': '32', 'NE': '00'  // NE = Nacido en el Extranjero
    };

    return mapaEntidades[codigoEntidad] || null;
  }

  // Validación completa
  static validarCompleto(curp: string): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.validarFormato(curp)) {
      errores.push('Formato de CURP inválido');
    }

    if (!this.validarDigitoVerificador(curp)) {
      errores.push('Dígito verificador de CURP inválido');
    }

    const fecha = this.extraerFechaNacimiento(curp);
    if (!fecha || fecha > new Date()) {
      errores.push('Fecha de nacimiento en CURP inválida');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
```

### 1.2. Validación contra RENAPO (Servicio Web)

**IMPORTANTE:** La validación oficial contra RENAPO requiere:
- Convenio con SEGOB/RENAPO
- Uso del Servicio Web SOAP de RENAPO
- Credenciales de acceso

**Alternativa para Fase 1:** Validación de formato + dígito verificador (offline)

**Archivo:** `backend/src/utils/validators/renapo.service.ts`

```typescript
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RENAPOService {
  private readonly RENAPO_URL = process.env.RENAPO_WEBSERVICE_URL;
  private readonly USUARIO = process.env.RENAPO_USUARIO;
  private readonly PASSWORD = process.env.RENAPO_PASSWORD;

  // Validar CURP contra servicio de RENAPO
  async validarCURPenLinea(curp: string): Promise<{
    valida: boolean;
    mensaje: string;
    datosRENAPO?: any;
  }> {
    try {
      // NOTA: Este es un ejemplo. La implementación real depende del servicio RENAPO
      const response = await axios.post(this.RENAPO_URL, {
        curp,
        usuario: this.USUARIO,
        password: this.PASSWORD
      }, {
        headers: {
          'Content-Type': 'application/soap+xml',
        }
      });

      // Parsear respuesta SOAP (simplificado)
      const valida = response.data.includes('<valida>true</valida>');
      
      if (valida) {
        return {
          valida: true,
          mensaje: 'CURP validada correctamente con RENAPO',
          datosRENAPO: this.parsearDatosRENAPO(response.data)
        };
      } else {
        return {
          valida: false,
          mensaje: 'CURP no encontrada en RENAPO o datos no coinciden'
        };
      }
    } catch (error) {
      console.error('Error al validar CURP con RENAPO:', error);
      
      // Si el servicio RENAPO no está disponible, usar validación local
      const validacionLocal = CURPValidator.validarCompleto(curp);
      
      if (validacionLocal.valido) {
        return {
          valida: true,
          mensaje: 'CURP válida (validación local, servicio RENAPO no disponible)'
        };
      } else {
        return {
          valida: false,
          mensaje: 'CURP inválida: ' + validacionLocal.errores.join(', ')
        };
      }
    }
  }

  private parsearDatosRENAPO(xmlResponse: string): any {
    // Implementar parseo de XML SOAP
    // Retornar: nombre, apellidos, fecha nacimiento, etc.
    return {};
  }
}
```

### 1.3. Integración en DTO de Trabajador

**Archivo:** `backend/src/modules/trabajadores/dto/create-trabajador.dto.ts`

```typescript
import { IsString, IsNotEmpty, Matches, Validate } from 'class-validator';
import { CURPValidator } from 'src/utils/validators/curp.validator';

export class CreateTrabajadorDto {
  
  @ApiProperty({
    description: 'CURP del trabajador (18 caracteres)',
    example: 'VECR850101HDFRGN09'
  })
  @IsString({ message: 'La CURP debe ser un string' })
  @IsNotEmpty({ message: 'La CURP no puede estar vacía' })
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, {
    message: 'El formato de la CURP es inválido'
  })
  @Validate((value: string) => {
    const validacion = CURPValidator.validarCompleto(value);
    if (!validacion.valido) {
      throw new Error(validacion.errores.join(', '));
    }
    return true;
  })
  curp: string;

  // ... resto de campos
}
```

---

## 2. VALIDACIÓN DE NOMBRES Y APELLIDOS

### 2.1. Validador de Nombres

**Archivo:** `backend/src/utils/validators/nombre.validator.ts`

```typescript
export class NombreValidator {
  
  // Caracteres permitidos: A-Z, Ñ, espacios, acentos
  private static readonly NOMBRE_REGEX = /^[A-ZÑÁÉÍÓÚÜ\s]+$/;

  static validarFormato(texto: string): boolean {
    if (!texto || texto.trim().length === 0) return false;
    return this.NOMBRE_REGEX.test(texto.trim());
  }

  // Normalizar: Convertir a mayúsculas y limpiar espacios
  static normalizar(texto: string): string {
    return texto
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ')  // Múltiples espacios → un solo espacio
      .normalize('NFD')       // Normalizar caracteres Unicode
      .replace(/[\u0300-\u036f]/g, '')  // Remover diacríticos (opcional, según requerimiento)
  }

  // Verificar que no contenga abreviaturas comunes
  static tieneAbreviaturas(texto: string): boolean {
    const abreviaturas = ['DR', 'LIC', 'ING', 'ARQ', 'C.P.', 'MVZ'];
    const textoMayusculas = texto.toUpperCase();
    return abreviaturas.some(abrev => textoMayusculas.includes(abrev));
  }

  static validarCompleto(texto: string): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.validarFormato(texto)) {
      errores.push('Solo se permiten letras mayúsculas (A-Z, Ñ) y espacios');
    }

    if (this.tieneAbreviaturas(texto)) {
      errores.push('No se permiten abreviaturas (DR, LIC, ING, etc.)');
    }

    if (texto.length < 2) {
      errores.push('Debe contener al menos 2 caracteres');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
```

### 2.2. Middleware de Normalización

**Archivo:** `backend/src/middlewares/normalizacion.middleware.ts`

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { NombreValidator } from 'src/utils/validators/nombre.validator';

@Injectable()
export class NormalizacionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Si es una petición de crear/actualizar trabajador
    if (req.body) {
      if (req.body.nombre) {
        req.body.nombre = NombreValidator.normalizar(req.body.nombre);
      }
      if (req.body.primerApellido) {
        req.body.primerApellido = NombreValidator.normalizar(req.body.primerApellido);
      }
      if (req.body.segundoApellido) {
        req.body.segundoApellido = NombreValidator.normalizar(req.body.segundoApellido);
      }
      if (req.body.curp) {
        req.body.curp = req.body.curp.trim().toUpperCase();
      }
    }

    next();
  }
}
```

---

## 3. VALIDACIÓN DE FECHA DE NACIMIENTO

### 3.1. Formato [aaaammdd] para Reportes

**Archivo:** `backend/src/utils/formatters/fecha.formatter.ts`

```typescript
export class FechaFormatter {
  
  // Convertir Date a formato NOM [aaaammdd]
  static toFormatoNOM(fecha: Date): string {
    if (!fecha) return null;
    
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;  // aaaammdd
  }

  // Convertir [aaaammdd] a Date
  static fromFormatoNOM(fechaNOM: string): Date {
    if (!fechaNOM || fechaNOM.length !== 8) return null;
    
    const year = parseInt(fechaNOM.substring(0, 4));
    const month = parseInt(fechaNOM.substring(4, 6)) - 1;
    const day = parseInt(fechaNOM.substring(6, 8));
    
    return new Date(year, month, day);
  }

  // Validar fecha lógica
  static validarFechaNacimiento(fecha: Date): { valida: boolean; mensaje: string } {
    if (!fecha) {
      return { valida: false, mensaje: 'Fecha de nacimiento requerida' };
    }

    const hoy = new Date();
    const edadMaxima = 120;
    const fechaMinima = new Date(hoy.getFullYear() - edadMaxima, hoy.getMonth(), hoy.getDate());

    if (fecha > hoy) {
      return { valida: false, mensaje: 'La fecha de nacimiento no puede ser futura' };
    }

    if (fecha < fechaMinima) {
      return { valida: false, mensaje: `La fecha de nacimiento no puede ser anterior a ${edadMaxima} años` };
    }

    return { valida: true, mensaje: 'Fecha válida' };
  }
}
```

### 3.2. Integración en Servicios

```typescript
// En trabajadores.service.ts

async exportarTrabajadorParaGIIS(idTrabajador: string) {
  const trabajador = await this.trabajadorModel.findById(idTrabajador);
  
  return {
    NOMBRE: trabajador.nombre,
    APELLIDO1: trabajador.primerApellido,
    APELLIDO2: trabajador.segundoApellido,
    CURP: trabajador.curp,
    FECNAC: FechaFormatter.toFormatoNOM(trabajador.fechaNacimiento),  // [aaaammdd]
    SEXO: trabajador.sexoCodigo,  // 1, 2, 3
    EDONAC: trabajador.entidadNacimiento,
    EDO: trabajador.entidadResidencia,
    MUN: trabajador.municipioResidencia,
    LOC: trabajador.localidadResidencia
  };
}
```

---

## 4. MECANISMO DE INALTERABILIDAD DE DOCUMENTOS

### 4.1. Servicio de Gestión de Estado de Documentos

**Archivo nuevo:** `backend/src/modules/expedientes/services/estado-documento.service.ts`

```typescript
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from 'src/modules/auditoria/schemas/audit-log.schema';

@Injectable()
export class EstadoDocumentoService {
  
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>
  ) {}

  // Verificar si un documento puede ser editado
  async puedeEditarse(
    tipoDocumento: string,
    idDocumento: string,
    documento: any
  ): Promise<boolean> {
    // Documentos finalizados NO pueden editarse
    if (documento.estadoDocumento === 'FINALIZADO') {
      return false;
    }

    // Documentos cancelados NO pueden editarse
    if (documento.estadoDocumento === 'CANCELADO') {
      return false;
    }

    // Solo borradores pueden editarse
    return documento.estadoDocumento === 'BORRADOR';
  }

  // Finalizar documento (hacerlo inmutable)
  async finalizarDocumento(
    tipoDocumento: string,
    idDocumento: string,
    documento: any,
    usuarioId: string
  ) {
    if (documento.estadoDocumento === 'FINALIZADO') {
      throw new BadRequestException('El documento ya está finalizado');
    }

    // Validar que todos los campos obligatorios estén completos
    this.validarDocumentoCompleto(tipoDocumento, documento);

    // Actualizar estado
    documento.estadoDocumento = 'FINALIZADO';
    documento.fechaFinalizacion = new Date();
    documento.finalizadoPor = usuarioId;

    await documento.save();

    // Registrar en audit log
    await this.registrarAuditoria('FINALIZE', tipoDocumento, idDocumento, usuarioId, {
      mensaje: 'Documento finalizado, ahora es inmutable'
    });

    return documento;
  }

  // Cancelar documento
  async cancelarDocumento(
    tipoDocumento: string,
    idDocumento: string,
    documento: any,
    usuarioId: string,
    motivo: string
  ) {
    if (documento.estadoDocumento === 'FINALIZADO') {
      throw new ForbiddenException('No se puede cancelar un documento finalizado');
    }

    documento.estadoDocumento = 'CANCELADO';
    documento.motivoCancelacion = motivo;

    await documento.save();

    await this.registrarAuditoria('DELETE', tipoDocumento, idDocumento, usuarioId, {
      motivo
    });

    return documento;
  }

  // Validar que el documento está completo antes de finalizar
  private validarDocumentoCompleto(tipoDocumento: string, documento: any) {
    // Implementar validaciones específicas por tipo de documento
    switch (tipoDocumento) {
      case 'NotaMedica':
        if (!documento.diagnosticos || documento.diagnosticos.length === 0) {
          throw new BadRequestException('El documento debe tener al menos un diagnóstico');
        }
        break;
      // ... más validaciones
    }
  }

  // Registrar en audit log
  private async registrarAuditoria(
    accion: string,
    entidad: string,
    idEntidad: string,
    usuario: string,
    datos: any
  ) {
    await this.auditLogModel.create({
      entidad,
      idEntidad,
      accion,
      usuario,
      datosNuevos: datos,
      fechaHora: new Date()
    });
  }
}
```

### 4.2. Guard para Proteger Ediciones

**Archivo nuevo:** `backend/src/modules/expedientes/guards/documento-editable.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { EstadoDocumentoService } from '../services/estado-documento.service';

@Injectable()
export class DocumentoEditableGuard implements CanActivate {
  
  constructor(private estadoDocumentoService: EstadoDocumentoService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { params, body } = request;

    // Obtener el documento de la base de datos
    const tipoDocumento = this.getTipoDocumento(request.url);
    const documento = await this.getDocumento(tipoDocumento, params.id);

    if (!documento) {
      throw new ForbiddenException('Documento no encontrado');
    }

    // Verificar si puede editarse
    const puedeEditarse = await this.estadoDocumentoService.puedeEditarse(
      tipoDocumento,
      params.id,
      documento
    );

    if (!puedeEditarse) {
      throw new ForbiddenException(
        `No se puede editar este documento. Estado actual: ${documento.estadoDocumento}`
      );
    }

    return true;
  }

  private getTipoDocumento(url: string): string {
    if (url.includes('notas-medicas')) return 'NotaMedica';
    if (url.includes('historias-clinicas')) return 'HistoriaClinica';
    // ... más tipos
    return 'Documento';
  }

  private async getDocumento(tipo: string, id: string): Promise<any> {
    // Implementar lógica para obtener documento según tipo
    return null;
  }
}
```

### 4.3. Aplicar Guard en Controladores

```typescript
// expedientes.controller.ts

@Patch('notas-medicas/:id')
@UseGuards(DocumentoEditableGuard)  // NUEVO: Protege la edición
async updateNotaMedica(
  @Param('id') id: string,
  @Body() updateNotaMedicaDto: UpdateNotaMedicaDto
) {
  return await this.expedientesService.updateNotaMedica(id, updateNotaMedicaDto);
}

@Post('notas-medicas/:id/finalizar')
async finalizarNotaMedica(
  @Param('id') id: string,
  @Req() req: Request
) {
  const documento = await this.expedientesService.getNotaMedica(id);
  const usuarioId = req.user.id;
  
  return await this.estadoDocumentoService.finalizarDocumento(
    'NotaMedica',
    id,
    documento,
    usuarioId
  );
}
```

---

## 5. SERVICIO DE AUDITORÍA COMPLETA

### 5.1. Middleware de Auditoría

**Archivo:** `backend/src/middlewares/auditoria.middleware.ts`

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from 'src/modules/auditoria/auditoria.service';

@Injectable()
export class AuditoriaMiddleware implements NestMiddleware {
  
  constructor(private auditLogService: AuditLogService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Capturar datos de la petición
    const { method, url, body, user, ip } = req;

    // Solo auditar operaciones de modificación
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Almacenar snapshot antes del cambio
      const originalSend = res.send;
      res.send = async function(data) {
        // Registrar auditoría después de la operación
        await this.auditLogService.registrar({
          metodo: method,
          ruta: url,
          usuario: user?.id,
          datosEnviados: body,
          respuesta: data,
          ipOrigen: ip,
          userAgent: req.headers['user-agent']
        });

        originalSend.call(this, data);
      }.bind(res);
    }

    next();
  }
}
```

---

## 6. RESUMEN DE VALIDACIONES IMPLEMENTADAS

| Tipo de Validación | Implementación | Estado |
|--------------------|----------------|--------|
| Formato CURP | Regex + dígito verificador | ✅ Local |
| CURP vs RENAPO | Servicio Web SOAP | ⏳ Requiere convenio |
| Nombres mayúsculas | Normalización automática | ✅ |
| Caracteres permitidos | Validación regex | ✅ |
| Fecha nacimiento [aaaammdd] | Transformación en capa servicio | ✅ |
| Claves INEGI | Validación contra catálogos | ✅ |
| Códigos CIE-10 | Validación contra catálogo | ✅ |
| CLUES | Validación contra catálogo | ✅ |
| Inalterabilidad | Guard + estado de documento | ✅ |
| Audit log | Middleware global | ✅ |

---

## 7. CRONOGRAMA DE IMPLEMENTACIÓN

| Semana | Actividad |
|--------|-----------|
| 1 | Implementar validadores de CURP (local) |
| 1 | Implementar validadores de nombres |
| 2 | Implementar servicio RENAPO (si disponible) |
| 2 | Implementar formateo de fechas |
| 3 | Implementar servicio de estado de documentos |
| 3 | Implementar guards de protección |
| 4 | Implementar middleware de auditoría |
| 4 | Pruebas integrales |
| 5 | Documentación de validaciones |

---

**Siguiente Paso:** Revisar [PARTE 5: Ajustes en el Frontend](PLAN_NOM024_FASE1_PARTE5_FRONTEND.md)

