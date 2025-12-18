import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EnfermeraFirmante,
  EnfermeraFirmanteSchema,
} from './schemas/enfermera-firmante.schema';
import { EnfermerasFirmantesController } from './enfermeras-firmantes.controller';
import { EnfermerasFirmantesService } from './enfermeras-firmantes.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  ProveedorSalud,
  ProveedorSaludSchema,
} from '../proveedores-salud/schemas/proveedor-salud.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnfermeraFirmante.name, schema: EnfermeraFirmanteSchema },
      { name: User.name, schema: UserSchema },
      { name: ProveedorSalud.name, schema: ProveedorSaludSchema },
    ]),
  ],
  controllers: [EnfermerasFirmantesController],
  providers: [EnfermerasFirmantesService],
  exports: [EnfermerasFirmantesService],
})
export class EnfermerasFirmantesModule {}
