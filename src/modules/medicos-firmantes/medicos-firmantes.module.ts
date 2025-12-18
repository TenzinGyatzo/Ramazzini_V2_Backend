import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicosFirmantesService } from './medicos-firmantes.service';
import { MedicosFirmantesController } from './medicos-firmantes.controller';
import {
  MedicoFirmante,
  MedicoFirmanteSchema,
} from './schemas/medico-firmante.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicoFirmante.name, schema: MedicoFirmanteSchema },
    ]),
  ],
  controllers: [MedicosFirmantesController],
  providers: [MedicosFirmantesService],
  exports: [MedicosFirmantesService],
})
export class MedicosFirmantesModule {}
