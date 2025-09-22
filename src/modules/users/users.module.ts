import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { UserSchema } from './schemas/user.schema';
import { EmailsModule } from '../emails/emails.module';
// Importar esquemas de expedientes
import { HistoriaClinicaSchema } from '../expedientes/schemas/historia-clinica.schema';
import { AptitudPuestoSchema } from '../expedientes/schemas/aptitud-puesto.schema';
import { ExploracionFisicaSchema } from '../expedientes/schemas/exploracion-fisica.schema';
import { ExamenVistaSchema } from '../expedientes/schemas/examen-vista.schema';
import { AudiometriaSchema } from '../expedientes/schemas/audiometria.schema';
import { AntidopingSchema } from '../expedientes/schemas/antidoping.schema';
import { NotaMedicaSchema } from '../expedientes/schemas/nota-medica.schema';
import { DocumentoExternoSchema } from '../expedientes/schemas/documento-externo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: 'HistoriaClinica', schema: HistoriaClinicaSchema },
      { name: 'AptitudPuesto', schema: AptitudPuestoSchema },
      { name: 'ExploracionFisica', schema: ExploracionFisicaSchema },
      { name: 'ExamenVista', schema: ExamenVistaSchema },
      { name: 'Audiometria', schema: AudiometriaSchema },
      { name: 'Antidoping', schema: AntidopingSchema },
      { name: 'NotaMedica', schema: NotaMedicaSchema },
      { name: 'DocumentoExterno', schema: DocumentoExternoSchema },
    ]),
    EmailsModule,  // Importa el módulo que exporta el EmailsService
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
