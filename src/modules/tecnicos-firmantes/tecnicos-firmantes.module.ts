import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TecnicoFirmante, TecnicoFirmanteSchema } from './schemas/tecnico-firmante.schema';
import { TecnicosFirmantesController } from './tecnicos-firmantes.controller';
import { TecnicosFirmantesService } from './tecnicos-firmantes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TecnicoFirmante.name, schema: TecnicoFirmanteSchema },
    ]),
  ],
  controllers: [TecnicosFirmantesController],
  providers: [TecnicosFirmantesService],
  exports: [TecnicosFirmantesService],
})
export class TecnicosFirmantesModule {}


