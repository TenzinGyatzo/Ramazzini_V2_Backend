import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { ProveedoresSaludService } from './proveedores-salud.service';
import { ProveedorSalud } from './schemas/proveedor-salud.schema';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { CatalogsService } from '../catalogs/catalogs.service';
import { CreateProveedoresSaludDto } from './dto/create-proveedores-salud.dto';

describe('ProveedoresSaludService - CLUES Validation', () => {
  let service: ProveedoresSaludService;
  let proveedorSaludModel: Model<ProveedorSalud>;
  let nom024Util: NOM024ComplianceUtil;
  let catalogsService: CatalogsService;

  const mockProveedorSaludModel = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    save: jest.fn(),
  };

  const mockNom024Util = {
    requiresNOM024Compliance: jest.fn(),
    getProveedorPais: jest.fn(),
  };

  const mockCatalogsService = {
    validateCLUES: jest.fn(),
    validateCLUESInOperation: jest.fn(),
    getCLUESEntry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProveedoresSaludService,
        {
          provide: getModelToken(ProveedorSalud.name),
          useValue: mockProveedorSaludModel,
        },
        {
          provide: NOM024ComplianceUtil,
          useValue: mockNom024Util,
        },
        {
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
      ],
    }).compile();

    service = module.get<ProveedoresSaludService>(ProveedoresSaludService);
    proveedorSaludModel = module.get<Model<ProveedorSalud>>(getModelToken(ProveedorSalud.name));
    nom024Util = module.get<NOM024ComplianceUtil>(NOM024ComplianceUtil);
    catalogsService = module.get<CatalogsService>(CatalogsService);

    jest.clearAllMocks();
  });

  describe('MX Provider - CLUES Required', () => {
    it('should require CLUES for MX provider', async () => {
      const dto: CreateProveedoresSaludDto = {
        nombre: 'Clínica Test',
        pais: 'MX',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        termsAccepted: true,
        acceptedAt: '2024-01-01',
        termsVersion: '1.0',
        // Missing CLUES
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('CLUES es obligatorio');
    });

    it('should validate CLUES format for MX provider', async () => {
      const dto: CreateProveedoresSaludDto = {
        nombre: 'Clínica Test',
        pais: 'MX',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        termsAccepted: true,
        acceptedAt: '2024-01-01',
        termsVersion: '1.0',
        clues: 'INVALID', // Invalid format (not 11 chars)
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('11 caracteres');
    });

    it('should validate CLUES exists in catalog for MX provider', async () => {
      const dto: CreateProveedoresSaludDto = {
        nombre: 'Clínica Test',
        pais: 'MX',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        termsAccepted: true,
        acceptedAt: '2024-01-01',
        termsVersion: '1.0',
        clues: 'INVALID12345', // Valid format but not in catalog
      };

      mockCatalogsService.validateCLUES.mockResolvedValue(false);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('No se encuentra en el catálogo');
    });

    it('should validate CLUES is in operation for MX provider', async () => {
      const dto: CreateProveedoresSaludDto = {
        nombre: 'Clínica Test',
        pais: 'MX',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        termsAccepted: true,
        acceptedAt: '2024-01-01',
        termsVersion: '1.0',
        clues: 'ASCIJ000012', // Valid CLUES but not in operation
      };

      mockCatalogsService.validateCLUES.mockResolvedValue(true);
      mockCatalogsService.validateCLUESInOperation.mockResolvedValue(false);
      mockCatalogsService.getCLUESEntry.mockResolvedValue({ estatus: 'BAJA' });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('no está en operación');
    });

    it('should accept valid CLUES in operation for MX provider', async () => {
      const dto: CreateProveedoresSaludDto = {
        nombre: 'Clínica Test',
        pais: 'MX',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        termsAccepted: true,
        acceptedAt: '2024-01-01',
        termsVersion: '1.0',
        clues: 'ASCIJ000012',
      };

      mockCatalogsService.validateCLUES.mockResolvedValue(true);
      mockCatalogsService.validateCLUESInOperation.mockResolvedValue(true);

      const mockSaved = { ...dto, _id: 'proveedor123', save: jest.fn().mockResolvedValue(dto) };
      mockProveedorSaludModel.create = jest.fn().mockReturnValue(mockSaved);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(mockCatalogsService.validateCLUES).toHaveBeenCalledWith('ASCIJ000012');
      expect(mockCatalogsService.validateCLUESInOperation).toHaveBeenCalledWith('ASCIJ000012');
    });
  });

  describe('Non-MX Provider - CLUES Optional', () => {
    it('should allow missing CLUES for non-MX provider', async () => {
      const dto: CreateProveedoresSaludDto = {
        nombre: 'Clínica Test',
        pais: 'GT', // Guatemala
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        termsAccepted: true,
        acceptedAt: '2024-01-01',
        termsVersion: '1.0',
        // No CLUES provided
      };

      const mockSaved = { ...dto, _id: 'proveedor123', save: jest.fn().mockResolvedValue(dto) };
      mockProveedorSaludModel.create = jest.fn().mockReturnValue(mockSaved);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(mockCatalogsService.validateCLUES).not.toHaveBeenCalled();
    });

    it('should validate CLUES format for non-MX provider if provided', async () => {
      const dto: CreateProveedoresSaludDto = {
        nombre: 'Clínica Test',
        pais: 'GT',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        termsAccepted: true,
        acceptedAt: '2024-01-01',
        termsVersion: '1.0',
        clues: 'INVALID', // Invalid format
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('11 caracteres');
    });

    it('should accept valid CLUES format for non-MX provider without catalog validation', async () => {
      const dto: CreateProveedoresSaludDto = {
        nombre: 'Clínica Test',
        pais: 'GT',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        termsAccepted: true,
        acceptedAt: '2024-01-01',
        termsVersion: '1.0',
        clues: 'VALID123456', // Valid format (11 chars)
      };

      const mockSaved = { ...dto, _id: 'proveedor123', save: jest.fn().mockResolvedValue(dto) };
      mockProveedorSaludModel.create = jest.fn().mockReturnValue(mockSaved);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      // Should not validate against catalog for non-MX
      expect(mockCatalogsService.validateCLUES).not.toHaveBeenCalled();
      expect(mockCatalogsService.validateCLUESInOperation).not.toHaveBeenCalled();
    });
  });

  describe('Update Operations', () => {
    it('should validate CLUES when updating MX provider', async () => {
      const existingProveedor = {
        _id: 'proveedor123',
        nombre: 'Clínica Test',
        pais: 'MX',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        clues: 'OLDCLUES123',
        save: jest.fn().mockResolvedValue({}),
        toObject: jest.fn().mockReturnValue({}),
      };

      const updateDto = {
        clues: 'NEWCLUES12345',
      };

      mockProveedorSaludModel.findById.mockResolvedValue(existingProveedor);
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateCLUES.mockResolvedValue(true);
      mockCatalogsService.validateCLUESInOperation.mockResolvedValue(true);

      await service.update('proveedor123', updateDto);

      expect(mockCatalogsService.validateCLUES).toHaveBeenCalledWith('NEWCLUES12345');
      expect(mockCatalogsService.validateCLUESInOperation).toHaveBeenCalledWith('NEWCLUES12345');
    });

    it('should not require CLUES update for non-MX provider', async () => {
      const existingProveedor = {
        _id: 'proveedor123',
        nombre: 'Clínica Test',
        pais: 'GT',
        perfilProveedorSalud: 'Empresa de salud ocupacional',
        save: jest.fn().mockResolvedValue({}),
        toObject: jest.fn().mockReturnValue({}),
      };

      const updateDto = {
        nombre: 'Clínica Actualizada',
      };

      mockProveedorSaludModel.findById.mockResolvedValue(existingProveedor);

      await service.update('proveedor123', updateDto);

      expect(mockCatalogsService.validateCLUES).not.toHaveBeenCalled();
    });
  });
});

