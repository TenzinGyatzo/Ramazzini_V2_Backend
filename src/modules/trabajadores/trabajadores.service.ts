import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trabajador } from './entities/trabajador.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { normalizeTrabajadorData } from 'src/utils/normalization'
import * as moment from 'moment';

@Injectable()
export class TrabajadoresService {
  constructor(@InjectModel(Trabajador.name) private trabajadorModel: Model<Trabajador>) {}

  async create(createTrabajadorDto: CreateTrabajadorDto): Promise<Trabajador> {
    const normalizedDto = normalizeTrabajadorData(createTrabajadorDto);
    const createdTrabajador = new this.trabajadorModel(normalizedDto);
    return await createdTrabajador.save();
  }

  async findWorkersByCenter(id: string): Promise<Trabajador[]> {
    return await this.trabajadorModel.find({ idCentroTrabajo: id }).exec();
  }

  async findOne(id: string): Promise<Trabajador> {
    return await this.trabajadorModel.findById(id).exec();
  }

  async update(id: string, updateTrabajadorDto: UpdateTrabajadorDto): Promise<Trabajador> {
    const normalizedDto = normalizeTrabajadorData(updateTrabajadorDto);
    return await this.trabajadorModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  }

  private processWorkerData(worker) {
      return {
        nombre: worker.nombre ? String(worker.nombre).trim() : '',
        fechaNacimiento: moment(worker.fechaNacimiento, 'DD/MM/YYYY').isValid() 
            ? moment(worker.fechaNacimiento, 'DD/MM/YYYY').toDate()  // Conversión a Date
            : null,
        sexo: worker.sexo ? String(worker.sexo).trim() : '',
        escolaridad: worker.escolaridad ? String(worker.escolaridad).trim() : '',
        puesto: worker.puesto ? String(worker.puesto).trim() : '',
        fechaIngreso: moment(worker.fechaIngreso, 'DD/MM/YYYY').isValid()
            ? moment(worker.fechaIngreso, 'DD/MM/YYYY').toDate()  // Conversión a Date
            : null,
        telefono: worker.telefono ? String(worker.telefono).trim() : '',
        estadoCivil: worker.estadoCivil ? String(worker.estadoCivil).trim() : '',
        hijos: worker.hijos || 0,
        idCentroTrabajo: worker.idCentroTrabajo,
        createdBy: worker.createdBy,
        updatedBy: worker.updatedBy
    };
  }

  // Método para importar trabajadores
  async importarTrabajadores(data: any[], idCentroTrabajo: string, createdBy: string) {
      const resultados = [];
      
      for (const worker of data) {
          // Procesa cada trabajador usando `processWorkerData`
          const processedWorker = this.processWorkerData({
              ...worker,
              idCentroTrabajo,
              createdBy,
              updatedBy: createdBy
          });

          try {
              const nuevoTrabajador = await this.create(processedWorker);
              resultados.push({ success: true, worker: nuevoTrabajador });
          } catch (error) {
              console.error(`Error al crear el trabajador ${worker.nombre}:`, error.message);
              resultados.push({ success: false, error: error.message, worker });
          }
      }

      return { message: 'Trabajadores importados exitosamente', data: resultados };
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.trabajadorModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
