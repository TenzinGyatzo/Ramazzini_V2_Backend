import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResultadoClinico, TipoEstudio } from './schemas/resultado-clinico.schema';
import { CreateResultadoClinicoDto } from './dto/create-resultado-clinico.dto';
import { UpdateResultadoClinicoDto } from './dto/update-resultado-clinico.dto';
import { DocumentoExterno } from '../expedientes/schemas/documento-externo.schema';

@Injectable()
export class ResultadosClinicosService {
  constructor(
    @InjectModel(ResultadoClinico.name)
    private resultadoClinicoModel: Model<ResultadoClinico>,
    @InjectModel(DocumentoExterno.name)
    private documentoExternoModel: Model<DocumentoExterno>,
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
      .populate({
        path: 'idDocumentoExterno',
        select: 'nombreDocumento fechaDocumento extension',
      })
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
    const resultado = await this.resultadoClinicoModel.findById(id).exec();

    if (!resultado) {
      throw new NotFoundException(`Resultado clínico con ID ${id} no encontrado`);
    }

    // Si tiene documento vinculado, limpiar la relación en el documento
    if (resultado.idDocumentoExterno) {
      await this.documentoExternoModel.findByIdAndUpdate(
        resultado.idDocumentoExterno,
        { $unset: { idResultadoClinico: '' } },
      ).exec();
    }

    await this.resultadoClinicoModel.findByIdAndDelete(id).exec();

    return true;
  }

  async vincularDocumento(
    resultadoId: string,
    documentoId: string,
  ): Promise<ResultadoClinico> {
    // Validar que existan ambos documentos
    const resultado = await this.resultadoClinicoModel.findById(resultadoId).exec();
    if (!resultado) {
      throw new NotFoundException(`Resultado clínico con ID ${resultadoId} no encontrado`);
    }

    const documento = await this.documentoExternoModel.findById(documentoId).exec();
    if (!documento) {
      throw new NotFoundException(`Documento externo con ID ${documentoId} no encontrado`);
    }

    // Verificar que pertenezcan al mismo trabajador
    if (resultado.idTrabajador.toString() !== documento.idTrabajador.toString()) {
      throw new BadRequestException('El resultado y el documento deben pertenecer al mismo trabajador');
    }

    // Si el resultado ya tiene un documento vinculado, limpiar la relación previa
    if (resultado.idDocumentoExterno) {
      await this.documentoExternoModel.findByIdAndUpdate(
        resultado.idDocumentoExterno,
        { $unset: { idResultadoClinico: '' } },
      ).exec();
    }

    // Si el documento ya tiene un resultado vinculado, limpiar la relación previa
    if (documento.idResultadoClinico) {
      await this.resultadoClinicoModel.findByIdAndUpdate(
        documento.idResultadoClinico,
        { $unset: { idDocumentoExterno: '' } },
      ).exec();
    }

    // Vincular en ambos lados
    resultado.idDocumentoExterno = documento._id as any;
    await resultado.save();

    documento.idResultadoClinico = resultado._id as any;
    await documento.save();

    return await this.resultadoClinicoModel
      .findById(resultadoId)
      .populate({
        path: 'idDocumentoExterno',
        select: 'nombreDocumento fechaDocumento extension',
      })
      .exec();
  }

  async desvincularDocumento(resultadoId: string): Promise<ResultadoClinico> {
    const resultado = await this.resultadoClinicoModel.findById(resultadoId).exec();

    if (!resultado) {
      throw new NotFoundException(`Resultado clínico con ID ${resultadoId} no encontrado`);
    }

    if (!resultado.idDocumentoExterno) {
      throw new BadRequestException('El resultado no tiene un documento vinculado');
    }

    // Limpiar la relación en el documento
    await this.documentoExternoModel.findByIdAndUpdate(
      resultado.idDocumentoExterno,
      { $unset: { idResultadoClinico: '' } },
    ).exec();

    // Limpiar la relación en el resultado
    resultado.idDocumentoExterno = undefined;
    await resultado.save();

    return resultado;
  }
}
