import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TecnicosFirmantesService } from './tecnicos-firmantes.service';
import { TecnicoFirmante } from './schemas/tecnico-firmante.schema';
import { User } from '../users/schemas/user.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';
import {
  RegulatoryPolicyService,
  RegulatoryPolicy,
} from '../../utils/regulatory-policy.service';

describe('TecnicosFirmantesService', () => {
  let service: TecnicosFirmantesService;
  let mockTecnicoFirmanteModel: any;
  let mockUserModel: any;
  let mockProveedorSaludModel: any;
  let mockRegulatoryPolicyService: jest.Mocked<RegulatoryPolicyService>;

  const createMockModel = () => ({
    findById: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    findOne: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    findByIdAndUpdate: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    findByIdAndDelete: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
  });

  const validCURP = 'LOPE820310HDFPZR00'; // Valid CURP format with correct checksum
  const invalidCURPFormat = 'INVALID123';
  const mxUserId = '507f1f77bcf86cd799439011';
  const nonMxUserId = '507f1f77bcf86cd799439022';
  const mxProveedorId = '507f1f77bcf86cd799439033';
  const nonMxProveedorId = '507f1f77bcf86cd799439044';

  beforeEach(async () => {
    mockTecnicoFirmanteModel = {
      ...createMockModel(),
    };

    // Mock constructor for create operations
    const MockTecnicoModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'new-id' }),
    }));
    Object.assign(MockTecnicoModel, mockTecnicoFirmanteModel);

    mockUserModel = createMockModel();
    mockProveedorSaludModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TecnicosFirmantesService,
        {
          provide: getModelToken(TecnicoFirmante.name),
          useValue: MockTecnicoModel,
        },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        {
          provide: getModelToken(ProveedorSalud.name),
          useValue: mockProveedorSaludModel,
        },
        {
          provide: RegulatoryPolicyService,
          useValue: (mockRegulatoryPolicyService = {
            getRegulatoryPolicy: jest.fn(),
          } as any),
        },
      ],
    }).compile();

    service = module.get<TecnicosFirmantesService>(TecnicosFirmantesService);
  });

  describe('NOM-024 CURP Validation', () => {
    describe('MX Provider (pais === MX)', () => {
      beforeEach(() => {
        // Setup MX provider scenario
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: mxUserId,
            idProveedorSalud: mxProveedorId,
          }),
        });
        mockProveedorSaludModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: mxProveedorId,
            pais: 'MX',
          }),
        });
      });

      it('should require CURP for MX providers', async () => {
        const dto = {
          nombre: 'Pedro Técnico',
          idUser: mxUserId,
          // No curp provided
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        await expect(service.create(dto)).rejects.toThrow(
          'NOM-024: CURP es obligatorio para profesionales de salud de proveedores mexicanos',
        );
      });

      it('should accept valid CURP for MX providers', async () => {
        const dto = {
          nombre: 'Pedro Técnico',
          idUser: mxUserId,
          curp: validCURP,
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
        expect(result._id).toBe('new-id');
      });

      it('should reject invalid CURP format for MX providers', async () => {
        const dto = {
          nombre: 'Pedro Técnico',
          idUser: mxUserId,
          curp: invalidCURPFormat,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        await expect(service.create(dto)).rejects.toThrow('NOM-024:');
      });
    });

    describe('Non-MX Provider (pais !== MX)', () => {
      beforeEach(() => {
        // Setup non-MX provider scenario (e.g., Colombia)
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: nonMxUserId,
            idProveedorSalud: nonMxProveedorId,
          }),
        });
        mockProveedorSaludModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: nonMxProveedorId,
            pais: 'CO',
          }),
        });
      });

      it('should allow creation without CURP for non-MX providers', async () => {
        const dto = {
          nombre: 'Luis Técnico',
          idUser: nonMxUserId,
          // No curp - should be allowed for non-MX
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
        expect(result._id).toBe('new-id');
      });

      it('should accept valid CURP for non-MX providers (optional)', async () => {
        const dto = {
          nombre: 'Luis Técnico',
          idUser: nonMxUserId,
          curp: validCURP,
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
      });

      it('should reject invalid CURP even for non-MX providers when provided', async () => {
        const dto = {
          nombre: 'Luis Técnico',
          idUser: nonMxUserId,
          curp: invalidCURPFormat,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      });
    });

    describe('Update Operations', () => {
      it('should validate CURP on update for MX providers', async () => {
        // Setup MX provider
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: mxUserId,
            idProveedorSalud: mxProveedorId,
          }),
        });
        mockProveedorSaludModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: mxProveedorId,
            pais: 'MX',
          }),
        });

        // Existing record with valid CURP
        mockTecnicoFirmanteModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'existing-id',
            nombre: 'Pedro Técnico',
            idUser: mxUserId,
            curp: validCURP,
          }),
        });

        mockTecnicoFirmanteModel.findByIdAndUpdate.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'existing-id',
            nombre: 'Pedro Técnico Updated',
            curp: validCURP,
          }),
        });

        const updateDto = {
          nombre: 'Pedro Técnico Updated',
        };

        const result = await service.update('existing-id', updateDto);
        expect(result).toBeDefined();
      });

      it('should reject removing CURP on update for MX providers', async () => {
        // Setup MX provider
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: mxUserId,
            idProveedorSalud: mxProveedorId,
          }),
        });
        mockProveedorSaludModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: mxProveedorId,
            pais: 'MX',
          }),
        });

        // Existing record with valid CURP
        mockTecnicoFirmanteModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'existing-id',
            nombre: 'Pedro Técnico',
            idUser: mxUserId,
            curp: validCURP,
          }),
        });

        const updateDto = {
          curp: '', // Trying to remove CURP
        };

        await expect(service.update('existing-id', updateDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe('CURP Validation - Regulatory Policy', () => {
    const siresProveedorId = '507f1f77bcf86cd799439055';
    const sinRegimenProveedorId = '507f1f77bcf86cd799439066';
    const siresUserId = '507f1f77bcf86cd799439077';
    const sinRegimenUserId = '507f1f77bcf86cd799439088';

    const createSiresPolicy = (): RegulatoryPolicy => ({
      regime: 'SIRES_NOM024',
      features: {
        sessionTimeoutEnabled: true,
        enforceDocumentImmutabilityUI: true,
        documentImmutabilityEnabled: true,
        showSiresUI: true,
        giisExportEnabled: true,
        notaAclaratoriaEnabled: true,
        cluesFieldVisible: true,
      },
      validation: {
        curpFirmantes: 'required',
        workerCurp: 'required_strict',
        cie10Principal: 'required',
        geoFields: 'required',
      },
    });

    const createSinRegimenPolicy = (): RegulatoryPolicy => ({
      regime: 'SIN_REGIMEN',
      features: {
        sessionTimeoutEnabled: false,
        enforceDocumentImmutabilityUI: false,
        documentImmutabilityEnabled: false,
        showSiresUI: false,
        giisExportEnabled: false,
        notaAclaratoriaEnabled: false,
        cluesFieldVisible: false,
      },
      validation: {
        curpFirmantes: 'optional',
        workerCurp: 'optional',
        cie10Principal: 'optional',
        geoFields: 'optional',
      },
    });

    describe('SIRES_NOM024 - CURP Required', () => {
      beforeEach(() => {
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: siresUserId,
            idProveedorSalud: siresProveedorId,
          }),
        });
        mockRegulatoryPolicyService.getRegulatoryPolicy.mockResolvedValue(
          createSiresPolicy(),
        );
      });

      it('should require CURP for SIRES_NOM024', async () => {
        const dto = {
          nombre: 'Téc. Pedro López',
          idUser: siresUserId,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        await expect(service.create(dto)).rejects.toThrow(
          'CURP es obligatorio para firmantes en régimen SIRES_NOM024',
        );
      });

      it('should accept valid CURP for SIRES_NOM024', async () => {
        const dto = {
          nombre: 'Téc. Pedro López',
          idUser: siresUserId,
          curp: validCURP,
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
      });
    });

    describe('SIN_REGIMEN - CURP Optional', () => {
      beforeEach(() => {
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: sinRegimenUserId,
            idProveedorSalud: sinRegimenProveedorId,
          }),
        });
        mockRegulatoryPolicyService.getRegulatoryPolicy.mockResolvedValue(
          createSinRegimenPolicy(),
        );
      });

      it('should allow creation without CURP for SIN_REGIMEN', async () => {
        const dto = {
          nombre: 'Téc. Carlos García',
          idUser: sinRegimenUserId,
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
      });

      it('should reject invalid CURP even for SIN_REGIMEN when provided', async () => {
        const dto = {
          nombre: 'Téc. Carlos García',
          idUser: sinRegimenUserId,
          curp: invalidCURPFormat,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      });
    });
  });
});
