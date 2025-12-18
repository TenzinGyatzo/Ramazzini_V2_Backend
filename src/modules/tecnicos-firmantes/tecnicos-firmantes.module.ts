import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TecnicoFirmante,
  TecnicoFirmanteSchema,
} from './schemas/tecnico-firmante.schema';
import { TecnicosFirmantesController } from './tecnicos-firmantes.controller';
import { TecnicosFirmantesService } from './tecnicos-firmantes.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  ProveedorSalud,
  ProveedorSaludSchema,
} from '../proveedores-salud/schemas/proveedor-salud.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TecnicoFirmante.name, schema: TecnicoFirmanteSchema },
      { name: User.name, schema: UserSchema },
      { name: ProveedorSalud.name, schema: ProveedorSaludSchema },
    ]),
  ],
  controllers: [TecnicosFirmantesController],
  providers: [TecnicosFirmantesService],
  exports: [TecnicosFirmantesService],
})
export class TecnicosFirmantesModule {}
