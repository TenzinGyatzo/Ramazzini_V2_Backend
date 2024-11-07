import { Module } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { ExpedientesController } from './expedientes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Antidoping, AntidopingSchema } from './schemas/antidoping.schema';
import { Aptitud, AptitudSchema } from './schemas/aptitud.schema';
import { Certificado, CertificadoSchema } from './schemas/certificado.schema';
import { DocumentoExterno, DocumentoExternoSchema } from './schemas/documento-externo.schema';
import { ExamenVista, ExamenVistaSchema } from './schemas/examen-vista.schema';
import { ExploracionFisica, ExploracionFisicaSchema } from './schemas/exploracion-fisica.schema';
import { HistoriaClinica, HistoriaClinicaSchema } from './schemas/historia-clinica.schema';

@Module({
  controllers: [ExpedientesController],
  providers: [ExpedientesService],
  imports: [
    MongooseModule.forFeature([
      { name: Antidoping.name, schema: AntidopingSchema },
      { name: Aptitud.name, schema: AptitudSchema },
      { name: Certificado.name, schema: CertificadoSchema },
      { name: DocumentoExterno.name, schema: DocumentoExternoSchema },
      { name: ExamenVista.name, schema: ExamenVistaSchema },
      { name: ExploracionFisica.name, schema: ExploracionFisicaSchema },
      { name: HistoriaClinica.name, schema: HistoriaClinicaSchema }
    ]),
  ]
})
export class ExpedientesModule {}
