import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TecnicoFirmante } from './schemas/tecnico-firmante.schema';
import { CreateTecnicoFirmanteDto } from './dto/create-tecnico-firmante.dto';
import { UpdateTecnicoFirmanteDto } from './dto/update-tecnico-firmante.dto';
import { normalizeEnfermeraFirmanteData } from 'src/utils/normalization';
import { User } from '../users/schemas/user.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';
import { validateCURP } from 'src/utils/curp-validator.util';

@Injectable()
export class TecnicosFirmantesService {
  constructor(
    @InjectModel(TecnicoFirmante.name)
    private tecnicoModel: Model<TecnicoFirmante>,
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

  async create(dto: CreateTecnicoFirmanteDto) {
    // Reusar normalización similar a enfermera
    const normalized = normalizeEnfermeraFirmanteData(dto as any);

    // NOM-024: Validate CURP based on provider country
    await this.validateCURPForNOM024((normalized as any).curp, dto.idUser);

    const created = new this.tecnicoModel(normalized);
    return created.save();
  }

  async findAll(): Promise<TecnicoFirmante[]> {
    return this.tecnicoModel.find().exec();
  }

  async findOne(id: string): Promise<TecnicoFirmante> {
    return this.tecnicoModel.findById(id).exec();
  }

  async findOneByUserId(idUser: string): Promise<TecnicoFirmante> {
    return this.tecnicoModel.findOne({ idUser }).exec();
  }

  async update(
    id: string,
    dto: UpdateTecnicoFirmanteDto,
  ): Promise<TecnicoFirmante> {
    const normalized = normalizeEnfermeraFirmanteData(dto as any);

    // Get existing record to determine idUser for validation
    const existing = await this.tecnicoModel.findById(id).exec();
    if (existing) {
      const idUser = dto.idUser || existing.idUser?.toString();
      if (idUser) {
        // NOM-024: Validate CURP based on provider country
        const curpToValidate =
          (normalized as any).curp !== undefined
            ? (normalized as any).curp
            : (existing as any).curp;
        await this.validateCURPForNOM024(curpToValidate, idUser);
      }
    }

    return this.tecnicoModel
      .findByIdAndUpdate(id, normalized, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.tecnicoModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
