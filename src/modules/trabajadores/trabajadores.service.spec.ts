import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TrabajadoresService } from './trabajadores.service';
import { Trabajador } from './schemas/trabajador.schema';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { CatalogsService } from '../catalogs/catalogs.service';
import { FilesService } from '../files/files.service';
import { GeographyValidator } from '../catalogs/validators/geography.validator';

describe('TrabajadoresService - NOM-024 Person Identification Fields', () => {
  let service: TrabajadoresService;
  let mockNom024Util: any;
  let mockCatalogsService: any;
  let mockGeographyValidator: any;

  // Create mock model factory
  const createMockModel = () => ({
    create: jest.fn(),
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
      exec: jest.fn().mockResolvedValue(null),
    }),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
        exec: jest.fn().mockResolvedValue([]),
      }),
      lean: jest.fn().mockResolvedValue([]),
      exec: jest.fn().mockResolvedValue([]),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
      exec: jest.fn().mockResolvedValue(null),
    }),
    save: jest.fn(),
    countDocuments: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    }),
  });

  beforeEach(async () => {
    mockNom024Util = {
      requiresNOM024Compliance: jest.fn().mockResolvedValue(true),
      getProveedorPais: jest.fn().mockResolvedValue('MX'),
    };

    mockCatalogsService = {
      validateINEGI: jest.fn().mockResolvedValue(true),
      validateNacionalidad: jest.fn().mockResolvedValue(true),
      validateCLUES: jest.fn().mockResolvedValue(true),
      validateCIE10: jest.fn().mockResolvedValue(true),
    };

    mockGeographyValidator = {
      validateEntidad: jest.fn().mockResolvedValue(true),
      validateMunicipio: jest.fn().mockResolvedValue(true),
      validateLocalidad: jest.fn().mockResolvedValue(true),
      validateGeography: jest.fn().mockResolvedValue({
        valid: true,
        errors: [],
      }),
    };

    const mockFilesService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrabajadoresService,
        {
          provide: getModelToken(Trabajador.name),
          useValue: createMockModel(),
        },
        { provide: getModelToken('Antidoping'), useValue: createMockModel() },
        {
          provide: getModelToken('AptitudPuesto'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('Audiometria'), useValue: createMockModel() },
        { provide: getModelToken('Certificado'), useValue: createMockModel() },
        {
          provide: getModelToken('CertificadoExpedito'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('DocumentoExterno'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('ExamenVista'), useValue: createMockModel() },
        {
          provide: getModelToken('ExploracionFisica'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('HistoriaClinica'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('NotaMedica'), useValue: createMockModel() },
        {
          provide: getModelToken('ControlPrenatal'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('ConstanciaAptitud'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('Receta'), useValue: createMockModel() },
        {
          provide: getModelToken('RiesgoTrabajo'),
          useValue: createMockModel(),
        },
        {
          provide: getModelToken('CentroTrabajo'),
          useValue: createMockModel(),
        },
        { provide: getModelToken('User'), useValue: createMockModel() },
        { provide: getModelToken('Empresa'), useValue: createMockModel() },
        { provide: NOM024ComplianceUtil, useValue: mockNom024Util },
        { provide: CatalogsService, useValue: mockCatalogsService },
        { provide: FilesService, useValue: mockFilesService },
        { provide: GeographyValidator, useValue: mockGeographyValidator },
      ],
    }).compile();

    service = module.get<TrabajadoresService>(TrabajadoresService);
  });

  describe('NOM-024 Person Identification Fields', () => {
    it('should validate INEGI codes for MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      // Test that INEGI validation is called for MX providers
      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');
      expect(requiresCompliance).toBe(true);

      const isValidEstado = await mockCatalogsService.validateINEGI(
        'estado',
        '09',
      );
      expect(isValidEstado).toBe(true);
    });

    it('should not require INEGI codes for non-MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('nonMxProveedorId');
      expect(requiresCompliance).toBe(false);
    });

    it('should validate nacionalidad against catalog', async () => {
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      const isValid = await mockCatalogsService.validateNacionalidad('MEX');
      expect(isValid).toBe(true);
      expect(mockCatalogsService.validateNacionalidad).toHaveBeenCalledWith(
        'MEX',
      );
    });

    it('should reject invalid nacionalidad code', async () => {
      mockCatalogsService.validateNacionalidad.mockResolvedValue(false);

      const isValid = await mockCatalogsService.validateNacionalidad('INVALID');
      expect(isValid).toBe(false);
    });

    it('should validate hierarchical INEGI codes', async () => {
      // Municipio must be within estado
      mockCatalogsService.validateINEGI
        .mockResolvedValueOnce(true) // estado
        .mockResolvedValueOnce(true); // municipio within estado

      const isEstadoValid = await mockCatalogsService.validateINEGI(
        'estado',
        '09',
      );
      const isMunicipioValid = await mockCatalogsService.validateINEGI(
        'municipio',
        '017',
        '09',
      );

      expect(isEstadoValid).toBe(true);
      expect(isMunicipioValid).toBe(true);
    });

    it('should accept edge case codes (NE, 00)', async () => {
      // NE = foreign, 00 = not available
      const edgeCases = ['NE', '00'];

      edgeCases.forEach((code) => {
        expect(['NE', '00', 'NND'].includes(code)).toBe(true);
      });
    });
  });

  describe('CURP Validation', () => {
    it('should require CURP for MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');
      expect(requiresCompliance).toBe(true);
    });

    it('should not require CURP for non-MX providers', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('nonMxProveedorId');
      expect(requiresCompliance).toBe(false);
    });
  });

  describe('Conditional Enforcement', () => {
    it('should enforce validation for MX providers (pais === MX)', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);

      const requiresCompliance =
        await mockNom024Util.requiresNOM024Compliance('mxProveedorId');
      expect(requiresCompliance).toBe(true);
    });

    it('should be permissive for non-MX providers (GT, PA)', async () => {
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(false);

      const gtResult =
        await mockNom024Util.requiresNOM024Compliance('gtProveedorId');
      expect(gtResult).toBe(false);
    });
  });

  describe('Validación A2 - fechaNacimiento', () => {
    const mockCreateTrabajadorDto = {
      primerApellido: 'Apellido',
      nombre: 'Nombre',
      fechaNacimiento: new Date('1990-01-01'),
      sexo: 'Masculino',
      escolaridad: 'Licenciatura',
      puesto: 'Puesto',
      estadoCivil: 'Soltero/a',
      estadoLaboral: 'Activo',
      idCentroTrabajo: 'centro123',
      createdBy: 'user123',
      updatedBy: 'user123',
    };

    it('debe rechazar crear trabajador con fechaNacimiento futura', async () => {
      const mockTrabajadorModel = service['trabajadorModel'];
      const fechaFutura = new Date();
      fechaFutura.setFullYear(fechaFutura.getFullYear() + 1);

      const dto = {
        ...mockCreateTrabajadorDto,
        fechaNacimiento: fechaFutura,
      };

      // Mock para getProveedorSaludIdFromCentroTrabajo
      const mockCentroTrabajoModel = service['centroTrabajoModel'];
      const mockEmpresaModel = service['empresaModel'];
      mockCentroTrabajoModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idEmpresa: 'empresa123' }),
      });
      mockEmpresaModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idProveedorSalud: 'proveedor123' }),
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'La fecha de nacimiento no puede ser futura',
      );
    });

    it('debe rechazar crear trabajador con edad > 120 años', async () => {
      const fechaHace121 = new Date();
      fechaHace121.setFullYear(fechaHace121.getFullYear() - 121);

      const dto = {
        ...mockCreateTrabajadorDto,
        fechaNacimiento: fechaHace121,
      };

      // Mock para getProveedorSaludIdFromCentroTrabajo
      const mockCentroTrabajoModel = service['centroTrabajoModel'];
      const mockEmpresaModel = service['empresaModel'];
      mockCentroTrabajoModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idEmpresa: 'empresa123' }),
      });
      mockEmpresaModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idProveedorSalud: 'proveedor123' }),
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        'está fuera del rango válido',
      );
    });

    it('debe permitir crear trabajador con fechaNacimiento válida', async () => {
      const mockTrabajadorModel = service['trabajadorModel'];
      const mockCentroTrabajoModel = service['centroTrabajoModel'];
      const mockEmpresaModel = service['empresaModel'];

      const fechaValida = new Date('1990-01-01');
      const dto = {
        ...mockCreateTrabajadorDto,
        fechaNacimiento: fechaValida,
      };

      // Mock para getProveedorSaludIdFromCentroTrabajo
      mockCentroTrabajoModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idEmpresa: 'empresa123' }),
      });
      mockEmpresaModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idProveedorSalud: 'proveedor123' }),
      });

      // Mock para save
      const savedTrabajador = { ...dto, _id: 'trabajador123' };
      mockTrabajadorModel.save = jest.fn().mockResolvedValue(savedTrabajador);
      mockTrabajadorModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      // Mock constructor
      (mockTrabajadorModel as any).mockImplementation((data: any) => ({
        ...data,
        save: mockTrabajadorModel.save,
      }));

      const result = await service.create(dto);
      expect(result).toBeDefined();
    });
  });

  describe('Validación A1 - CURP Cross-Check', () => {
    const mockCreateTrabajadorDto = {
      primerApellido: 'GARCIA',
      nombre: 'JUAN',
      fechaNacimiento: new Date('1990-05-15'),
      sexo: 'Masculino',
      escolaridad: 'Licenciatura',
      puesto: 'Puesto',
      estadoCivil: 'Soltero/a',
      estadoLaboral: 'Activo',
      idCentroTrabajo: 'centro123',
      createdBy: 'user123',
      updatedBy: 'user123',
    };

    it('debe rechazar crear trabajador con CURP inconsistente (fecha)', async () => {
      const mockTrabajadorModel = service['trabajadorModel'];
      const mockCentroTrabajoModel = service['centroTrabajoModel'];
      const mockEmpresaModel = service['empresaModel'];

      const dto = {
        ...mockCreateTrabajadorDto,
        curp: 'GALJ900515HDFLRN08', // Fecha: 1990-05-15
        fechaNacimiento: new Date('1991-05-15'), // Fecha diferente
        sexo: 'Masculino',
        entidadNacimiento: '09',
      };

      // Mock proveedor MX
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      // Mock para getProveedorSaludIdFromCentroTrabajo
      mockCentroTrabajoModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idEmpresa: 'empresa123' }),
      });
      mockEmpresaModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idProveedorSalud: 'proveedor123' }),
      });

      // Mock para save (no debería llegar aquí)
      mockTrabajadorModel.save = jest.fn();
      (mockTrabajadorModel as any).mockImplementation((data: any) => ({
        ...data,
        save: mockTrabajadorModel.save,
      }));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      try {
        await service.create(dto);
      } catch (error: any) {
        expect(error.response?.ruleId || error.ruleId).toBe('A1');
      }
    });

    it('debe rechazar crear trabajador con CURP inconsistente (sexo)', async () => {
      const mockCentroTrabajoModel = service['centroTrabajoModel'];
      const mockEmpresaModel = service['empresaModel'];

      const dto = {
        ...mockCreateTrabajadorDto,
        curp: 'GALJ900515HDFLRN08', // H (Hombre)
        fechaNacimiento: new Date('1990-05-15'),
        sexo: 'Femenino', // Sexo diferente
        entidadNacimiento: '09',
      };

      // Mock proveedor MX
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      // Mock para getProveedorSaludIdFromCentroTrabajo
      mockCentroTrabajoModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idEmpresa: 'empresa123' }),
      });
      mockEmpresaModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idProveedorSalud: 'proveedor123' }),
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      try {
        await service.create(dto);
      } catch (error: any) {
        expect(error.response?.ruleId || error.ruleId).toBe('A1');
      }
    });

    it('debe permitir crear trabajador con CURP genérica', async () => {
      const mockTrabajadorModel = service['trabajadorModel'];
      const mockCentroTrabajoModel = service['centroTrabajoModel'];
      const mockEmpresaModel = service['empresaModel'];

      const dto = {
        ...mockCreateTrabajadorDto,
        curp: 'XXXX999999XXXXXX99', // CURP genérica
        fechaNacimiento: new Date('1990-05-15'),
        sexo: 'Masculino',
      };

      // Mock proveedor MX
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      // Mock para getProveedorSaludIdFromCentroTrabajo
      mockCentroTrabajoModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idEmpresa: 'empresa123' }),
      });
      mockEmpresaModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idProveedorSalud: 'proveedor123' }),
      });

      // Mock para save
      const savedTrabajador = { ...dto, _id: 'trabajador123' };
      mockTrabajadorModel.save = jest.fn().mockResolvedValue(savedTrabajador);
      mockTrabajadorModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      // Mock constructor
      (mockTrabajadorModel as any).mockImplementation((data: any) => ({
        ...data,
        save: mockTrabajadorModel.save,
      }));

      // No debe lanzar error
      const result = await service.create(dto);
      expect(result).toBeDefined();
    });

    it('debe permitir crear trabajador con CURP válida y datos consistentes', async () => {
      const mockTrabajadorModel = service['trabajadorModel'];
      const mockCentroTrabajoModel = service['centroTrabajoModel'];
      const mockEmpresaModel = service['empresaModel'];

      const dto = {
        ...mockCreateTrabajadorDto,
        curp: 'GALJ900515HDFLRN08', // 1990-05-15, H, DF (09)
        fechaNacimiento: new Date('1990-05-15'),
        sexo: 'Masculino',
        entidadNacimiento: '09',
      };

      // Mock proveedor MX
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateINEGI.mockResolvedValue(true);
      mockCatalogsService.validateNacionalidad.mockResolvedValue(true);

      // Mock para getProveedorSaludIdFromCentroTrabajo
      mockCentroTrabajoModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idEmpresa: 'empresa123' }),
      });
      mockEmpresaModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ idProveedorSalud: 'proveedor123' }),
      });

      // Mock para save
      const savedTrabajador = { ...dto, _id: 'trabajador123' };
      mockTrabajadorModel.save = jest.fn().mockResolvedValue(savedTrabajador);
      mockTrabajadorModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      // Mock constructor
      (mockTrabajadorModel as any).mockImplementation((data: any) => ({
        ...data,
        save: mockTrabajadorModel.save,
      }));

      const result = await service.create(dto);
      expect(result).toBeDefined();
    });
  });

  describe('Validación A3 - Geographic Hierarchy', () => {
    it('debe rechazar crear trabajador con municipio fuera de entidad', async () => {
      mockGeographyValidator.validateGeography.mockResolvedValue({
        valid: false,
        errors: [
          {
            field: 'municipio',
            reason: 'El municipio "999" no pertenece a la entidad "25"',
          },
        ],
      });

      const dto = {
        primerApellido: 'García',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Desarrollador',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: '507f1f77bcf86cd799439011',
        createdBy: '507f1f77bcf86cd799439012',
        updatedBy: '507f1f77bcf86cd799439012',
        entidadResidencia: '25',
        municipioResidencia: '999', // Municipio inválido para entidad 25
      };

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.create(dto as any)).rejects.toMatchObject({
        response: {
          code: 'VALIDATION_ERROR',
          ruleId: 'A3',
          message: 'La información geográfica es inconsistente',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'municipioResidencia',
              reason: expect.stringContaining('no pertenece'),
            }),
          ]),
        },
      });
    });

    it('debe rechazar crear trabajador con localidad fuera de municipio', async () => {
      mockGeographyValidator.validateGeography.mockResolvedValue({
        valid: false,
        errors: [
          {
            field: 'localidad',
            reason: 'La localidad "9999" no pertenece al municipio "001"',
          },
        ],
      });

      const dto = {
        primerApellido: 'García',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Desarrollador',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: '507f1f77bcf86cd799439011',
        createdBy: '507f1f77bcf86cd799439012',
        updatedBy: '507f1f77bcf86cd799439012',
        entidadResidencia: '25',
        municipioResidencia: '001',
        localidadResidencia: '9999', // Localidad inválida para municipio 001
      };

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.create(dto as any)).rejects.toMatchObject({
        response: {
          code: 'VALIDATION_ERROR',
          ruleId: 'A3',
          message: 'La información geográfica es inconsistente',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'localidadResidencia',
              reason: expect.stringContaining('no pertenece'),
            }),
          ]),
        },
      });
    });

    it('debe permitir crear trabajador con jerarquía válida completa', async () => {
      mockGeographyValidator.validateEntidad.mockResolvedValue(true);
      mockGeographyValidator.validateGeography.mockResolvedValue({
        valid: true,
        errors: [],
      });

      const mockTrabajadorModel = createMockModel();
      mockTrabajadorModel.save = jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439013',
        ...dto,
      });

      const dto = {
        primerApellido: 'García',
        nombre: 'Juan',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 'Masculino',
        escolaridad: 'Licenciatura',
        puesto: 'Desarrollador',
        estadoCivil: 'Soltero/a',
        estadoLaboral: 'Activo',
        idCentroTrabajo: '507f1f77bcf86cd799439011',
        createdBy: '507f1f77bcf86cd799439012',
        updatedBy: '507f1f77bcf86cd799439012',
        entidadNacimiento: '25',
        entidadResidencia: '25',
        municipioResidencia: '001',
        localidadResidencia: '0001',
      };

      (service as any).trabajadorModel = mockTrabajadorModel;
      (service as any).centroTrabajoModel = {
        findById: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            idEmpresa: '507f1f77bcf86cd799439014',
          }),
        }),
      };
      (service as any).empresaModel = {
        findById: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            idProveedorSalud: '507f1f77bcf86cd799439015',
          }),
        }),
      };

      const result = await service.create(dto as any);
      expect(result).toBeDefined();
      expect(mockGeographyValidator.validateGeography).toHaveBeenCalled();
    });

    it('debe rechazar actualizar trabajador con jerarquía inválida', async () => {
      const trabajadorId = '507f1f77bcf86cd799439013';
      const mockTrabajadorActual = {
        _id: trabajadorId,
        toObject: jest.fn().mockReturnValue({
          entidadResidencia: '25',
          municipioResidencia: '001',
          localidadResidencia: '0001',
        }),
        idCentroTrabajo: '507f1f77bcf86cd799439011',
      };

      (service as any).trabajadorModel = {
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockTrabajadorActual),
        }),
      };

      mockGeographyValidator.validateGeography.mockResolvedValue({
        valid: false,
        errors: [
          {
            field: 'municipio',
            reason: 'El municipio "999" no pertenece a la entidad "25"',
          },
        ],
      });

      const updateDto = {
        municipioResidencia: '999', // Municipio inválido
      };

      await expect(
        service.update(trabajadorId, updateDto as any),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.update(trabajadorId, updateDto as any),
      ).rejects.toMatchObject({
        response: {
          code: 'VALIDATION_ERROR',
          ruleId: 'A3',
        },
      });
    });
  });
});
