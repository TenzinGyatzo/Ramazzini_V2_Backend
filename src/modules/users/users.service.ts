import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('HistoriaClinica') private historiaClinicaModel: Model<any>,
    @InjectModel('AptitudPuesto') private aptitudModel: Model<any>,
    @InjectModel('ExploracionFisica') private exploracionFisicaModel: Model<any>,
    @InjectModel('ExamenVista') private examenVistaModel: Model<any>,
    @InjectModel('Audiometria') private audiometriaModel: Model<any>,
    @InjectModel('Antidoping') private antidopingModel: Model<any>,
    @InjectModel('NotaMedica') private notaMedicaModel: Model<any>,
    @InjectModel('DocumentoExterno') private documentoExternoModel: Model<any>,
    @InjectModel('ProveedorSalud') private proveedorSaludModel: Model<any>,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    return await user.save();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ token }).exec();
  }

  async findById(id: string, selectFields: string = ''): Promise<UserDocument | null> {
    return this.userModel.findById(id).select(selectFields).exec();
  }

  async findByProveedorSaludId(idProveedorSalud: string): Promise<UserDocument[] | null> {
    return this.userModel.find({ idProveedorSalud }).exec();
  }

  async removeUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOneAndDelete({ email }).exec();
  }

  async updateUserPermissions(userId: string, permisos: any): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { permisos } },
      { new: true }
    ).exec();
  }

  async toggleAccountStatus(userId: string, cuentaActiva: boolean): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { cuentaActiva } },
      { new: true }
    ).exec();
  }

        // Métodos para estadísticas de productividad
        async getProductivityStatsByProveedor(idProveedorSalud: string, fechaInicio?: string, fechaFin?: string) {
          try {
            // Obtener todos los usuarios del proveedor
            const usuarios = await this.userModel.find({ idProveedorSalud }).exec();

            const usuariosConEstadisticas = await Promise.all(
              usuarios.map(async (usuario) => {
                const estadisticas = await this.getUserDetailedStats(usuario._id.toString(), fechaInicio, fechaFin);
                return {
                  _id: usuario._id,
                  username: usuario.username,
                  email: usuario.email,
                  role: usuario.role,
                  productividad: estadisticas
                };
              })
            );

            return usuariosConEstadisticas;
          } catch (error) {
            console.error('Error al obtener estadísticas de productividad:', error);
            throw error;
          }
        }

        async getUserDetailedStats(userId: string, fechaInicio?: string, fechaFin?: string) {
          try {
            // Construir filtro de fecha si se proporcionan fechas
            const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
            
            // Contar documentos por tipo para el usuario con filtro de fecha
            const [
              totalAptitudes,
              totalHistoriasClinicas,
              totalExploracionesFisicas,
              totalExamenesVista,
              totalAudiometrias,
              totalAntidopings,
              totalNotasMedicas,
              totalDocumentosExternos,
              ultimoDocumento
            ] = await Promise.all([
              this.aptitudModel.countDocuments({ createdBy: userId, ...filtroFecha }).exec(),
              this.historiaClinicaModel.countDocuments({ createdBy: userId, ...filtroFecha }).exec(),
              this.exploracionFisicaModel.countDocuments({ createdBy: userId, ...filtroFecha }).exec(),
              this.examenVistaModel.countDocuments({ createdBy: userId, ...filtroFecha }).exec(),
              this.audiometriaModel.countDocuments({ createdBy: userId, ...filtroFecha }).exec(),
              this.antidopingModel.countDocuments({ createdBy: userId, ...filtroFecha }).exec(),
              this.notaMedicaModel.countDocuments({ createdBy: userId, ...filtroFecha }).exec(),
              this.documentoExternoModel.countDocuments({ createdBy: userId, ...filtroFecha }).exec(),
              this.getUltimoDocumentoUsuario(userId, fechaInicio, fechaFin)
            ]);

            const totalDocumentos = totalAptitudes + totalHistoriasClinicas +
                                   totalExploracionesFisicas + totalExamenesVista +
                                   totalAudiometrias + totalAntidopings + totalNotasMedicas + totalDocumentosExternos;

            return {
              totalAptitudes,
              totalHistoriasClinicas,
              totalExploracionesFisicas,
              totalExamenesVista,
              totalAudiometrias,
              totalAntidopings,
              totalNotasMedicas,
              totalDocumentosExternos,
              totalDocumentos,
              ultimoInforme: ultimoDocumento ? ultimoDocumento.createdAt : null
            };
          } catch (error) {
            console.error('Error al obtener estadísticas del usuario:', error);
            throw error;
          }
        }

        private async getUltimoDocumentoUsuario(userId: string, fechaInicio?: string, fechaFin?: string) {
          try {
            // Construir filtro de fecha si se proporcionan fechas
            const filtroFecha = this.construirFiltroFecha(fechaInicio, fechaFin);
            
            // Buscar el documento más reciente creado por el usuario
            const modelos = [
              this.aptitudModel,
              this.historiaClinicaModel,
              this.exploracionFisicaModel,
              this.examenVistaModel,
              this.audiometriaModel,
              this.antidopingModel,
              this.notaMedicaModel,
              this.documentoExternoModel
            ];

            const ultimosDocumentos = await Promise.all(
              modelos.map(modelo =>
                modelo.findOne({ createdBy: userId, ...filtroFecha })
                      .sort({ createdAt: -1 })
                      .select('createdAt')
                      .exec()
              )
            );

            // Encontrar el más reciente
            const documentosConFecha = ultimosDocumentos.filter(doc => doc !== null);
            if (documentosConFecha.length === 0) return null;

            return documentosConFecha.reduce((masReciente, actual) =>
              new Date(actual.createdAt) > new Date(masReciente.createdAt) ? actual : masReciente
            );
          } catch (error) {
            console.error('Error al obtener último documento:', error);
            return null;
          }
        }

        // Función auxiliar para construir el filtro de fecha
        private construirFiltroFecha(fechaInicio?: string, fechaFin?: string) {
          const filtro: any = {};
          
          if (fechaInicio && fechaFin) {
            // Convertir fechas a objetos Date
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            
            // Establecer hora de inicio al comienzo del día
            inicio.setHours(0, 0, 0, 0);
            
            // Establecer hora de fin al final del día
            fin.setHours(23, 59, 59, 999);
            
            filtro.createdAt = {
              $gte: inicio,
              $lte: fin
            };
          } else if (fechaInicio) {
            // Solo fecha de inicio
            const inicio = new Date(fechaInicio);
            inicio.setHours(0, 0, 0, 0);
            filtro.createdAt = { $gte: inicio };
          } else if (fechaFin) {
            // Solo fecha de fin
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);
            filtro.createdAt = { $lte: fin };
          }
          
          return filtro;
        }

        // Método para obtener estadísticas de todos los usuarios del sistema (solo para administradores)
        async getAllProductivityStats(fechaInicio?: string, fechaFin?: string) {
          try {
            // Obtener todos los usuarios del sistema
            const usuarios = await this.userModel.find({}).exec();

            const usuariosConEstadisticas = await Promise.all(
              usuarios.map(async (usuario) => {
                const estadisticas = await this.getUserDetailedStats(usuario._id.toString(), fechaInicio, fechaFin);
                
                // Obtener información del proveedor de salud
                let proveedorNombre = 'Sin proveedor';
                if (usuario.idProveedorSalud) {
                  try {
                    const proveedor = await this.proveedorSaludModel.findById(usuario.idProveedorSalud).select('nombre').exec();
                    if (proveedor) {
                      proveedorNombre = proveedor.nombre;
                    }
                  } catch (error) {
                    console.error('Error al obtener nombre del proveedor:', error);
                  }
                }

                return {
                  _id: usuario._id,
                  username: usuario.username,
                  email: usuario.email,
                  role: usuario.role,
                  idProveedorSalud: usuario.idProveedorSalud,
                  proveedorNombre,
                  productividad: estadisticas
                };
              })
            );

            return usuariosConEstadisticas;
          } catch (error) {
            console.error('Error al obtener estadísticas de productividad de todos los usuarios:', error);
            throw error;
          }
        }
}

