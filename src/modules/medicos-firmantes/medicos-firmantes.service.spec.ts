import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { MedicosFirmantesService } from './medicos-firmantes.service';
import { MedicoFirmante } from './schemas/medico-firmante.schema';
import { User } from '../users/schemas/user.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';

describe('MedicosFirmantesService', () => {
  let service: MedicosFirmantesService;
  let mockMedicoFirmanteModel: any;
  let mockUserModel: any;
  let mockProveedorSaludModel: any;

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

  const validCURP = 'ROAJ850102HDFLRN06'; // Valid CURP format with correct checksum
  const invalidCURPFormat = 'INVALID123';
  const mxUserId = '507f1f77bcf86cd799439011';
  const nonMxUserId = '507f1f77bcf86cd799439022';
  const mxProveedorId = '507f1f77bcf86cd799439033';
  const nonMxProveedorId = '507f1f77bcf86cd799439044';

  beforeEach(async () => {
    mockMedicoFirmanteModel = {
      ...createMockModel(),
      constructor: jest.fn().mockImplementation(function (dto) {
        return {
          ...dto,
          save: jest.fn().mockResolvedValue({ ...dto, _id: 'new-id' }),
        };
      }),
    };

    // Mock constructor for create operations
    const MockMedicoModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue({ ...dto, _id: 'new-id' }),
    }));
    Object.assign(MockMedicoModel, mockMedicoFirmanteModel);

    mockUserModel = createMockModel();
    mockProveedorSaludModel = createMockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicosFirmantesService,
        {
          provide: getModelToken(MedicoFirmante.name),
          useValue: MockMedicoModel,
        },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        {
          provide: getModelToken(ProveedorSalud.name),
          useValue: mockProveedorSaludModel,
        },
      ],
    }).compile();

    service = module.get<MedicosFirmantesService>(MedicosFirmantesService);
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
          nombre: 'Dr. Juan Pérez',
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
          nombre: 'Dr. Juan Pérez',
          idUser: mxUserId,
          curp: validCURP,
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
        expect(result._id).toBe('new-id');
      });

      it('should reject invalid CURP format for MX providers', async () => {
        const dto = {
          nombre: 'Dr. Juan Pérez',
          idUser: mxUserId,
          curp: invalidCURPFormat,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        await expect(service.create(dto)).rejects.toThrow('NOM-024:');
      });
    });

    describe('Non-MX Provider (pais !== MX)', () => {
      beforeEach(() => {
        // Setup non-MX provider scenario (e.g., Guatemala)
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: nonMxUserId,
            idProveedorSalud: nonMxProveedorId,
          }),
        });
        mockProveedorSaludModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: nonMxProveedorId,
            pais: 'GT',
          }),
        });
      });

      it('should allow creation without CURP for non-MX providers', async () => {
        const dto = {
          nombre: 'Dr. Carlos García',
          idUser: nonMxUserId,
          // No curp - should be allowed for non-MX
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
        expect(result._id).toBe('new-id');
      });

      it('should accept valid CURP for non-MX providers (optional)', async () => {
        const dto = {
          nombre: 'Dr. Carlos García',
          idUser: nonMxUserId,
          curp: validCURP,
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
      });

      it('should reject invalid CURP even for non-MX providers when provided', async () => {
        const dto = {
          nombre: 'Dr. Carlos García',
          idUser: nonMxUserId,
          curp: invalidCURPFormat,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      });
    });

    describe('Edge Cases', () => {
      it('should handle user without provider gracefully', async () => {
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: 'orphan-user',
            idProveedorSalud: null,
          }),
        });

        const dto = {
          nombre: 'Dr. Orphan User',
          idUser: 'orphan-user',
          // No curp - should be allowed since no provider = not MX
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
      });

      it('should handle non-existent user gracefully', async () => {
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        const dto = {
          nombre: 'Dr. Ghost User',
          idUser: 'non-existent-user',
          // No curp - should be allowed since user not found = not MX
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
      });

      it('should normalize CURP to uppercase', async () => {
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: nonMxUserId,
            idProveedorSalud: nonMxProveedorId,
          }),
        });
        mockProveedorSaludModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            _id: nonMxProveedorId,
            pais: 'GT',
          }),
        });

        const dto = {
          nombre: 'Dr. Test',
          idUser: nonMxUserId,
          curp: validCURP.toLowerCase(), // Lowercase input
        };

        const result = await service.create(dto);
        expect(result.curp).toBe(validCURP.toUpperCase());
      });
    });
  });
});
