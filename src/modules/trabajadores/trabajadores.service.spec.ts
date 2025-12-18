import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { TrabajadoresService } from './trabajadores.service';
import { Trabajador } from './schemas/trabajador.schema';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { CatalogsService } from '../catalogs/catalogs.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';

describe('TrabajadoresService - NOM-024 Person Identification Fields', () => {
  let service: TrabajadoresService;
  let trabajadorModel: Model<Trabajador>;
  let nom024Util: NOM024ComplianceUtil;
  let catalogsService: CatalogsService;

  const mockTrabajadorModel = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockNom024Util = {
    requiresNOM024Compliance: jest.fn(),
    getProveedorPais: jest.fn(),
  };

  const mockCatalogsService = {
    validateINEGI: jest.fn(),
    validateNacionalidad: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrabajadoresService,
        {
          provide: getModelToken(Trabajador.name),
          useValue: mockTrabajadorModel,
        },
        {
          provide: NOM024ComplianceUtil,
          useValue: mockNom024Util,
        },
        {
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
        // Add other required dependencies as mocks
        {
          provide: 'AntidopingModel',
          useValue: {},
        },
        {
          provide: 'AptitudPuestoModel',
          useValue: {},
        },
        {
          provide: 'AudiometriaModel',
          useValue: {},
        },
        {
          provide: 'CertificadoModel',
          useValue: {},
        },
        {
          provide: 'CertificadoExpeditoModel',
          useValue: {},
        },
        {
          provide: 'DocumentoExternoModel',
          useValue: {},
        },
        {
          provide: 'ExamenVistaModel',
          useValue: {},
        },
        {
          provide: 'ExploracionFisicaModel',
          useValue: {},
        },
        {
          provide: 'HistoriaClinicaModel',
          useValue: {},
        },
        {
          provide: 'NotaMedicaModel',
          useValue: {},
        },
        {
          provide: 'RecetaModel',
          useValue: {},
        },
        {
          provide: 'ControlPrenatalModel',
          useValue: {},
        },
        {
          provide: 'ConstanciaAptitudModel',
          useValue: {},
        },
        {
          provide: 'RiesgoTrabajoModel',
          useValue: {},
        },
        {
          provide: 'CentroTrabajoModel',
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: 'UserModel',
          useValue: {},
        },
        {
          provide: 'EmpresaModel',
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: 'FilesService',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TrabajadoresService>(TrabajadoresService);
    trabajadorModel = module.get<Model<Trabajador>>(getModelToken(Trabajador.name));
    nom024Util = module.get<NOM024ComplianceUtil>(NOM024ComplianceUtil);
    catalogsService = module.get<CatalogsService>(CatalogsService);

    // Setup default mocks
    jest.clearAllMocks();
  });

  describe('MX Provider - Required Fields Validation', () => {
    it('should require all NOM-024 fields for MX provider', async () => {
      const dto: CreateTrabajadorDto = {
        primerApellido: 'Gonzalez',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Developer',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: 'centro123',
        createdBy: 'user123',
        updatedBy: 'user123',
        // Missing NOM-024 fields
      };

      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      // Mock getProveedorSaludIdFromCentroTrabajo
      const centroTrabajoModel = (service as any).centroTrabajoModel;
      const empresaModel = (service as any).empresaModel;
      centroTrabajoModel.findById.mockResolvedValue({ idEmpresa: 'empresa123' });
      empresaModel.findById.mockResolvedValue({ idProveedorSalud: 'proveedor123' });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should accept valid NOM-024 fields for MX provider', async () => {
      const dto: CreateTrabajadorDto = {
        primerApellido: 'Gonzalez',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Developer',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: 'centro123',
        createdBy: 'user123',
        updatedBy: 'user123',
        curp: 'GOJG900101HDFNRN01',
        entidadNacimiento: '09', // Ciudad de México
        nacionalidad: 'MEX',
        entidadResidencia: '09',
        municipioResidencia: '017',
        localidadResidencia: '0001',
      };

      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      const centroTrabajoModel = (service as any).centroTrabajoModel;
      const empresaModel = (service as any).empresaModel;
      centroTrabajoModel.findById.mockResolvedValue({ idEmpresa: 'empresa123' });
      empresaModel.findById.mockResolvedValue({ idProveedorSalud: 'proveedor123' });

      const mockSaved = { ...dto, _id: 'trabajador123', save: jest.fn().mockResolvedValue(dto) };
      mockTrabajadorModel.create = jest.fn().mockReturnValue(mockSaved);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalled();
      expect(mockCatalogsService.validateNacionalidad).toHaveBeenCalled();
    });

    it('should validate hierarchical INEGI codes (municipio within estado)', async () => {
      const dto: CreateTrabajadorDto = {
        primerApellido: 'Gonzalez',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Developer',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: 'centro123',
        createdBy: 'user123',
        updatedBy: 'user123',
        curp: 'GOJG900101HDFNRN01',
        entidadNacimiento: '09',
        nacionalidad: 'MEX',
        entidadResidencia: '09',
        municipioResidencia: '017',
        localidadResidencia: '0001',
      };

      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI
        .mockResolvedValueOnce(true) // entidadNacimiento
        .mockResolvedValueOnce(true) // entidadResidencia
        .mockResolvedValueOnce(true) // municipioResidencia (hierarchical)
        .mockResolvedValueOnce(true); // localidadResidencia (hierarchical)
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      const centroTrabajoModel = (service as any).centroTrabajoModel;
      const empresaModel = (service as any).empresaModel;
      centroTrabajoModel.findById.mockResolvedValue({ idEmpresa: 'empresa123' });
      empresaModel.findById.mockResolvedValue({ idProveedorSalud: 'proveedor123' });

      const mockSaved = { ...dto, _id: 'trabajador123', save: jest.fn().mockResolvedValue(dto) };
      mockTrabajadorModel.create = jest.fn().mockReturnValue(mockSaved);

      await service.create(dto);

      // Verify hierarchical validation was called
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith('municipio', '017', '09');
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith('localidad', '0001', '09-017');
    });
  });

  describe('Non-MX Provider - Optional Fields', () => {
    it('should allow missing NOM-024 fields for non-MX provider', async () => {
      const dto: CreateTrabajadorDto = {
        primerApellido: 'Gonzalez',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Developer',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: 'centro123',
        createdBy: 'user123',
        updatedBy: 'user123',
        // No NOM-024 fields provided
      };

      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false); // Non-MX

      const centroTrabajoModel = (service as any).centroTrabajoModel;
      const empresaModel = (service as any).empresaModel;
      centroTrabajoModel.findById.mockResolvedValue({ idEmpresa: 'empresa123' });
      empresaModel.findById.mockResolvedValue({ idProveedorSalud: 'proveedor123' });

      const mockSaved = { ...dto, _id: 'trabajador123', save: jest.fn().mockResolvedValue(dto) };
      mockTrabajadorModel.create = jest.fn().mockReturnValue(mockSaved);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      // Should not validate catalogs for non-MX
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
      expect(mockCatalogsService.validateNacionalidad).not.toHaveBeenCalled();
    });

    it('should allow optional NOM-024 fields for non-MX provider', async () => {
      const dto: CreateTrabajadorDto = {
        primerApellido: 'Gonzalez',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Developer',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: 'centro123',
        createdBy: 'user123',
        updatedBy: 'user123',
        entidadNacimiento: '09', // Optional for non-MX
        nacionalidad: 'MEX',
      };

      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false); // Non-MX

      const centroTrabajoModel = (service as any).centroTrabajoModel;
      const empresaModel = (service as any).empresaModel;
      centroTrabajoModel.findById.mockResolvedValue({ idEmpresa: 'empresa123' });
      empresaModel.findById.mockResolvedValue({ idProveedorSalud: 'proveedor123' });

      const mockSaved = { ...dto, _id: 'trabajador123', save: jest.fn().mockResolvedValue(dto) };
      mockTrabajadorModel.create = jest.fn().mockReturnValue(mockSaved);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      // Should not validate catalogs for non-MX
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
      expect(mockCatalogsService.validateNacionalidad).not.toHaveBeenCalled();
    });
  });

  describe('Edge Case Codes', () => {
    it('should accept NE (Extranjero) for entidadNacimiento', async () => {
      const dto: CreateTrabajadorDto = {
        primerApellido: 'Gonzalez',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Developer',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: 'centro123',
        createdBy: 'user123',
        updatedBy: 'user123',
        curp: 'GOJG900101HDFNRN01',
        entidadNacimiento: 'NE', // Extranjero
        nacionalidad: 'USA',
        entidadResidencia: '09',
        municipioResidencia: '017',
        localidadResidencia: '0001',
      };

      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      const centroTrabajoModel = (service as any).centroTrabajoModel;
      const empresaModel = (service as any).empresaModel;
      centroTrabajoModel.findById.mockResolvedValue({ idEmpresa: 'empresa123' });
      empresaModel.findById.mockResolvedValue({ idProveedorSalud: 'proveedor123' });

      const mockSaved = { ...dto, _id: 'trabajador123', save: jest.fn().mockResolvedValue(dto) };
      mockTrabajadorModel.create = jest.fn().mockReturnValue(mockSaved);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      // NE should not trigger catalog validation
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalledWith('estado', 'NE', expect.anything());
    });

    it('should accept 00 (No disponible) for entidadNacimiento', async () => {
      const dto: CreateTrabajadorDto = {
        primerApellido: 'Gonzalez',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Developer',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: 'centro123',
        createdBy: 'user123',
        updatedBy: 'user123',
        curp: 'GOJG900101HDFNRN01',
        entidadNacimiento: '00', // No disponible
        nacionalidad: 'NND', // No disponible
        entidadResidencia: '09',
        municipioResidencia: '017',
        localidadResidencia: '0001',
      };

      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const centroTrabajoModel = (service as any).centroTrabajoModel;
      const empresaModel = (service as any).empresaModel;
      centroTrabajoModel.findById.mockResolvedValue({ idEmpresa: 'empresa123' });
      empresaModel.findById.mockResolvedValue({ idProveedorSalud: 'proveedor123' });

      const mockSaved = { ...dto, _id: 'trabajador123', save: jest.fn().mockResolvedValue(dto) };
      mockTrabajadorModel.create = jest.fn().mockReturnValue(mockSaved);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      // 00 and NND should not trigger catalog validation
      expect(mockCatalogsService.validateNacionalidad).not.toHaveBeenCalledWith('NND');
    });
  });
});

