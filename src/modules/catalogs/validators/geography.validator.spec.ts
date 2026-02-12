import { Test, TestingModule } from '@nestjs/testing';
import { GeographyValidator } from './geography.validator';
import { CatalogsService } from '../catalogs.service';

describe('GeographyValidator', () => {
  let validator: GeographyValidator;
  let mockCatalogsService: jest.Mocked<CatalogsService>;

  beforeEach(async () => {
    mockCatalogsService = {
      validateINEGI: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeographyValidator,
        {
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
      ],
    }).compile();

    validator = module.get<GeographyValidator>(GeographyValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEntidad', () => {
    it('should return true for valid entity', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const result = await validator.validateEntidad('25');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'estado',
        '25',
      );
    });

    it('should return false for invalid entity', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(false);

      const result = await validator.validateEntidad('99');

      expect(result).toBe(false);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'estado',
        '99',
      );
    });

    it('should return true for sentinel value NE', async () => {
      const result = await validator.validateEntidad('NE');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should return true for sentinel value 00', async () => {
      const result = await validator.validateEntidad('00');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should normalize entity code (trim + uppercase)', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const result = await validator.validateEntidad('  25  ');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'estado',
        '25',
      );
    });

    it('should return false for empty entity', async () => {
      const result = await validator.validateEntidad('');

      expect(result).toBe(false);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });
  });

  describe('validateMunicipio', () => {
    it('should return true for valid municipality belonging to entity', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const result = await validator.validateMunicipio('25', '001');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'municipio',
        '001',
        '25',
      );
    });

    it('should return false when municipality does not belong to entity', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(false);

      const result = await validator.validateMunicipio('25', '999');

      expect(result).toBe(false);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'municipio',
        '999',
        '25',
      );
    });

    it('should return false when municipality provided without entity', async () => {
      const result = await validator.validateMunicipio('', '001');

      expect(result).toBe(false);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should return true for sentinel value 000', async () => {
      const result = await validator.validateMunicipio('25', '000');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should return true when entity is sentinel (NE)', async () => {
      const result = await validator.validateMunicipio('NE', '001');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should normalize codes (trim + uppercase for entity, trim for municipio)', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const result = await validator.validateMunicipio('  25  ', '  001  ');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'municipio',
        '001',
        '25',
      );
    });

    it('should return false for empty municipality', async () => {
      const result = await validator.validateMunicipio('25', '');

      expect(result).toBe(false);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });
  });

  describe('validateLocalidad', () => {
    it('should return true for valid locality belonging to municipality', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const result = await validator.validateLocalidad('001', '0001', '25');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'localidad',
        '0001',
        '25-001',
      );
    });

    it('should return false when locality does not belong to municipality', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(false);

      const result = await validator.validateLocalidad('001', '9999', '25');

      expect(result).toBe(false);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'localidad',
        '9999',
        '25-001',
      );
    });

    it('should return false when locality provided without municipality', async () => {
      const result = await validator.validateLocalidad('', '0001', '25');

      expect(result).toBe(false);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should return true for sentinel value 0000', async () => {
      const result = await validator.validateLocalidad('001', '0000', '25');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should return true when municipality is sentinel (000)', async () => {
      const result = await validator.validateLocalidad('000', '0001', '25');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should normalize codes (trim for municipio and localidad)', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const result = await validator.validateLocalidad(
        '  001  ',
        '  0001  ',
        '  25  ',
      );

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'localidad',
        '0001',
        '25-001',
      );
    });

    it('should return false for empty locality', async () => {
      const result = await validator.validateLocalidad('001', '', '25');

      expect(result).toBe(false);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });

    it('should fallback to validate without parent if entity is sentinel', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const result = await validator.validateLocalidad('001', '0001', 'NE');

      expect(result).toBe(true);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'localidad',
        '0001',
        undefined,
      );
    });
  });

  describe('validateGeography', () => {
    it('should return valid=true for complete valid hierarchy', async () => {
      mockCatalogsService.validateINEGI
        .mockResolvedValueOnce(true) // entidad
        .mockResolvedValueOnce(true) // municipio
        .mockResolvedValueOnce(true); // localidad

      const result = await validator.validateGeography({
        entidad: '25',
        municipio: '001',
        localidad: '0001',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledTimes(3);
    });

    it('should return error when entity is invalid', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(false);

      const result = await validator.validateGeography({
        entidad: '99',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('entidad');
      expect(result.errors[0].reason).toContain('no existe en el catálogo');
    });

    it('should return error when municipality does not belong to entity', async () => {
      mockCatalogsService.validateINEGI
        .mockResolvedValueOnce(true) // entidad
        .mockResolvedValueOnce(false); // municipio

      const result = await validator.validateGeography({
        entidad: '25',
        municipio: '999',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('municipio');
      expect(result.errors[0].reason).toContain('no pertenece a la entidad');
    });

    it('should return error when locality does not belong to municipality', async () => {
      mockCatalogsService.validateINEGI
        .mockResolvedValueOnce(true) // entidad
        .mockResolvedValueOnce(true) // municipio
        .mockResolvedValueOnce(false); // localidad

      const result = await validator.validateGeography({
        entidad: '25',
        municipio: '001',
        localidad: '9999',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('localidad');
      expect(result.errors[0].reason).toContain('no pertenece al municipio');
    });

    it('should return error when municipality provided without entity', async () => {
      const result = await validator.validateGeography({
        municipio: '001',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('municipio');
      expect(result.errors[0].reason).toBe(
        'No puede existir municipio sin entidad',
      );
    });

    it('should return error when locality provided without municipality', async () => {
      const result = await validator.validateGeography({
        entidad: '25',
        localidad: '0001',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('localidad');
      expect(result.errors[0].reason).toBe(
        'No puede existir localidad sin municipio',
      );
    });

    it('should accept sentinel values (NE, 00, 000, 0000)', async () => {
      mockCatalogsService.validateINEGI.mockResolvedValue(true);

      const result = await validator.validateGeography({
        entidad: 'NE',
        municipio: '000',
        localidad: '0000',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return multiple errors for multiple violations', async () => {
      mockCatalogsService.validateINEGI
        .mockResolvedValueOnce(false) // entidad inválida
        .mockResolvedValueOnce(false); // municipio inválido

      const result = await validator.validateGeography({
        entidad: '99',
        municipio: '999',
        localidad: '0001', // sin municipio válido
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should normalize codes before validation', async () => {
      mockCatalogsService.validateINEGI
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const result = await validator.validateGeography({
        entidad: '  25  ',
        municipio: '  001  ',
        localidad: '  0001  ',
      });

      expect(result.valid).toBe(true);
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'estado',
        '25',
      );
      expect(mockCatalogsService.validateINEGI).toHaveBeenCalledWith(
        'municipio',
        '001',
        '25',
      );
    });

    it('should return valid=true when no geography data provided', async () => {
      const result = await validator.validateGeography({});

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockCatalogsService.validateINEGI).not.toHaveBeenCalled();
    });
  });
});
