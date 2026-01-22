import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultadosClinicosService } from './resultados-clinicos.service';
import { ResultadosClinicosController } from './resultados-clinicos.controller';
import {
  ResultadoClinico,
  ResultadoClinicoSchema,
} from './schemas/resultado-clinico.schema';

@Module({
  controllers: [ResultadosClinicosController],
  providers: [ResultadosClinicosService],
  imports: [
    MongooseModule.forFeature([
      { name: ResultadoClinico.name, schema: ResultadoClinicoSchema },
    ]),
  ],
  exports: [ResultadosClinicosService],
})
export class ResultadosClinicosModule {}
