import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InformePersonalizacionController } from './informe-personalizacion.controller';
import { InformePersonalizacionService } from './informe-personalizacion.service';
import {
  InformePersonalizacion,
  InformePersonalizacionSchema,
} from './schemas/informe-personalizacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: InformePersonalizacion.name,
        schema: InformePersonalizacionSchema,
      },
    ]),
  ],
  controllers: [InformePersonalizacionController],
  providers: [InformePersonalizacionService],
  exports: [InformePersonalizacionService],
})
export class InformePersonalizacionModule {}
