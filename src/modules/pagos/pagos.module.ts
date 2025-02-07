import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';

@Module({
  providers: [PagosService],
  controllers: [PagosController]
})
export class PagosModule {}
