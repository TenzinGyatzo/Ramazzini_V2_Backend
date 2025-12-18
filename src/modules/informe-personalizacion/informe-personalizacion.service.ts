import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InformePersonalizacion,
  InformePersonalizacionDocument,
} from './schemas/informe-personalizacion.schema';
import {
  CreateInformePersonalizacionDto,
  UpdateInformePersonalizacionDto,
} from './dto/informe-personalizacion.dto';

@Injectable()
export class InformePersonalizacionService {
  constructor(
    @InjectModel(InformePersonalizacion.name)
    private informePersonalizacionModel: Model<InformePersonalizacionDocument>,
  ) {}

  async create(
    createDto: CreateInformePersonalizacionDto,
  ): Promise<InformePersonalizacion> {
    const informePersonalizacion = new this.informePersonalizacionModel(
      createDto,
    );
    return informePersonalizacion.save();
  }

  async findByEmpresaAndCentro(
    idEmpresa: string,
    idCentroTrabajo?: string,
  ): Promise<InformePersonalizacion | null> {
    const query: any = { idEmpresa };

    if (idCentroTrabajo) {
      query.idCentroTrabajo = idCentroTrabajo;
    }

    return this.informePersonalizacionModel.findOne(query).exec();
  }

  async findByEmpresa(idEmpresa: string): Promise<InformePersonalizacion[]> {
    return this.informePersonalizacionModel.find({ idEmpresa }).exec();
  }

  async update(
    id: string,
    updateDto: UpdateInformePersonalizacionDto,
  ): Promise<InformePersonalizacion> {
    const informePersonalizacion = await this.informePersonalizacionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!informePersonalizacion) {
      throw new NotFoundException('Personalización de informe no encontrada');
    }

    return informePersonalizacion;
  }

  async upsertByEmpresaAndCentro(
    idEmpresa: string,
    idCentroTrabajo: string | undefined,
    updateDto: UpdateInformePersonalizacionDto,
  ): Promise<InformePersonalizacion> {
    const query: any = { idEmpresa };

    if (idCentroTrabajo) {
      query.idCentroTrabajo = idCentroTrabajo;
    }

    const informePersonalizacion = await this.informePersonalizacionModel
      .findOneAndUpdate(
        query,
        {
          ...updateDto,
          idEmpresa,
          idCentroTrabajo: idCentroTrabajo || undefined,
          createdBy: updateDto.updatedBy,
        },
        {
          upsert: true,
          new: true,
        },
      )
      .exec();

    return informePersonalizacion;
  }

  async delete(id: string): Promise<void> {
    const result = await this.informePersonalizacionModel
      .findByIdAndDelete(id)
      .exec();

    if (!result) {
      throw new NotFoundException('Personalización de informe no encontrada');
    }
  }
}
