import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { Lesion } from './schemas/lesion.schema';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../empresas/schemas/empresa.schema';
import { CatalogsService } from '../catalogs/catalogs.service';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { FilesService } from '../files/files.service';
import { DocumentoEstado } from './enums/documento-estado.enum';

describe('Lesion Validation - Without GIIS-B013 Catalog Dependencies', () => {
  let service: ExpedientesService;

  const mockLesionModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
    findByIdAndDelete: jest.fn(),
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

  const mockCatalogsService = {
    validateCIE10: jest.fn(),
    searchCatalog: jest.fn(),
  };

  const mockNom024Util = {
    requiresNOM024Compliance: jest.fn(),
  };

  const mockFilesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpedientesService,
        {
          provide: getModelToken(Lesion.name),
          useValue: mockLesionModel,
        },
        {
          provide: getModelToken('Antidoping'),
          useValue: {},
        },
        {
          provide: getModelToken('AptitudPuesto'),
          useValue: {},
        },
        {
          provide: getModelToken('Audiometria'),
          useValue: {},
        },
        {
          provide: getModelToken('Certificado'),
          useValue: {},
        },
        {
          provide: getModelToken('CertificadoExpedito'),
          useValue: {},
        },
        {
          provide: getModelToken('DocumentoExterno'),
          useValue: {},
        },
        {
          provide: getModelToken('ExamenVista'),
          useValue: {},
        },
        {
          provide: getModelToken('ExploracionFisica'),
          useValue: {},
        },
        {
          provide: getModelToken('HistoriaClinica'),
          useValue: {},
        },
        {
          provide: getModelToken('NotaMedica'),
          useValue: {},
        },
        {
          provide: getModelToken('ControlPrenatal'),
          useValue: {},
        },
        {
          provide: getModelToken('HistoriaOtologica'),
          useValue: {},
        },
        {
          provide: getModelToken('PrevioEspirometria'),
          useValue: {},
        },
        {
          provide: getModelToken('Receta'),
          useValue: {},
        },
        {
          provide: getModelToken('ConstanciaAptitud'),
          useValue: {},
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
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
        {
          provide: NOM024ComplianceUtil,
          useValue: mockNom024Util,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    service = module.get<ExpedientesService>(ExpedientesService);

    jest.clearAllMocks();
  });

  describe('Create Lesion - Without Catalog Files', () => {
    const mxTrabajadorId = 'trabajador123';
    const mxCentroTrabajoId = 'centro123';
    const mxEmpresaId = 'empresa123';
    const mxProveedorSaludId = 'proveedor123';

    beforeEach(() => {
      mockTrabajadorModel.findById.mockResolvedValue({
        _id: mxTrabajadorId,
        idCentroTrabajo: mxCentroTrabajoId,
      });
      mockCentroTrabajoModel.findById.mockResolvedValue({
        _id: mxCentroTrabajoId,
        idEmpresa: mxEmpresaId,
      });
      mockEmpresaModel.findById.mockResolvedValue({
        _id: mxEmpresaId,
        idProveedorSalud: mxProveedorSaludId,
      });
      mockNom024Util.requiresNOM024Compliance.mockResolvedValue(true);
      mockCatalogsService.validateCIE10.mockResolvedValue(true);
      mockLesionModel.findOne.mockResolvedValue(null); // No existing folio conflict
      mockLesionModel.create.mockReturnValue({
        save: jest.fn().mockResolvedValue({ _id: 'lesion123' }),
      });
      (service as any).actualizarUpdatedAtTrabajador = jest.fn().mockResolvedValue(undefined);
    });

    it('should create lesion with numeric codes without catalog validation', async () => {
      const createDto = {
        clues: 'CLUES12345',
        folio: '12345678',
        curpPaciente: 'ABCD123456HMNLMS01',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 1,
        fechaEvento: new Date('2024-01-15'),
        fechaAtencion: new Date('2024-01-15'),
        sitioOcurrencia: 5, // Numeric code - NOT validated against catalog
        intencionalidad: 1, // Accidental
        agenteLesion: 10, // Numeric code - NOT validated against catalog
        areaAnatomica: 3, // Numeric code - NOT validated against catalog
        consecuenciaGravedad: 2, // Numeric code - NOT validated against catalog
        tipoAtencion: [1, 2],
        codigoCIEAfeccionPrincipal: 'S72.0', // Validated against CIE-10 catalog
        codigoCIECausaExterna: 'V01.0', // Validated against CIE-10 catalog
        responsableAtencion: 1,
        curpResponsable: 'EFGH234567HMNLMS02',
        idTrabajador: mxTrabajadorId,
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      const result = await service.createLesion(createDto);

      expect(result).toBeDefined();
      // Verify that numeric codes were accepted without catalog validation
      expect(mockCatalogsService.validateCIE10).toHaveBeenCalledWith('S72.0');
      expect(mockCatalogsService.validateCIE10).toHaveBeenCalledWith('V01.0');
      // Note: sitioOcurrencia, agenteLesion, areaAnatomica, consecuenciaGravedad
      // are NOT validated against catalogs (catalogs not available)
    });

    it('should validate basic bounds for numeric catalog fields', async () => {
      const createDto = {
        clues: 'CLUES12345',
        folio: '12345678',
        curpPaciente: 'ABCD123456HMNLMS01',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 1,
        fechaEvento: new Date('2024-01-15'),
        fechaAtencion: new Date('2024-01-15'),
        sitioOcurrencia: 0, // Invalid: should be >= 1
        intencionalidad: 1,
        agenteLesion: 10,
        areaAnatomica: 3,
        consecuenciaGravedad: 2,
        tipoAtencion: [1],
        codigoCIEAfeccionPrincipal: 'S72.0',
        codigoCIECausaExterna: 'V01.0',
        responsableAtencion: 1,
        curpResponsable: 'EFGH234567HMNLMS02',
        idTrabajador: mxTrabajadorId,
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      await expect(service.createLesion(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.createLesion(createDto)).rejects.toThrow('Sitio de ocurrencia debe ser un número entero mayor o igual a 1');
    });

    it('should enforce conditional validation based on intencionalidad', async () => {
      // Accidental (1) requires agenteLesion
      const createDtoAccidental = {
        clues: 'CLUES12345',
        folio: '12345678',
        curpPaciente: 'ABCD123456HMNLMS01',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: 1,
        fechaEvento: new Date('2024-01-15'),
        fechaAtencion: new Date('2024-01-15'),
        sitioOcurrencia: 5,
        intencionalidad: 1, // Accidental
        // agenteLesion missing - should fail
        areaAnatomica: 3,
        consecuenciaGravedad: 2,
        tipoAtencion: [1],
        codigoCIEAfeccionPrincipal: 'S72.0',
        codigoCIECausaExterna: 'V01.0',
        responsableAtencion: 1,
        curpResponsable: 'EFGH234567HMNLMS02',
        idTrabajador: mxTrabajadorId,
        createdBy: 'user123',
        updatedBy: 'user123',
      };

      await expect(service.createLesion(createDtoAccidental)).rejects.toThrow(BadRequestException);
      await expect(service.createLesion(createDtoAccidental)).rejects.toThrow('Agente de lesión es obligatorio');
    });

    it('should allow update of non-finalized lesion', async () => {
      const existingLesion = {
        _id: 'lesion123',
        estado: DocumentoEstado.BORRADOR,
        toObject: jest.fn().mockReturnValue({
          _id: 'lesion123',
          estado: DocumentoEstado.BORRADOR,
          sitioOcurrencia: 5,
          areaAnatomica: 3,
          idTrabajador: mxTrabajadorId,
        }),
      };

      const updateDto = {
        sitioOcurrencia: 7, // Changed numeric code - accepted without catalog validation
        areaAnatomica: 4,
      };

      mockLesionModel.findById.mockResolvedValue(existingLesion);
      mockLesionModel.findOne.mockResolvedValue(null); // No folio conflict
      mockLesionModel.findByIdAndUpdate.mockResolvedValue({
        ...existingLesion,
        ...updateDto,
      });

      const result = await service.updateLesion('lesion123', updateDto);

      expect(result).toBeDefined();
      expect(result.sitioOcurrencia).toBe(7);
      // Verify numeric codes accepted without catalog validation
    });

    it('should block update of finalized lesion for MX provider', async () => {
      const finalizedLesion = {
        _id: 'lesion123',
        estado: DocumentoEstado.FINALIZADO,
        idTrabajador: mxTrabajadorId,
        toObject: jest.fn().mockReturnValue({
          _id: 'lesion123',
          estado: DocumentoEstado.FINALIZADO,
          idTrabajador: mxTrabajadorId,
        }),
      };

      mockLesionModel.findById.mockResolvedValue(finalizedLesion);

      const updateDto = {
        sitioOcurrencia: 7,
      };

      await expect(service.updateLesion('lesion123', updateDto)).rejects.toThrow(ForbiddenException);
      await expect(service.updateLesion('lesion123', updateDto)).rejects.toThrow('No se puede actualizar una lesión finalizada');
    });
  });
});

