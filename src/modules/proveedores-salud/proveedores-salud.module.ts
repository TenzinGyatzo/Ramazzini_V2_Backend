import { Module } from '@nestjs/common';
import { ProveedoresSaludService } from './proveedores-salud.service';
import { ProveedoresSaludController } from './proveedores-salud.controller';

@Module({
  controllers: [ProveedoresSaludController],
  providers: [ProveedoresSaludService],
})
export class ProveedoresSaludModule {}
