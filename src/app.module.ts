import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express'; // Importa MulterModule
import * as multer from 'multer';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { CentrosTrabajoModule } from './modules/centros-trabajo/centros-trabajo.module';
import { TrabajadoresModule } from './modules/trabajadores/trabajadores.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExamplesModule } from './modules/examples/examples.module';
import { ExpedientesModule } from './modules/expedientes/expedientes.module';
import { InformesModule } from './modules/informes/informes.module';
import { PrinterModule } from './modules/printer/printer.module';


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
    MulterModule.register({ // Configuración de Multer
      dest: './uploads',
      // storage: multer.memoryStorage(), // Almacena los archivos en memoria (temporal)
    }),
    ExamplesModule, 
    EmpresasModule, 
    CentrosTrabajoModule, 
    TrabajadoresModule, 
    AuthModule, 
    UsersModule, 
    ExpedientesModule,
    InformesModule,
    PrinterModule 
  ]
})
export class AppModule {}
