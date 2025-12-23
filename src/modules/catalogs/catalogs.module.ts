import { Module, Global } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';

/**
 * Catalogs Module
 *
 * Provides catalog loading, caching, and validation services for NOM-024 compliance.
 * This module is global so it can be used across the application without explicit imports.
 */
@Global()
@Module({
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}
