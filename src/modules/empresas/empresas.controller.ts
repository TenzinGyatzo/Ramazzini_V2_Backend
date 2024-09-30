import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, NotFoundException } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  async create(@Body() createEmpresaDto: CreateEmpresaDto) {
    try {
      const empresa = await this.empresasService.create(createEmpresaDto);
      return {
        message: 'Empresa creada exitosamente',
        data: empresa,
      };
    } catch (error) {
      throw new BadRequestException('Error al crear la empresa');
    }
  }

  @Get()
  async findAll() {
    const empresas = await this.empresasService.findAll();
    if (!empresas || empresas.length === 0) {
      throw new NotFoundException('No se encontraron empresas');
    }
    return empresas;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const empresa = await this.empresasService.findOne(id);
    if (!empresa) {
      throw new NotFoundException(`Empresa con id ${id} no encontrada`);
    }
    return empresa;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    const updatedEmpresa = await this.empresasService.update(id, updateEmpresaDto);
    if (!updatedEmpresa) {
      throw new NotFoundException(`No se pudo actualizar la empresa con id ${id}`);
    }
    return {
      message: 'Empresa actualizada exitosamente',
      data: updatedEmpresa,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedEmpresa = await this.empresasService.remove(id);
    if (!deletedEmpresa) {
      throw new NotFoundException(`No se pudo eliminar la empresa con id ${id}`);
    }
    return {
      message: 'Empresa eliminada exitosamente',
    };
  }
}
