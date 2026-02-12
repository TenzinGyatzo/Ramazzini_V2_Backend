import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConsentimientoDiarioService } from './consentimiento-diario.service';
import { ConsentimientoDiario } from './schemas/consentimiento-diario.schema';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../empresas/schemas/empresa.schema';
import { RegulatoryPolicyService } from '../../utils/regulatory-policy.service';
import { ProveedoresSaludService } from '../proveedores-salud/proveedores-salud.service';
import {
  CreateConsentimientoDiarioDto,
  ConsentMethod,
} from './dto/create-consentimiento-diario.dto';
import { RegulatoryErrorCode } from '../../utils/regulatory-error-codes';

describe('ConsentimientoDiarioService', () => {
  let service: ConsentimientoDiarioService;
  let consentimientoModel: Model<ConsentimientoDiario>;
  let trabajadorModel: Model<Trabajador>;
  let centroTrabajoModel: Model<CentroTrabajo>;
  let empresaModel: Model<Empresa>;
  let regulatoryPolicyService: RegulatoryPolicyService;
  let proveedoresSaludService: ProveedoresSaludService;

  const mockConsentimientoModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTrabajadorModel = {
    findById: jest.fn(),
  };

  const mockCentroTrabajoModel = {
    findById: jest.fn(),
  };

  const mockEmpresaModel = {
    findById: jest.fn(),
  };

  const mockRegulatoryPolicyService = {
    getRegulatoryPolicy: jest.fn(),
  };

  const mockProveedoresSaludService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsentimientoDiarioService,
        {
          provide: getModelToken(ConsentimientoDiario.name),
          useValue: mockConsentimientoModel,
        },
        {
          provide: getModelToken(Trabajador.name),
          useValue: mockTrabajadorModel,
        },
        {
          provide: getModelToken(CentroTrabajo.name),
          useValue: mockCentroTrabajoModel,
        },
        {
          provide: getModelToken(Empresa.name),
          useValue: mockEmpresaModel,
        },
        {
          provide: RegulatoryPolicyService,
          useValue: mockRegulatoryPolicyService,
        },
        {
          provide: ProveedoresSaludService,
          useValue: mockProveedoresSaludService,
        },
      ],
    }).compile();

    service = module.get<ConsentimientoDiarioService>(
      ConsentimientoDiarioService,
    );
    consentimientoModel = module.get<Model<ConsentimientoDiario>>(
      getModelToken(ConsentimientoDiario.name),
    );
    trabajadorModel = module.get<Model<Trabajador>>(
      getModelToken(Trabajador.name),
    );
    regulatoryPolicyService = module.get<RegulatoryPolicyService>(
      RegulatoryPolicyService,
    );
    proveedoresSaludService = module.get<ProveedoresSaludService>(
      ProveedoresSaludService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    const trabajadorId = '507f1f77bcf86cd799439011';
    const userId = '507f1f77bcf86cd799439012';
    const proveedorSaludId = '507f1f77bcf86cd799439013';
    const centroTrabajoId = '507f1f77bcf86cd799439014';
    const empresaId = '507f1f77bcf86cd799439015';

    it('debe retornar hasConsent: false cuando no existe consentimiento', async () => {
      // Arrange
      mockTrabajadorModel.findById.mockResolvedValue({
        _id: trabajadorId,
        idCentroTrabajo: centroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: centroTrabajoId,
        idEmpresa: empresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: empresaId,
        idProveedorSalud: proveedorSaludId,
      });
      mockRegulatoryPolicyService.getRegulatoryPolicy.mockResolvedValue({
        regime: 'SIRES_NOM024',
        features: { dailyConsentEnabled: true },
      });
      mockProveedoresSaludService.findOne.mockResolvedValue({
        _id: proveedorSaludId,
        timezone: 'America/Mexico_City',
      });
      mockConsentimientoModel.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getStatus(trabajadorId, undefined, userId);

      // Assert
      expect(result.hasConsent).toBe(false);
      expect(result.dateKey).toBeDefined();
      expect(result.consent).toBeUndefined();
    });

    it('debe retornar hasConsent: true con datos cuando existe consentimiento', async () => {
      // Arrange
      const dateKey = '2024-03-15';
      const consentimiento = {
        _id: '507f1f77bcf86cd799439020',
        proveedorSaludId: proveedorSaludId,
        trabajadorId: trabajadorId,
        dateKey: dateKey,
        acceptedAt: new Date('2024-03-15T10:30:00Z'),
        acceptedByUserId: userId,
        consentMethod: 'DIGITAL',
        consentTextVersion: '1.0.0',
      };

      mockTrabajadorModel.findById.mockResolvedValue({
        _id: trabajadorId,
        idCentroTrabajo: centroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: centroTrabajoId,
        idEmpresa: empresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: empresaId,
        idProveedorSalud: proveedorSaludId,
      });
      mockRegulatoryPolicyService.getRegulatoryPolicy.mockResolvedValue({
        regime: 'SIRES_NOM024',
        features: { dailyConsentEnabled: true },
      });
      mockProveedoresSaludService.findOne.mockResolvedValue({
        _id: proveedorSaludId,
        timezone: 'America/Mexico_City',
      });
      mockConsentimientoModel.findOne.mockResolvedValue(consentimiento);

      // Act
      const result = await service.getStatus(trabajadorId, dateKey, userId);

      // Assert
      expect(result.hasConsent).toBe(true);
      expect(result.dateKey).toBe(dateKey);
      expect(result.consent).toBeDefined();
      expect(result.consent.acceptedAt).toEqual(consentimiento.acceptedAt);
      expect(result.consent.consentMethod).toBe('DIGITAL');
    });

    it('debe lanzar CONSENT_NOT_ENABLED para SIN_REGIMEN', async () => {
      // Arrange
      mockTrabajadorModel.findById.mockResolvedValue({
        _id: trabajadorId,
        idCentroTrabajo: centroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: centroTrabajoId,
        idEmpresa: empresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: empresaId,
        idProveedorSalud: proveedorSaludId,
      });
      mockRegulatoryPolicyService.getRegulatoryPolicy.mockResolvedValue({
        regime: 'SIN_REGIMEN',
        features: { dailyConsentEnabled: false },
      });

      // Act & Assert
      await expect(
        service.getStatus(trabajadorId, undefined, userId),
      ).rejects.toThrow();
    });

    it('debe lanzar 404 cuando trabajador no existe', async () => {
      // Arrange
      mockTrabajadorModel.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getStatus(trabajadorId, undefined, userId),
      ).rejects.toThrow('Trabajador no encontrado');
    });
  });

  describe('create', () => {
    const trabajadorId = '507f1f77bcf86cd799439011';
    const userId = '507f1f77bcf86cd799439012';
    const proveedorSaludId = '507f1f77bcf86cd799439013';
    const centroTrabajoId = '507f1f77bcf86cd799439014';
    const empresaId = '507f1f77bcf86cd799439015';

    const createDto: CreateConsentimientoDiarioDto = {
      trabajadorId: trabajadorId,
      consentMethod: ConsentMethod.DIGITAL,
    };

    it('debe crear consentimiento exitosamente', async () => {
      // Arrange
      const savedConsentimiento = {
        _id: '507f1f77bcf86cd799439020',
        proveedorSaludId: proveedorSaludId,
        trabajadorId: trabajadorId,
        dateKey: '2024-03-15',
        acceptedAt: new Date(),
        acceptedByUserId: userId,
        consentMethod: 'DIGITAL',
        consentTextVersion: '1.0.0',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      mockTrabajadorModel.findById.mockResolvedValue({
        _id: trabajadorId,
        idCentroTrabajo: centroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: centroTrabajoId,
        idEmpresa: empresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: empresaId,
        idProveedorSalud: proveedorSaludId,
      });
      mockRegulatoryPolicyService.getRegulatoryPolicy.mockResolvedValue({
        regime: 'SIRES_NOM024',
        features: { dailyConsentEnabled: true },
      });
      mockProveedoresSaludService.findOne.mockResolvedValue({
        _id: proveedorSaludId,
        timezone: 'America/Mexico_City',
      });
      mockConsentimientoModel.findOne.mockResolvedValue(null);
      mockConsentimientoModel.create = jest
        .fn()
        .mockReturnValue(savedConsentimiento);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.trabajadorId).toBe(trabajadorId);
      expect(result.consentMethod).toBe('DIGITAL');
      expect(mockConsentimientoModel.create).toHaveBeenCalled();
    });

    it('debe lanzar CONSENT_ALREADY_EXISTS cuando ya existe', async () => {
      // Arrange
      const existingConsent = {
        _id: '507f1f77bcf86cd799439020',
        proveedorSaludId: proveedorSaludId,
        trabajadorId: trabajadorId,
        dateKey: '2024-03-15',
      };

      mockTrabajadorModel.findById.mockResolvedValue({
        _id: trabajadorId,
        idCentroTrabajo: centroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: centroTrabajoId,
        idEmpresa: empresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: empresaId,
        idProveedorSalud: proveedorSaludId,
      });
      mockRegulatoryPolicyService.getRegulatoryPolicy.mockResolvedValue({
        regime: 'SIRES_NOM024',
        features: { dailyConsentEnabled: true },
      });
      mockProveedoresSaludService.findOne.mockResolvedValue({
        _id: proveedorSaludId,
        timezone: 'America/Mexico_City',
      });
      mockConsentimientoModel.findOne.mockResolvedValue(existingConsent);

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow();
    });
  });
});
