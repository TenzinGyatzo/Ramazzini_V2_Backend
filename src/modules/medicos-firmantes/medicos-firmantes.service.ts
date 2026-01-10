import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateMedicoFirmanteDto } from './dto/create-medico-firmante.dto';
import { UpdateMedicoFirmanteDto } from './dto/update-medico-firmante.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MedicoFirmante } from './schemas/medico-firmante.schema';
import { Model } from 'mongoose';
import { normalizeMedicoFirmanteData } from 'src/utils/normalization';
import { User } from '../users/schemas/user.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';
import { RegulatoryPolicyService } from 'src/utils/regulatory-policy.service';
import { validateCurpByPolicy } from 'src/utils/curp-policy-validator.util';

@Injectable()
export class MedicosFirmantesService {
  constructor(
    @InjectModel(MedicoFirmante.name)
    private medicoFirmanteModel: Model<MedicoFirmante>,
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

  async create(createMedicoFirmanteDto: CreateMedicoFirmanteDto) {
    const normalizedDto = normalizeMedicoFirmanteData(createMedicoFirmanteDto);

    // Validate CURP based on regulatory policy
    await this.validateCURPByPolicy(
      (normalizedDto as any).curp,
      createMedicoFirmanteDto.idUser,
    );

    const createdConfiguracionInforme = new this.medicoFirmanteModel(
      normalizedDto,
    );
    return createdConfiguracionInforme.save();
  }

  async findAll(): Promise<MedicoFirmante[]> {
    return this.medicoFirmanteModel.find().exec();
  }

  async findOne(id: string): Promise<MedicoFirmante> {
    return this.medicoFirmanteModel.findById(id).exec();
  }

  async findOneByUserId(idUser: string): Promise<MedicoFirmante> {
    return this.medicoFirmanteModel.findOne({ idUser }).exec();
  }

  async update(
    id: string,
    updateMedicoFirmanteDto: UpdateMedicoFirmanteDto,
  ): Promise<MedicoFirmante> {
    const normalizedDto = normalizeMedicoFirmanteData(updateMedicoFirmanteDto);

    // Get existing record to determine idUser for validation
    const existing = await this.medicoFirmanteModel.findById(id).exec();
    if (existing) {
      const idUser =
        updateMedicoFirmanteDto.idUser || existing.idUser?.toString();
      if (idUser) {
        // Validate CURP based on regulatory policy
        // Use updated curp if provided, otherwise use existing curp
        const curpToValidate =
          (normalizedDto as any).curp !== undefined
            ? (normalizedDto as any).curp
            : (existing as any).curp;
        await this.validateCURPByPolicy(curpToValidate, idUser);
      }
    }

    return this.medicoFirmanteModel
      .findByIdAndUpdate(id, normalizedDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.medicoFirmanteModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
