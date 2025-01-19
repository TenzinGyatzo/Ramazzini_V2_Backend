import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfiguracionesInformesService } from './configuraciones-informes.service';
import { ConfiguracionesInformesController } from './configuraciones-informes.controller';
import { ConfiguracionInforme, ConfiguracionInformeSchema } from './schemas/configuracion-informe.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConfiguracionInforme.name, schema: ConfiguracionInformeSchema },
    ]),
  ],
  controllers: [ConfiguracionesInformesController],
  providers: [ConfiguracionesInformesService],
  exports: [ConfiguracionesInformesService],
})
export class ConfiguracionesInformesModule {}
