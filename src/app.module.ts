import { Module } from '@nestjs/common';
import { EmpresasModule } from './empresas/empresas.module';
import { CentrosTrabajoModule } from './centros-trabajo/centros-trabajo.module';
import { TrabajadoresModule } from './trabajadores/trabajadores.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [EmpresasModule, CentrosTrabajoModule, TrabajadoresModule, AuthModule, UsersModule],
})
export class AppModule {}
