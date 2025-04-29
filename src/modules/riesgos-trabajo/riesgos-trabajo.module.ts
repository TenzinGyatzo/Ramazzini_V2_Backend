import { Module } from '@nestjs/common';
import { RiesgosTrabajoService } from './riesgos-trabajo.service';
import { RiesgosTrabajoController } from './riesgos-trabajo.controller';

@Module({
  controllers: [RiesgosTrabajoController],
  providers: [RiesgosTrabajoService],
})
export class RiesgosTrabajoModule {}
