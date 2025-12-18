import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { CreateProveedoresSaludDto } from './dto/create-proveedores-salud.dto';
import { UpdateProveedoresSaludDto } from './dto/update-proveedores-salud.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProveedorSalud } from './schemas/proveedor-salud.schema';
import { Model, Types } from 'mongoose';
import { normalizeProveedorSaludData } from 'src/utils/normalization';
import { NOM024ComplianceUtil } from 'src/utils/nom024-compliance.util';
import { CatalogsService } from '../catalogs/catalogs.service';

@Injectable()
export class ProveedoresSaludService {
  constructor(
    @InjectModel(ProveedorSalud.name) private proveedoresSaludModel: Model<ProveedorSalud>,
    @Inject(forwardRef(() => NOM024ComplianceUtil))
    private nom024Util: NOM024ComplianceUtil,
    private catalogsService: CatalogsService,
  ) {}

  /**
   * Validate CLUES according to NOM-024 requirements (MX providers only)
   * Used for update operations where we have the proveedorSaludId
   */
  private async validateCLUESForMX(clues: string | undefined, proveedorSaludId: string): Promise<void> {
    const requiresCompliance = await this.nom024Util.requiresNOM024Compliance(proveedorSaludId);

    if (requiresCompliance) {
      // MX provider: CLUES is mandatory and must be valid
      if (!clues || clues.trim() === '') {
        throw new BadRequestException('CLUES es obligatorio para proveedores de salud en México (NOM-024)');
      }

      const normalizedClues = clues.trim().toUpperCase();

      // Validate format (11 alphanumeric characters)
      if (!/^[A-Z0-9]{11}$/.test(normalizedClues)) {
        throw new BadRequestException('CLUES debe tener exactamente 11 caracteres alfanuméricos');
      }

      // Validate against catalog
      const isValid = await this.catalogsService.validateCLUES(normalizedClues);
      if (!isValid) {
        throw new BadRequestException(`CLUES inválido: ${normalizedClues}. No se encuentra en el catálogo de establecimientos de salud`);
      }

      // Validate that establishment is in operation
      const isInOperation = await this.catalogsService.validateCLUESInOperation(normalizedClues);
      if (!isInOperation) {
        const cluesEntry = await this.catalogsService.getCLUESEntry(normalizedClues);
        const estatus = cluesEntry?.estatus || 'Desconocido';
        throw new BadRequestException(`CLUES ${normalizedClues} no está en operación. Estatus actual: ${estatus}`);
      }
    } else {
      // Non-MX provider: CLUES is optional, but if provided, validate format
      if (clues && clues.trim() !== '') {
        const normalizedClues = clues.trim().toUpperCase();
        if (!/^[A-Z0-9]{11}$/.test(normalizedClues)) {
          throw new BadRequestException('CLUES debe tener exactamente 11 caracteres alfanuméricos');
        }
        // For non-MX, we don't validate against catalog (backward compatibility)
      }
    }
  }

