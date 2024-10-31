import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';

@Controller('api/expedientes/:trabajadorId/documentos')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Post()
  create(@Body() createExpedienteDto: CreateExpedienteDto) {
    return this.expedientesService.create(createExpedienteDto);
  }

  @Get('antidopings')
  findAll(@Param('trabajadorId') id: string) {
    return this.expedientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expedientesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpedienteDto: UpdateExpedienteDto) {
    return this.expedientesService.update(+id, updateExpedienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expedientesService.remove(+id);
  }
}
