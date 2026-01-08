import { Module, Global } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { GeographyValidator } from './validators/geography.validator';

/**
 * Catalogs Module
 *
 * Provides catalog loading, caching, and validation services for NOM-024 compliance.
 * This module is global so it can be used across the application without explicit imports.
 */
@Global()
@Module({
  controllers: [CatalogsController],
  providers: [CatalogsService, GeographyValidator],
  exports: [CatalogsService, GeographyValidator],
})
export class CatalogsModule {}
