import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEnfermeraFirmanteDto } from './dto/create-enfermera-firmante.dto';
import { UpdateEnfermeraFirmanteDto } from './dto/update-enfermera-firmante.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EnfermeraFirmante } from './schemas/enfermera-firmante.schema';
import { Model } from 'mongoose';
import { normalizeEnfermeraFirmanteData } from 'src/utils/normalization';
import { User } from '../users/schemas/user.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';
import { validateCURP } from 'src/utils/curp-validator.util';

@Injectable()
export class EnfermerasFirmantesService {
  constructor(
    @InjectModel(EnfermeraFirmante.name)
    private enfermeraFirmanteModel: Model<EnfermeraFirmante>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(ProveedorSalud.name)
    private proveedorSaludModel: Model<ProveedorSalud>,
  ) {}

  /**
   * Check if a user belongs to a Mexican provider (pais === 'MX')
   */
  private async isMexicanProvider(idUser: string): Promise<boolean> {
    const user = await this.userModel.findById(idUser).exec();
    if (!user || !user.idProveedorSalud) {
      return false;
    }
    const proveedor = await this.proveedorSaludModel
      .findById(user.idProveedorSalud)
      .exec();
    return proveedor?.pais?.toUpperCase() === 'MX';
  }

  /**
   * Validate CURP for NOM-024 compliance
   * - MX providers: CURP is required and must be valid
   * - Non-MX providers: CURP is optional, but if provided must be valid
   */
  private async validateCURPForNOM024(
    curp: string | undefined,
    idUser: string,
  ): Promise<void> {
    const isMX = await this.isMexicanProvider(idUser);

    if (isMX) {
      // MX provider: CURP is required
      if (!curp) {
        throw new BadRequestException(
          'NOM-024: CURP es obligatorio para profesionales de salud de proveedores mexicanos',
        );
      }
      const validation = validateCURP(curp);
      if (!validation.isValid) {
        throw new BadRequestException(
          `NOM-024: ${validation.errors.join(', ')}`,
        );
      }
    } else {
      // Non-MX provider: CURP is optional but must be valid if provided
      if (curp) {
        const validation = validateCURP(curp);
        if (!validation.isValid) {
          throw new BadRequestException(validation.errors.join(', '));
        }
      }
    }
  }

  async create(createEnfermeraFirmanteDto: CreateEnfermeraFirmanteDto) {
    const normalizedDto = normalizeEnfermeraFirmanteData(
      createEnfermeraFirmanteDto,
    );

    // NOM-024: Validate CURP based on provider country
    await this.validateCURPForNOM024(
      (normalizedDto as any).curp,
      createEnfermeraFirmanteDto.idUser,
    );

    const createdConfiguracionInforme = new this.enfermeraFirmanteModel(
      normalizedDto,
    );
    return createdConfiguracionInforme.save();
  }

  async findAll(): Promise<EnfermeraFirmante[]> {
    return this.enfermeraFirmanteModel.find().exec();
  }

  async findOne(id: string): Promise<EnfermeraFirmante> {
    return this.enfermeraFirmanteModel.findById(id).exec();
  }

  async findOneByUserId(idUser: string): Promise<EnfermeraFirmante> {
    return this.enfermeraFirmanteModel.findOne({ idUser }).exec();
  }

  async update(
    id: string,
    updateEnfermeraFirmanteDto: UpdateEnfermeraFirmanteDto,
  ): Promise<EnfermeraFirmante> {
    const normalizedDto = normalizeEnfermeraFirmanteData(
      updateEnfermeraFirmanteDto,
    );

    // Get existing record to determine idUser for validation
    const existing = await this.enfermeraFirmanteModel.findById(id).exec();
    if (existing) {
      const idUser =
        updateEnfermeraFirmanteDto.idUser || existing.idUser?.toString();
      if (idUser) {
        // NOM-024: Validate CURP based on provider country
        const curpToValidate =
          (normalizedDto as any).curp !== undefined
            ? (normalizedDto as any).curp
            : (existing as any).curp;
        await this.validateCURPForNOM024(curpToValidate, idUser);
      }
    }

    return this.enfermeraFirmanteModel
      .findByIdAndUpdate(id, normalizedDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.enfermeraFirmanteModel
      .findByIdAndDelete(id)
      .exec();
    return result !== null;
  }
}
