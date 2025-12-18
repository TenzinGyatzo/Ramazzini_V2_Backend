import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicosFirmantesService } from './medicos-firmantes.service';
import { MedicosFirmantesController } from './medicos-firmantes.controller';
import {
  MedicoFirmante,
  MedicoFirmanteSchema,
} from './schemas/medico-firmante.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  ProveedorSalud,
  ProveedorSaludSchema,
} from '../proveedores-salud/schemas/proveedor-salud.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicoFirmante.name, schema: MedicoFirmanteSchema },
      { name: User.name, schema: UserSchema },
      { name: ProveedorSalud.name, schema: ProveedorSaludSchema },
    ]),
  ],
  controllers: [MedicosFirmantesController],
  providers: [MedicosFirmantesService],
  exports: [MedicosFirmantesService],
})
export class MedicosFirmantesModule {}
