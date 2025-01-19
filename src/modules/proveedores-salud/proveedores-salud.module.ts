import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProveedoresSaludService } from './proveedores-salud.service';
import { ProveedoresSaludController } from './proveedores-salud.controller';
import { ProveedorSalud, ProveedorSaludSchema } from './schemas/proveedor-salud.schema';

@Module({
  imports: [
      MongooseModule.forFeature([{ name: ProveedorSalud.name, schema: ProveedorSaludSchema }]), 
  ],
  controllers: [ProveedoresSaludController],
  providers: [ProveedoresSaludService],
  exports: [ProveedoresSaludService],
})
export class ProveedoresSaludModule {}
