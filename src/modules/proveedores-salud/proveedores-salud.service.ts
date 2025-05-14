import { Injectable } from '@nestjs/common';
import { CreateProveedoresSaludDto } from './dto/create-proveedores-salud.dto';
import { UpdateProveedoresSaludDto } from './dto/update-proveedores-salud.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProveedorSalud } from './schemas/proveedor-salud.schema';
import { Model, Types } from 'mongoose';
import { normalizeProveedorSaludData } from 'src/utils/normalization';

@Injectable()
export class ProveedoresSaludService {
  constructor(@InjectModel(ProveedorSalud.name) private proveedoresSaludModel: Model<ProveedorSalud>) {}

  async create(createProveedoresSaludDto: CreateProveedoresSaludDto): Promise<ProveedorSalud> {
    const normalizedDto = normalizeProveedorSaludData(createProveedoresSaludDto);
    const createdProveedorSalud = new this.proveedoresSaludModel(normalizedDto);
    return createdProveedorSalud.save();
  }

  async findAll(): Promise<ProveedorSalud[]> {
    return this.proveedoresSaludModel.find().exec();
  }

  async findOne(id: string): Promise<ProveedorSalud> {
    return this.proveedoresSaludModel.findById(id).exec();
  }

  // **Método para actualizar un proveedor de salud**
  /* async update(id: string, updateProveedoresSaludDto: UpdateProveedoresSaludDto): Promise<ProveedorSalud> {
    const normalizedDto = normalizeProveedorSaludData(updateProveedoresSaludDto);
    return this.proveedoresSaludModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  } */

  // **Método para actualizar los campos de uno por uno**
  async update(id: string, updateProveedoresSaludDto: UpdateProveedoresSaludDto): Promise<ProveedorSalud> {
    const proveedor = await this.proveedoresSaludModel.findById(id);
  
    if (!proveedor) {
      throw new Error('Proveedor de salud no encontrado');
    }

    const normalizedDto = normalizeProveedorSaludData(updateProveedoresSaludDto);
  
    // Actualizar solo los campos proporcionados en el DTO
    Object.keys(normalizedDto).forEach(key => {
      if (normalizedDto[key] !== undefined) {
        proveedor[key] = normalizedDto[key];
      }
    });
  
    return proveedor.save();
  }
  
  async remove(id: string): Promise<boolean> {
    const result = await this.proveedoresSaludModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async getTopEmpresasByWorkers(idProveedorSalud: string, limit = 3) {
    return await this.proveedoresSaludModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(idProveedorSalud) } // Filtrar solo por el proveedor de salud
      },
      {
        $lookup: {
          from: 'empresas', // Unir con las empresas del proveedor
          localField: '_id',
          foreignField: 'idProveedorSalud', // Relación con proveedor
          as: 'empresas'
        }
      },
      {
        $unwind: { path: '$empresas', preserveNullAndEmptyArrays: true } // Descomponer las empresas
      },
      {
        $lookup: {
          from: 'centrotrabajos', // Unir con los centros de trabajo
          localField: 'empresas._id',
          foreignField: 'idEmpresa',
          as: 'centros'
        }
      },
      {
        $unwind: { path: '$centros', preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: 'trabajadors', // Unir con los trabajadores
          localField: 'centros._id',
          foreignField: 'idCentroTrabajo',
          as: 'trabajadores'
        }
      },
      {
        $group: {
          _id: '$empresas._id', // Agrupar por empresa
          nombreComercial: { $first: '$empresas.nombreComercial' }, // Tomar el nombre de la empresa
          totalTrabajadores: { $sum: { $size: '$trabajadores' } } // Contar los trabajadores
        }
      },
      {
        $sort: { totalTrabajadores: -1 }
      },
      {
        $limit: limit
      }
    ]);
  }

  async getHistoriasClinicasDelMes(idProveedorSalud: string) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await this.proveedoresSaludModel.aggregate([
        {
            $match: { _id: new Types.ObjectId(idProveedorSalud) }
        },
        {
            $lookup: {
                from: "empresas",
                localField: "_id",
                foreignField: "idProveedorSalud",
                as: "empresas"
            }
        },
        { $unwind: "$empresas" },
        {
            $lookup: {
                from: "centrotrabajos",
                localField: "empresas._id",
                foreignField: "idEmpresa",
                as: "centros"
            }
        },
        { $unwind: "$centros" },
        {
            $lookup: {
                from: "trabajadors",
                localField: "centros._id",
                foreignField: "idCentroTrabajo",
                as: "trabajadores"
            }
        },
        { $unwind: "$trabajadores" },
        {
            $lookup: {
                from: "historiaclinicas",
                localField: "trabajadores._id",
                foreignField: "idTrabajador",
                as: "historias"
            }
        },
        {
            $project: {
                historias: {
                    $filter: {
                        input: "$historias",
                        as: "historia",
                        cond: {
                            $and: [
                                { $gte: ["$$historia.createdAt", firstDay] },
                                { $lte: ["$$historia.createdAt", lastDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                count: { $size: "$historias" }
            }
        },
        {
            $group: {
                _id: null,
                totalHistoriasClinicas: { $sum: "$count" }
            }
        }
    ]);

    return result.length > 0 ? result[0].totalHistoriasClinicas : 0;
  }
  
  async getNotasMedicasDelMes(idProveedorSalud: string) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await this.proveedoresSaludModel.aggregate([
        {
            $match: { _id: new Types.ObjectId(idProveedorSalud) }
        },
        {
            $lookup: {
                from: "empresas",
                localField: "_id",
                foreignField: "idProveedorSalud",
                as: "empresas"
            }
        },
        { $unwind: "$empresas" },
        {
            $lookup: {
                from: "centrotrabajos",
                localField: "empresas._id",
                foreignField: "idEmpresa",
                as: "centros"
            }
        },
        { $unwind: "$centros" },
        {
            $lookup: {
                from: "trabajadors",
                localField: "centros._id",
                foreignField: "idCentroTrabajo",
                as: "trabajadores"
            }
        },
        { $unwind: "$trabajadores" },
        {
            $lookup: {
                from: "notamedicas",
                localField: "trabajadores._id",
                foreignField: "idTrabajador",
                as: "notas"
            }
        },
        {
            $project: {
                notas: {
                    $filter: {
                        input: "$notas",
                        as: "nota",
                        cond: {
                            $and: [
                                { $gte: ["$$nota.createdAt", firstDay] },
                                { $lte: ["$$nota.createdAt", lastDay] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                count: { $size: "$notas" }
            }
        },
        {
            $group: {
                _id: null,
                totalNotasMedicas: { $sum: "$count" }
            }
        }
    ]);

    return result.length > 0 ? result[0].totalNotasMedicas : 0;
  }
  
}
