import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnfermeraFirmante, EnfermeraFirmanteSchema } from './schemas/enfermera-firmante.schema';
import { EnfermerasFirmantesController } from './enfermeras-firmantes.controller';
import { EnfermerasFirmantesService } from './enfermeras-firmantes.service';



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnfermeraFirmante.name, schema: EnfermeraFirmanteSchema },
    ]),
  ],
  controllers: [EnfermerasFirmantesController],
  providers: [EnfermerasFirmantesService],
  exports: [EnfermerasFirmantesService],
})
export class EnfermerasFirmantesModule {}
