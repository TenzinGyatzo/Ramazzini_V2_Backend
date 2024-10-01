import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CentroTrabajo, CentroTrabajoSchema } from './schemas/centro-trabajo.schema';
import { CentrosTrabajoService } from './centros-trabajo.service';
import { CentrosTrabajoController } from './centros-trabajo.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CentroTrabajo.name, schema: CentroTrabajoSchema }]),
  ],
  controllers: [CentrosTrabajoController],
  providers: [CentrosTrabajoService],
})
export class CentrosTrabajoModule {}
