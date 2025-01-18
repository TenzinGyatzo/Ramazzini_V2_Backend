import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProveedoresSaludService } from './proveedores-salud.service';
import { CreateProveedoresSaludDto } from './dto/create-proveedores-salud.dto';
import { UpdateProveedoresSaludDto } from './dto/update-proveedores-salud.dto';

@Controller('proveedores-salud')
export class ProveedoresSaludController {
  constructor(private readonly proveedoresSaludService: ProveedoresSaludService) {}

  @Post()
  create(@Body() createProveedoresSaludDto: CreateProveedoresSaludDto) {
    return this.proveedoresSaludService.create(createProveedoresSaludDto);
  }

  @Get()
  findAll() {
    return this.proveedoresSaludService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedoresSaludService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProveedoresSaludDto: UpdateProveedoresSaludDto) {
    return this.proveedoresSaludService.update(+id, updateProveedoresSaludDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proveedoresSaludService.remove(+id);
  }
}
