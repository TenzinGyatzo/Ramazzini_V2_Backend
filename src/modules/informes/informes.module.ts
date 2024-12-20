import { Module } from '@nestjs/common';
import { InformesService } from './informes.service';
import { InformesController } from './informes.controller';
import { PrinterModule } from '../printer/printer.module'
import { EmpresasModule } from '../empresas/empresas.module';
import { TrabajadoresModule } from '../trabajadores/trabajadores.module';
import { ExpedientesModule } from '../expedientes/expedientes.module';

@Module({
  controllers: [InformesController],
  providers: [InformesService],
  imports: [PrinterModule, EmpresasModule, TrabajadoresModule, ExpedientesModule], 
})
export class InformesModule {}
