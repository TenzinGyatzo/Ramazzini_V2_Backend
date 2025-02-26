import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { UsersModule } from '../users/users.module';
import { ProveedoresSaludModule } from '../proveedores-salud/proveedores-salud.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Suscripcion, SuscripcionSchema } from './schemas/suscripcion.schema';
import { Pago, PagoSchema } from './schemas/pago.schema';
import { ProveedorSalud, ProveedorSaludSchema } from '../proveedores-salud/schemas/proveedor-salud.schema';
import { EmailsModule } from '../emails/emails.module';

@Module({
  providers: [PagosService],
  controllers: [PagosController],
  imports: [
    UsersModule, 
    ProveedoresSaludModule,
    EmailsModule,
    MongooseModule.forFeature([
      { name: Suscripcion.name, schema: SuscripcionSchema },
      { name: Pago.name, schema: PagoSchema },
      { name: ProveedorSalud.name, schema: ProveedorSaludSchema },
    ]),
  ],
})
export class PagosModule {}

