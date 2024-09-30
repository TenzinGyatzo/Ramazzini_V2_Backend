import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { CentrosTrabajoModule } from './modules/centros-trabajo/centros-trabajo.module';
import { TrabajadoresModule } from './modules/trabajadores/trabajadores.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExamplesModule } from './modules/examples/examples.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),  
    ExamplesModule, 
    EmpresasModule, 
    CentrosTrabajoModule, 
    TrabajadoresModule, 
    AuthModule, 
    UsersModule, 
  ]
})

export class AppModule {}