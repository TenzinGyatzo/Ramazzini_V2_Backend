import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from './schemas/empresa.schema';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Empresa.name, schema: EmpresaSchema }]), 
  ],
  controllers: [EmpresasController],
  providers: [EmpresasService],
})
export class EmpresasModule {}
