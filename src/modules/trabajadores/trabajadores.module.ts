import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { TrabajadoresService } from './trabajadores.service';
import { TrabajadoresController } from './trabajadores.controller';
import { Trabajador, TrabajadorSchema } from './schemas/trabajador.schema'
import { Antidoping, AntidopingSchema } from '../expedientes/schemas/antidoping.schema';
import { AptitudPuesto, AptitudPuestoSchema } from '../expedientes/schemas/aptitud-puesto.schema';
import { Certificado, CertificadoSchema } from '../expedientes/schemas/certificado.schema';
import { DocumentoExterno, DocumentoExternoSchema } from '../expedientes/schemas/documento-externo.schema';
import { ExamenVista, ExamenVistaSchema } from '../expedientes/schemas/examen-vista.schema';
import { ExploracionFisica, ExploracionFisicaSchema } from '../expedientes/schemas/exploracion-fisica.schema';
import { HistoriaClinica, HistoriaClinicaSchema } from '../expedientes/schemas/historia-clinica.schema';
import { NotaMedica, NotaMedicaSchema } from '../expedientes/schemas/nota-medica.schema';
import { RiesgoTrabajo, RiesgoTrabajoSchema } from '../riesgos-trabajo/schemas/riesgo-trabajo.schema';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Trabajador.name, schema: TrabajadorSchema },
      { name: Antidoping.name, schema: AntidopingSchema },
      { name: AptitudPuesto.name, schema: AptitudPuestoSchema },
      { name: Certificado.name, schema: CertificadoSchema },
      { name: DocumentoExterno.name, schema: DocumentoExternoSchema },
      { name: ExamenVista.name, schema: ExamenVistaSchema },
      { name: ExploracionFisica.name, schema: ExploracionFisicaSchema },
      { name: HistoriaClinica.name, schema: HistoriaClinicaSchema },
      { name: NotaMedica.name, schema: NotaMedicaSchema },
      { name: RiesgoTrabajo.name, schema: RiesgoTrabajoSchema },
    ]),
    FilesModule,
  ],
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService],
  exports: [TrabajadoresService]
})
export class TrabajadoresModule {}
