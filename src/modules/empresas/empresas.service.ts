import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { normalizeEmpresaData } from 'src/utils/normalization';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { Antidoping } from '../expedientes/schemas/antidoping.schema';
import { AptitudPuesto } from '../expedientes/schemas/aptitud-puesto.schema';
import { Certificado } from '../expedientes/schemas/certificado.schema';
import { DocumentoExterno } from '../expedientes/schemas/documento-externo.schema';
import { ExamenVista } from '../expedientes/schemas/examen-vista.schema';
import { ExploracionFisica } from '../expedientes/schemas/exploracion-fisica.schema';
import { HistoriaClinica } from '../expedientes/schemas/historia-clinica.schema';
import { NotaMedica } from '../expedientes/schemas/nota-medica.schema';
import { CentrosTrabajoService } from '../centros-trabajo/centros-trabajo.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectModel(Empresa.name) private empresaModel: Model<Empresa>,
    @InjectModel(CentroTrabajo.name)
    private centroTrabajoModel: Model<CentroTrabajo>,
    @InjectModel(Trabajador.name) private trabajadorModel: Model<Trabajador>,
    @InjectModel(Antidoping.name) private antidopingModel: Model<Antidoping>,
    @InjectModel(AptitudPuesto.name) private aptitudModel: Model<AptitudPuesto>,
    @InjectModel(Certificado.name) private certificadoModel: Model<Certificado>,
    @InjectModel(DocumentoExterno.name)
    private documentoExternoModel: Model<DocumentoExterno>,
    @InjectModel(ExamenVista.name) private examenVistaModel: Model<ExamenVista>,
    @InjectModel(ExploracionFisica.name)
    private exploracionFisicaModel: Model<ExploracionFisica>,
    @InjectModel(HistoriaClinica.name)
    private historiaClinicaModel: Model<HistoriaClinica>,
    @InjectModel(NotaMedica.name) private notaMedicaModel: Model<NotaMedica>,
    @InjectModel('User') private userModel: Model<User>,
    private centrosTrabajoService: CentrosTrabajoService,
  ) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const normalizedDto = normalizeEmpresaData(createEmpresaDto);
    const createdEmpresa = new this.empresaModel(normalizedDto);
    return createdEmpresa.save();
  }

  async findAll(idProveedorSalud: string, userId?: string): Promise<Empresa[]> {
    // Si se proporciona userId, verificar permisos del usuario
    if (userId) {
      const user = await this.userModel.findById(userId).exec();
      if (user && user.role === 'Principal') {
        // Usuario Principal ve todas las empresas del proveedor
        return this.empresaModel
          .find({ idProveedorSalud: idProveedorSalud })
          .sort({ nombreComercial: 1 })
          .exec();
      } else if (user) {
        // Verificar si tiene permiso de acceso completo
        if (user.permisos?.accesoCompletoEmpresasCentros) {
          // Usuario con permiso completo ve todas las empresas del proveedor
          return this.empresaModel
            .find({ idProveedorSalud: idProveedorSalud })
            .sort({ nombreComercial: 1 })
            .exec();
        } else {
          // Otros usuarios solo ven empresas asignadas
          return this.empresaModel
            .find({
              _id: { $in: user.empresasAsignadas || [] },
              idProveedorSalud: idProveedorSalud,
            })
            .sort({ nombreComercial: 1 })
            .exec();
        }
      }
    }

    // Comportamiento por defecto: todas las empresas del proveedor
    return this.empresaModel
      .find({ idProveedorSalud: idProveedorSalud })
      .sort({ nombreComercial: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Empresa> {
    return this.empresaModel.findById(id).exec();
  }

  async update(
    id: string,
    updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<Empresa> {
    const normalizedDto = normalizeEmpresaData(updateEmpresaDto);
    return this.empresaModel
      .findByIdAndUpdate(id, normalizedDto, { new: true })
      .exec();
  }

  // async remove(id: string): Promise<boolean> {
  //   const result = await this.empresaModel.findByIdAndDelete(id).exec();
  //   return result !== null;
  // }

  async remove(id: string): Promise<boolean> {
    const session = await this.empresaModel.db.startSession();

    try {
      await session.withTransaction(async () => {
        console.log(`[DEBUG] Iniciando eliminación de Empresa con ID: ${id}`);

        const centrosTrabajo = await this.centroTrabajoModel
          .find({ idEmpresa: id })
          .session(session)
          .exec();
        console.log(
          `[DEBUG] Eliminando ${centrosTrabajo.length} Centros de Trabajo...`,
        );

        if (centrosTrabajo.length > 0) {
          const resultadosEliminacion = await Promise.all(
            centrosTrabajo.map(async (centro) =>
              this.centrosTrabajoService.remove(centro._id.toString()),
            ),
          );

          if (resultadosEliminacion.includes(false)) {
            throw new Error('Error en la eliminación de Centros de Trabajo.');
          }
        }

        // console.log(`[DEBUG] Eliminando Empresa de la base de datos...`);
        const result = await this.empresaModel
          .findByIdAndDelete(id)
          .session(session);

        if (!result) {
          throw new Error('No se pudo eliminar la Empresa.');
        }

        console.log(`[DEBUG] Eliminación de la Empresa completada con éxito.`);
      });

      session.endSession();
      return true;
    } catch (error) {
      console.error(
        `[ERROR] Error al eliminar la Empresa y sus dependencias: ${error.message}`,
      );
      session.endSession();
      return false;
    }
  }
}
