import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RiesgosTrabajoService } from './riesgos-trabajo.service';
import { RiesgosTrabajoController } from './riesgos-trabajo.controller';
import { RiesgoTrabajo, RiesgoTrabajoSchema } from './schemas/riesgo-trabajo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RiesgoTrabajo.name, schema: RiesgoTrabajoSchema },
    ]),
  ],
  controllers: [RiesgosTrabajoController],
  providers: [RiesgosTrabajoService],
})
export class RiesgosTrabajoModule {}
