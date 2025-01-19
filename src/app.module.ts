import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ServeStaticModule } from '@nestjs/serve-static'; // Importar ServeStaticModule
import { join } from 'path'; // Importar join para rutas
import { EmpresasModule } from './modules/empresas/empresas.module';
import { CentrosTrabajoModule } from './modules/centros-trabajo/centros-trabajo.module';
import { TrabajadoresModule } from './modules/trabajadores/trabajadores.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExamplesModule } from './modules/examples/examples.module';
import { ExpedientesModule } from './modules/expedientes/expedientes.module';
import { InformesModule } from './modules/informes/informes.module';
import { PrinterModule } from './modules/printer/printer.module';
import { DocumentMergerModule } from './modules/document-merger/document-merger.module';
import { ProveedoresSaludModule } from './modules/proveedores-salud/proveedores-salud.module';
import { ConfiguracionesInformesModule } from './modules/configuraciones-informes/configuraciones-informes.module';

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
    MulterModule.register({
      dest: './uploads',
    }),

    // Nuevo: Configuración para servir archivos estáticos
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'expedientes-medicos'), // Ruta a la carpeta de PDFs
      serveRoot: '/expedientes-medicos', // Prefijo en la URL
    }),

    ExamplesModule,
    EmpresasModule,
    CentrosTrabajoModule,
    TrabajadoresModule,
    AuthModule,
    UsersModule,
    ExpedientesModule,
    InformesModule,
    PrinterModule,
    DocumentMergerModule,
    ProveedoresSaludModule,
    ConfiguracionesInformesModule,
  ],
})
export class AppModule {}
