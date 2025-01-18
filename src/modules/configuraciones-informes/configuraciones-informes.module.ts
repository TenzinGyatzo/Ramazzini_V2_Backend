import { Module } from '@nestjs/common';
import { ConfiguracionesInformesService } from './configuraciones-informes.service';
import { ConfiguracionesInformesController } from './configuraciones-informes.controller';

@Module({
  controllers: [ConfiguracionesInformesController],
  providers: [ConfiguracionesInformesService],
})
export class ConfiguracionesInformesModule {}
