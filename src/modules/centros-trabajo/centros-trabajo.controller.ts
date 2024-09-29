import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CentrosTrabajoService } from './centros-trabajo.service';
import { CreateCentrosTrabajoDto } from './dto/create-centros-trabajo.dto';
import { UpdateCentrosTrabajoDto } from './dto/update-centros-trabajo.dto';

@Controller('centros-trabajo')
export class CentrosTrabajoController {
  constructor(private readonly centrosTrabajoService: CentrosTrabajoService) {}

  @Post()
  create(@Body() createCentrosTrabajoDto: CreateCentrosTrabajoDto) {
    return this.centrosTrabajoService.create(createCentrosTrabajoDto);
  }

  @Get()
  findAll() {
    return this.centrosTrabajoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.centrosTrabajoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCentrosTrabajoDto: UpdateCentrosTrabajoDto) {
    return this.centrosTrabajoService.update(+id, updateCentrosTrabajoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centrosTrabajoService.remove(+id);
  }
}
