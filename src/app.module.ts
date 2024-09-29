import { Module } from '@nestjs/common';
import { ExamplesModule } from './modules/examples/examples.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { CentrosTrabajoModule } from './modules/centros-trabajo/centros-trabajo.module';
import { TrabajadoresModule } from './modules/trabajadores/trabajadores.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ExamplesModule, EmpresasModule, CentrosTrabajoModule, TrabajadoresModule, AuthModule, UsersModule, ]
})
export class AppModule {}
