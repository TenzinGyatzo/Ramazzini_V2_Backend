import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
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

  @Get('riesgos-trabajo')
  findAll() {
    return this.riesgosTrabajoService.findAll();
  }

  @Get(':riesgoTrabajoId')
  findOne(@Param('riesgoTrabajoId') riesgoTrabajoId: string) {
    return this.riesgosTrabajoService.findOne(riesgoTrabajoId);
  }

  @Patch(':riesgoTrabajoId')
  update(
    @Param('riesgoTrabajoId') riesgoTrabajoId: string,
    @Body() updateRiesgosTrabajoDto: UpdateRiesgosTrabajoDto,
  ) {
    return this.riesgosTrabajoService.update(
      riesgoTrabajoId,
      updateRiesgosTrabajoDto,
    );
  }

  @Delete(':riesgoTrabajoId')
  remove(@Param('riesgoTrabajoId') riesgoTrabajoId: string) {
    return this.riesgosTrabajoService.remove(riesgoTrabajoId);
  }
}
