/**
 * Helper functions for retrieving firmante information
 * NOM-024 GIIS-B015: Helper to get tipoPersonalId from user
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../../modules/users/schemas/user.schema';
import { MedicoFirmante } from '../../../modules/medicos-firmantes/schemas/medico-firmante.schema';
import { EnfermeraFirmante } from '../../../modules/enfermeras-firmantes/schemas/enfermera-firmante.schema';
import { TecnicoFirmante } from '../../../modules/tecnicos-firmantes/schemas/tecnico-firmante.schema';

@Injectable()
export class FirmanteHelper {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel('MedicoFirmante') private medicoFirmanteModel: Model<MedicoFirmante>,
    @InjectModel('EnfermeraFirmante') private enfermeraFirmanteModel: Model<EnfermeraFirmante>,
    @InjectModel('TecnicoFirmante') private tecnicoFirmanteModel: Model<TecnicoFirmante>,
  ) {}

  /**
   * Gets tipoPersonalId from user using discriminators (optimized lookup)
   * @param userId - User ID
   * @returns tipoPersonalId (number) or null if not found
   */
  async getTipoPersonalFromUser(userId: string): Promise<number | null> {
    try {
      // 1. Obtener User con firmanteTipo/firmanteId
      const user = await this.userModel.findById(userId).lean();

      if (!user) {
        return null;
      }

      // 2. Si tiene discriminadores, usar lookup optimizado
      if (user.firmanteTipo && user.firmanteId) {
        return await this.getTipoPersonalFromFirmante(
          user.firmanteTipo,
          user.firmanteId.toString(),
        );
      }

      // 3. Fallback: buscar en los 3 modelos (compatibilidad hacia atrás)
      const [medico, enfermera, tecnico] = await Promise.all([
        this.medicoFirmanteModel.findOne({ idUser: userId }).lean(),
        this.enfermeraFirmanteModel.findOne({ idUser: userId }).lean(),
        this.tecnicoFirmanteModel.findOne({ idUser: userId }).lean(),
      ]);

      if (medico) {
        return medico.tipoPersonalId || null;
      }
      if (enfermera) {
        return enfermera.tipoPersonalId || null;
      }
      if (tecnico) {
        return tecnico.tipoPersonalId || null;
      }

      return null;
    } catch (error) {
      console.error('Error getting tipoPersonal from user:', error);
      return null;
    }
  }

  /**
   * Gets tipoPersonalId from firmante by type and ID
   * @param firmanteTipo - Type of firmante ('MedicoFirmante', 'EnfermeraFirmante', 'TecnicoFirmante')
   * @param firmanteId - Firmante ID
   * @returns tipoPersonalId (number) or null if not found
   */
  private async getTipoPersonalFromFirmante(
    firmanteTipo: string,
    firmanteId: string,
  ): Promise<number | null> {
    try {
      let firmante: any = null;

      switch (firmanteTipo) {
        case 'MedicoFirmante':
          firmante = await this.medicoFirmanteModel.findById(firmanteId).lean();
          break;
        case 'EnfermeraFirmante':
          firmante = await this.enfermeraFirmanteModel.findById(firmanteId).lean();
          break;
        case 'TecnicoFirmante':
          firmante = await this.tecnicoFirmanteModel.findById(firmanteId).lean();
          break;
        default:
          return null;
      }

      return firmante?.tipoPersonalId || null;
    } catch (error) {
      console.error('Error getting tipoPersonal from firmante:', error);
      return null;
    }
  }
}

