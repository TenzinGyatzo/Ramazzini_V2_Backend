import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RiesgosTrabajoService } from './riesgos-trabajo.service';
import { CreateRiesgosTrabajoDto } from './dto/create-riesgos-trabajo.dto';
import { UpdateRiesgosTrabajoDto } from './dto/update-riesgos-trabajo.dto';

@Controller('riesgos-trabajo/:trabajadorId')
export class RiesgosTrabajoController {
  constructor(private readonly riesgosTrabajoService: RiesgosTrabajoService) {}

  @Post('crear')
  create(@Body() createRiesgosTrabajoDto: CreateRiesgosTrabajoDto) {
    return this.riesgosTrabajoService.create(createRiesgosTrabajoDto);
  }

  @Get()
  findAll() {
    return this.riesgosTrabajoService.findAll();
  }

  @Get(':riesgoTrabajoId')
  findOne(@Param('riesgoTrabajoId') id: string) {
    return this.riesgosTrabajoService.findOne(+id);
  }

  @Patch(':riesgoTrabajoId')
  update(@Param('riesgoTrabajoId') id: string, @Body() updateRiesgosTrabajoDto: UpdateRiesgosTrabajoDto) {
    return this.riesgosTrabajoService.update(+id, updateRiesgosTrabajoDto);
  }

  @Delete(':riesgoTrabajoId')
  remove(@Param('riesgoTrabajoId') id: string) {
    return this.riesgosTrabajoService.remove(+id);
  }
}
