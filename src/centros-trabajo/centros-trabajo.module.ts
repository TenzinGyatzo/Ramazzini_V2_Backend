import { Module } from '@nestjs/common';
import { CentrosTrabajoController } from './centros-trabajo.controller';
import { CentrosTrabajoService } from './centros-trabajo.service';

@Module({
  controllers: [CentrosTrabajoController],
  providers: [CentrosTrabajoService]
})
export class CentrosTrabajoModule {}
