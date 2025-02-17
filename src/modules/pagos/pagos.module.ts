import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { UsersModule } from '../users/users.module';
import { ProveedoresSaludModule } from '../proveedores-salud/proveedores-salud.module';

@Module({
  providers: [PagosService],
  controllers: [PagosController],
  imports: [UsersModule, ProveedoresSaludModule],
})
export class PagosModule {}
