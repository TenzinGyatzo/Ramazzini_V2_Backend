import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsentimientoDiarioController } from './consentimiento-diario.controller';
import { ConsentimientoDiarioService } from './consentimiento-diario.service';
import {
  ConsentimientoDiario,
  ConsentimientoDiarioSchema,
} from './schemas/consentimiento-diario.schema';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';
import { ProveedoresSaludModule } from '../proveedores-salud/proveedores-salud.module';
import {
  Trabajador,
  TrabajadorSchema,
} from '../trabajadores/schemas/trabajador.schema';
import {
  CentroTrabajo,
  CentroTrabajoSchema,
} from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa, EmpresaSchema } from '../empresas/schemas/empresa.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConsentimientoDiario.name, schema: ConsentimientoDiarioSchema },
      { name: Trabajador.name, schema: TrabajadorSchema },
      { name: CentroTrabajo.name, schema: CentroTrabajoSchema },
      { name: Empresa.name, schema: EmpresaSchema },
    ]),
    forwardRef(() => TrabajadoresModule),
    forwardRef(() => ProveedoresSaludModule),
  ],
  controllers: [ConsentimientoDiarioController],
  providers: [ConsentimientoDiarioService],
  exports: [ConsentimientoDiarioService], // Por si otros módulos necesitan verificar consentimiento
})
export class ConsentimientoDiarioModule {}
