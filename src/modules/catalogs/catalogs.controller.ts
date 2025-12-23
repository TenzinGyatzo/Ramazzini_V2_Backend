import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CatalogType } from './interfaces/catalog-entry.interface';

@Controller('api/catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('clues/search')
  async searchCLUES(@Query('q') query: string, @Query('limit') limit?: number) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const searchLimit = limit
      ? Math.min(Math.max(1, parseInt(limit.toString())), 100)
      : 20;
    return this.catalogsService.searchCLUES(query.trim(), searchLimit);
  }

  @Get('clues/:code')
  async getCLUESByCode(@Param('code') code: string) {
    const entry = await this.catalogsService.getCLUESEntry(code);
    if (!entry) {
      throw new NotFoundException(`CLUES entry with code ${code} not found`);
    }
    return entry;
  }

  @Get('clues/validate/:code')
  async validateCLUES(@Param('code') code: string) {
    const isValid = await this.catalogsService.validateCLUESInOperation(code);
    return { isValid };
  }

  @Get('cp/search')
  async searchCP(@Query('q') query: string, @Query('limit') limit?: number) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const searchLimit = limit
      ? Math.min(Math.max(1, parseInt(limit.toString())), 100)
      : 20;
    return this.catalogsService.searchCP(query.trim(), searchLimit);
  }

  @Get('cp/:code')
  async getCPByCode(@Param('code') code: string) {
    const entry = await this.catalogsService.getCatalogEntry(
      CatalogType.CODIGOS_POSTALES,
      code,
    );
    if (!entry) {
      throw new NotFoundException(`Postal code entry with code ${code} not found`);
    }
    return entry;
  }

  @Get('geo/estados')
  getEstados() {
    return this.catalogsService.getEstados();
  }

  @Get('geo/municipios/:estadoCode')
  getMunicipios(@Param('estadoCode') estadoCode: string) {
    return this.catalogsService.getMunicipiosByEstado(estadoCode);
  }

  @Get('geo/localidades/:estadoCode/:municipioCode')
  getLocalidades(
    @Param('estadoCode') estadoCode: string,
    @Param('municipioCode') municipioCode: string,
    @Query('q') query?: string,
  ) {
    return this.catalogsService.getLocalidadesByMunicipio(
      estadoCode,
      municipioCode,
      query,
    );
  }

  @Get('geo/estados/search')
  async searchEstados(@Query('q') query: string, @Query('limit') limit?: number) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const searchLimit = limit
      ? Math.min(Math.max(1, parseInt(limit.toString())), 100)
      : 50;
    return this.catalogsService.searchEstados(query.trim(), searchLimit);
  }

  @Get('geo/estados/:code')
  async getEstadoByCode(@Param('code') code: string) {
    const entry = this.catalogsService.getEstadoByCode(code);
    if (!entry) {
      throw new NotFoundException(`Estado with code ${code} not found`);
    }
    return entry;
  }

  @Get('geo/municipios/:estadoCode/search')
  async searchMunicipios(
    @Param('estadoCode') estadoCode: string,
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const searchLimit = limit
      ? Math.min(Math.max(1, parseInt(limit.toString())), 100)
      : 50;
    return this.catalogsService.searchMunicipios(
      estadoCode,
      query.trim(),
      searchLimit,
    );
  }

  @Get('nacionalidades/search')
  async searchNacionalidades(@Query('q') query: string, @Query('limit') limit?: number) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const searchLimit = limit
      ? Math.min(Math.max(1, parseInt(limit.toString())), 100)
      : 50;
    return this.catalogsService.searchNacionalidades(query.trim(), searchLimit);
  }

  @Get('nacionalidades/:code')
  async getNacionalidadByCode(@Param('code') code: string) {
    const entry = this.catalogsService.getNacionalidadByCode(code);
    if (!entry) {
      throw new NotFoundException(`Nacionalidad with code ${code} not found`);
    }
    return entry;
  }
}

