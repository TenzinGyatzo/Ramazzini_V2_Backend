import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResultadoClinico, TipoEstudio } from './schemas/resultado-clinico.schema';
import { CreateResultadoClinicoDto } from './dto/create-resultado-clinico.dto';
import { UpdateResultadoClinicoDto } from './dto/update-resultado-clinico.dto';

@Injectable()
export class ResultadosClinicosService {
  constructor(
    @InjectModel(ResultadoClinico.name)
    private resultadoClinicoModel: Model<ResultadoClinico>,
  ) {}

  async create(createDto: CreateResultadoClinicoDto): Promise<ResultadoClinico> {
    if (createDto.tipoEstudio !== TipoEstudio.TIPO_SANGRE && !createDto.resultadoGlobal) {
      throw new BadRequestException('El resultado global es requerido para estudios de gabinete.');
    }
    // Calcular año del estudio si no viene en el DTO
    const fechaEstudio = new Date(createDto.fechaEstudio);
    const anioEstudio = fechaEstudio.getFullYear();

    const resultadoClinico = new this.resultadoClinicoModel({
      ...createDto,
      anioEstudio,
    });

    return await resultadoClinico.save();
  }

  async findAll(): Promise<ResultadoClinico[]> {
    return await this.resultadoClinicoModel.find().exec();
  }

  async findByTrabajador(
    trabajadorId: string,
    tipoEstudio?: string,
  ): Promise<ResultadoClinico[]> {
    const query: any = { idTrabajador: trabajadorId };

    if (tipoEstudio) {
      query.tipoEstudio = tipoEstudio;
    }

    return await this.resultadoClinicoModel.find(query).sort({ fechaEstudio: -1 }).exec();
  }

  async findByTrabajadorGroupedByYear(
    trabajadorId: string,
  ): Promise<Record<number, ResultadoClinico[]>> {
    const resultados = await this.resultadoClinicoModel
      .find({ idTrabajador: trabajadorId })
      .sort({ fechaEstudio: -1 })
      .exec();

    // Agrupar por año
    const agrupados: Record<number, ResultadoClinico[]> = {};

    resultados.forEach((resultado) => {
      const anio = resultado.anioEstudio;
      if (!agrupados[anio]) {
        agrupados[anio] = [];
      }
      agrupados[anio].push(resultado);
    });

    return agrupados;
  }

  async findOne(id: string): Promise<ResultadoClinico> {
    const resultado = await this.resultadoClinicoModel.findById(id).exec();

    if (!resultado) {
      throw new NotFoundException(`Resultado clínico con ID ${id} no encontrado`);
    }

    return resultado;
  }

  async update(
    id: string,
    updateDto: UpdateResultadoClinicoDto,
  ): Promise<ResultadoClinico> {
    // Crear objeto de actualización sin modificar el DTO original
    const updateData: any = { ...updateDto };

    // Recalcular año si se actualiza la fecha
    if (updateDto.fechaEstudio) {
      const fechaEstudio = new Date(updateDto.fechaEstudio);
      updateData.anioEstudio = fechaEstudio.getFullYear();
    }

    const resultado = await this.resultadoClinicoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!resultado) {
      throw new NotFoundException(`Resultado clínico con ID ${id} no encontrado`);
    }

    return resultado;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.resultadoClinicoModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Resultado clínico con ID ${id} no encontrado`);
    }

    return true;
  }
}
