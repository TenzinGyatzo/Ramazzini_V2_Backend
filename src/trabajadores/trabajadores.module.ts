import { Module } from '@nestjs/common';
import { TrabajadoresController } from './trabajadores.controller';
import { TrabajadoresService } from './trabajadores.service';

@Module({
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService]
})
export class TrabajadoresModule {}