  async create(createProveedoresSaludDto: CreateProveedoresSaludDto): Promise<ProveedorSalud> {
    const normalizedDto = normalizeProveedorSaludData(createProveedoresSaludDto);

    // Validate CLUES for MX providers
    // Check directly from pais field since we're creating a new provider
    const isMX = normalizedDto.pais && normalizedDto.pais.toUpperCase() === 'MX';
    
    if (isMX) {
      // MX provider: CLUES is mandatory and must be valid
      if (!normalizedDto.clues || normalizedDto.clues.trim() === '') {
        throw new BadRequestException('CLUES es obligatorio para proveedores de salud en México (NOM-024)');
      }

      const normalizedClues = normalizedDto.clues.trim().toUpperCase();

      // Validate format (11 alphanumeric characters)
      if (!/^[A-Z0-9]{11}$/.test(normalizedClues)) {
        throw new BadRequestException('CLUES debe tener exactamente 11 caracteres alfanuméricos');
      }

      // Validate against catalog
      const isValid = await this.catalogsService.validateCLUES(normalizedClues);
      if (!isValid) {
        throw new BadRequestException(`CLUES inválido: ${normalizedClues}. No se encuentra en el catálogo de establecimientos de salud`);
      }

      // Validate that establishment is in operation
      const isInOperation = await this.catalogsService.validateCLUESInOperation(normalizedClues);
      if (!isInOperation) {
        const cluesEntry = await this.catalogsService.getCLUESEntry(normalizedClues);
        const estatus = cluesEntry?.estatus || 'Desconocido';
        throw new BadRequestException(`CLUES ${normalizedClues} no está en operación. Estatus actual: ${estatus}`);
      }

      normalizedDto.clues = normalizedClues;
    } else if (normalizedDto.clues) {
      // Non-MX but CLUES provided: validate format only
      const normalizedClues = normalizedDto.clues.trim().toUpperCase();
      if (!/^[A-Z0-9]{11}$/.test(normalizedClues)) {
        throw new BadRequestException('CLUES debe tener exactamente 11 caracteres alfanuméricos');
      }
      normalizedDto.clues = normalizedClues;
    }

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
  async update(id: string, updateDto: UpdateProveedoresSaludDto): Promise<ProveedorSalud> {
    const proveedor = await this.proveedoresSaludModel.findById(id);
    if (!proveedor) throw new Error('Proveedor de salud no encontrado');

    const normalizedDto = normalizeProveedorSaludData(updateDto);

    // Validate CLUES for MX providers
    // Use current proveedor.pais or updated pais from DTO
    const paisToCheck = normalizedDto.pais || proveedor.pais;
    const isMX = paisToCheck && paisToCheck.toUpperCase() === 'MX';
    
    if (isMX) {
      // Use current CLUES if not being updated, otherwise use new CLUES
      const cluesToValidate = normalizedDto.clues !== undefined ? normalizedDto.clues : proveedor.clues;
      await this.validateCLUESForMX(cluesToValidate, id);
      
      // Normalize CLUES if being updated
      if (normalizedDto.clues) {
        normalizedDto.clues = normalizedDto.clues.trim().toUpperCase();
      }
    } else if (normalizedDto.clues) {
      // Non-MX but CLUES provided: validate format only
      const normalizedClues = normalizedDto.clues.trim().toUpperCase();
      if (!/^[A-Z0-9]{11}$/.test(normalizedClues)) {
        throw new BadRequestException('CLUES debe tener exactamente 11 caracteres alfanuméricos');
      }
      normalizedDto.clues = normalizedClues;
    }

    // Normalize CLUES to uppercase if provided
    if (normalizedDto.clues) {
      normalizedDto.clues = normalizedDto.clues.trim().toUpperCase();
    }

    // ✅ Asegura que también se actualicen los valores vacíos como ""
    for (const key in normalizedDto) {
      proveedor[key] = normalizedDto[key];
    }

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

  async getTodasHistoriasClinicas(idProveedorSalud: string) {
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

  async getTodasNotasMedicas(idProveedorSalud: string) {
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

  // **Métodos para reglas de puntaje**
  async getReglasPuntaje(idProveedorSalud: string) {
    const proveedor = await this.proveedoresSaludModel.findById(idProveedorSalud).select('reglasPuntaje').exec();
    
    if (!proveedor) {
      throw new Error('Proveedor de salud no encontrado');
    }

    // Si no tiene reglas configuradas, devolver las por defecto
    if (!proveedor.reglasPuntaje) {
      return {
        aptitudes: 3,
        historias: 1,
        exploraciones: 1,
        examenesVista: 1,
        audiometrias: 1,
        antidopings: 1,
        notas: 2,
        externos: 0
      };
    }

    return proveedor.reglasPuntaje;
  }

  async updateReglasPuntaje(idProveedorSalud: string, reglasPuntaje: {
    aptitudes: number;
    historias: number;
    exploraciones: number;
    examenesVista: number;
    audiometrias: number;
    antidopings: number;
    notas: number;
    externos: number;
  }) {
    const proveedor = await this.proveedoresSaludModel.findByIdAndUpdate(
      idProveedorSalud,
      { reglasPuntaje },
      { new: true }
    ).exec();

    if (!proveedor) {
      throw new Error('Proveedor de salud no encontrado');
    }

    return proveedor.reglasPuntaje;
  }

  
}
