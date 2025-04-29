import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RiesgosTrabajoService } from './riesgos-trabajo.service';
import { CreateRiesgosTrabajoDto } from './dto/create-riesgos-trabajo.dto';
import { UpdateRiesgosTrabajoDto } from './dto/update-riesgos-trabajo.dto';

@Controller('riesgos-trabajo')
export class RiesgosTrabajoController {
  constructor(private readonly riesgosTrabajoService: RiesgosTrabajoService) {}

  @Post()
  create(@Body() createRiesgosTrabajoDto: CreateRiesgosTrabajoDto) {
    return this.riesgosTrabajoService.create(createRiesgosTrabajoDto);
  }

  @Get()
  findAll() {
    return this.riesgosTrabajoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.riesgosTrabajoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRiesgosTrabajoDto: UpdateRiesgosTrabajoDto) {
    return this.riesgosTrabajoService.update(+id, updateRiesgosTrabajoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.riesgosTrabajoService.remove(+id);
  }
}
