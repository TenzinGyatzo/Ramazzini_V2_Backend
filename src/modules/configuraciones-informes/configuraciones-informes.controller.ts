import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConfiguracionesInformesService } from './configuraciones-informes.service';
import { CreateConfiguracionesInformeDto } from './dto/create-configuraciones-informe.dto';
import { UpdateConfiguracionesInformeDto } from './dto/update-configuraciones-informe.dto';

@Controller('configuraciones-informes')
export class ConfiguracionesInformesController {
  constructor(private readonly configuracionesInformesService: ConfiguracionesInformesService) {}

  @Post()
  create(@Body() createConfiguracionesInformeDto: CreateConfiguracionesInformeDto) {
    return this.configuracionesInformesService.create(createConfiguracionesInformeDto);
  }

  @Get()
  findAll() {
    return this.configuracionesInformesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configuracionesInformesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfiguracionesInformeDto: UpdateConfiguracionesInformeDto) {
    return this.configuracionesInformesService.update(+id, updateConfiguracionesInformeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configuracionesInformesService.remove(+id);
  }
}
