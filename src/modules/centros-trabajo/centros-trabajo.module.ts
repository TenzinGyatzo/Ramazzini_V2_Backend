import { Module } from '@nestjs/common';
import { CentrosTrabajoService } from './centros-trabajo.service';
import { CentrosTrabajoController } from './centros-trabajo.controller';

@Module({
  controllers: [CentrosTrabajoController],
  providers: [CentrosTrabajoService],
})
export class CentrosTrabajoModule {}
