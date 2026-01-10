import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateEnfermeraFirmanteDto } from './dto/create-enfermera-firmante.dto';
import { UpdateEnfermeraFirmanteDto } from './dto/update-enfermera-firmante.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EnfermeraFirmante } from './schemas/enfermera-firmante.schema';
import { Model } from 'mongoose';
import { normalizeEnfermeraFirmanteData } from 'src/utils/normalization';
import { User } from '../users/schemas/user.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';
import { RegulatoryPolicyService } from 'src/utils/regulatory-policy.service';
import { validateCurpByPolicy } from 'src/utils/curp-policy-validator.util';

@Injectable()
export class EnfermerasFirmantesService {
  constructor(
    @InjectModel(EnfermeraFirmante.name)
    private enfermeraFirmanteModel: Model<EnfermeraFirmante>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(ProveedorSalud.name)
    private proveedorSaludModel: Model<ProveedorSalud>,
    @Inject(forwardRef(() => RegulatoryPolicyService))
    private readonly regulatoryPolicyService: RegulatoryPolicyService,
  ) {}

  /**
   * Validate CURP based on regulatory policy
   * Uses Policy Layer to determine if CURP is required or optional
   */
  private async validateCURPByPolicy(
    curp: string | undefined,
    idUser: string,
  ): Promise<void> {
    // Get user to obtain idProveedorSalud
    const user = await this.userModel.findById(idUser).exec();
    if (!user || !user.idProveedorSalud) {
      // If no user or provider, assume SIN_REGIMEN (most permissive)
      return;
    }

    // Get regulatory policy for the provider
    const policy = await this.regulatoryPolicyService.getRegulatoryPolicy(
      user.idProveedorSalud,
    );

    // Validate CURP using policy
    validateCurpByPolicy(curp, policy);
  }

  async create(createEnfermeraFirmanteDto: CreateEnfermeraFirmanteDto) {
    const normalizedDto = normalizeEnfermeraFirmanteData(
      createEnfermeraFirmanteDto,
    );

    // Validate CURP based on regulatory policy
    await this.validateCURPByPolicy(
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
        // Validate CURP based on regulatory policy
        const curpToValidate =
          (normalizedDto as any).curp !== undefined
            ? (normalizedDto as any).curp
            : (existing as any).curp;
        await this.validateCURPByPolicy(curpToValidate, idUser);
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
