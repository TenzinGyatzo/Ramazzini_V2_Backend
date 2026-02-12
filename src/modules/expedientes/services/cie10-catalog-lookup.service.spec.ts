import { Test, TestingModule } from '@nestjs/testing';
import { Cie10CatalogLookupService } from './cie10-catalog-lookup.service';
import { CatalogsService } from '../../catalogs/catalogs.service';
import { CatalogType } from '../../catalogs/interfaces/catalog-entry.interface';
import { CIE10Entry } from '../../catalogs/interfaces/catalog-entry.interface';

describe('Cie10CatalogLookupService', () => {
  let service: Cie10CatalogLookupService;
  let catalogsService: jest.Mocked<CatalogsService>;

  beforeEach(async () => {
    const mockCatalogsService = {
      getCatalogEntry: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Cie10CatalogLookupService,
        {
          provide: CatalogsService,
          useValue: mockCatalogsService,
        },
      ],
    }).compile();

    service = module.get<Cie10CatalogLookupService>(Cie10CatalogLookupService);
    catalogsService = module.get(CatalogsService);
  });

  describe('findDiagnosisRule', () => {
    it('should find exact match by CATALOG_KEY', async () => {
      const mockEntry: CIE10Entry = {
        code: 'C530',
        description: 'Test',
        catalogKey: 'C530',
        lsex: 'MUJER',
        linfRaw: '010A',
        lsupRaw: '120A',
      };

      catalogsService.getCatalogEntry.mockResolvedValue(mockEntry);

      const result = await service.findDiagnosisRule('C530');

      expect(result).toEqual({
        key: 'C530',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A',
      });
      expect(catalogsService.getCatalogEntry).toHaveBeenCalledWith(
        CatalogType.CIE10,
        'C530',
      );
    });

    it('should fallback to prefix when exact match not found', async () => {
      // First call (exact) returns null
      catalogsService.getCatalogEntry.mockResolvedValueOnce(null);

      // Second call (prefix) returns entry
      const mockEntry: CIE10Entry = {
        code: 'C53',
        description: 'Test',
        catalogKey: 'C53',
        lsex: 'MUJER',
        linfRaw: '010A',
        lsupRaw: '120A',
      };
      catalogsService.getCatalogEntry.mockResolvedValueOnce(mockEntry);

      const result = await service.findDiagnosisRule('C530');

      expect(result).toEqual({
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A',
      });
      expect(catalogsService.getCatalogEntry).toHaveBeenCalledTimes(2);
      expect(catalogsService.getCatalogEntry).toHaveBeenNthCalledWith(
        1,
        CatalogType.CIE10,
        'C530',
      );
      expect(catalogsService.getCatalogEntry).toHaveBeenNthCalledWith(
        2,
        CatalogType.CIE10,
        'C53',
      );
    });

    it('should return null when neither exact nor prefix found', async () => {
      catalogsService.getCatalogEntry.mockResolvedValue(null);

      const result = await service.findDiagnosisRule('INVALID');

      expect(result).toBeNull();
    });

    it('should handle "NO" values for age limits', async () => {
      const mockEntry: CIE10Entry = {
        code: 'C50',
        description: 'Test',
        catalogKey: 'C50',
        lsex: 'NO',
        linfRaw: 'NO',
        lsupRaw: 'NO',
      };

      catalogsService.getCatalogEntry.mockResolvedValue(mockEntry);

      const result = await service.findDiagnosisRule('C50');

      expect(result).toEqual({
        key: 'C50',
        lsex: 'NO',
        linf: null,
        lsup: null,
      });
    });

    it('should handle codes with description', async () => {
      const mockEntry: CIE10Entry = {
        code: 'C53',
        description: 'Test',
        catalogKey: 'C53',
        lsex: 'MUJER',
        linfRaw: '010A',
        lsupRaw: '120A',
      };

      catalogsService.getCatalogEntry.mockResolvedValue(mockEntry);

      const result = await service.findDiagnosisRule('C53 - Description');

      expect(result).toEqual({
        key: 'C53',
        lsex: 'MUJER',
        linf: '010A',
        lsup: '120A',
      });
    });

    it('should return null for null input', async () => {
      const result = await service.findDiagnosisRule(null);
      expect(result).toBeNull();
      expect(catalogsService.getCatalogEntry).not.toHaveBeenCalled();
    });

    it('should return null for empty string', async () => {
      const result = await service.findDiagnosisRule('');
      expect(result).toBeNull();
      expect(catalogsService.getCatalogEntry).not.toHaveBeenCalled();
    });
  });
});
