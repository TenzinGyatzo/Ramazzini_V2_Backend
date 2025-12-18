import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TecnicosFirmantesService } from './tecnicos-firmantes.service';
import { TecnicoFirmante } from './schemas/tecnico-firmante.schema';
import { User } from '../users/schemas/user.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';

describe('TecnicosFirmantesService', () => {
  let service: TecnicosFirmantesService;
  let mockTecnicoFirmanteModel: any;
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
});
