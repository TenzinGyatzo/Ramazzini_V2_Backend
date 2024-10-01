import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, NotFoundException, HttpCode } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { isValidObjectId } from 'mongoose';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post('crear-empresa')
  async create(@Body() createEmpresaDto: CreateEmpresaDto) {
    try {
      const empresa = await this.empresasService.create(createEmpresaDto);
      return { message: 'Empresa creada exitosamente', data: empresa };
    } catch (error) {
      if (error.code === 11000) { // No se está aplicando el unique porque ya había registros duplicados desde el uso de Ramazzini-V1
        throw new BadRequestException('Ya existe una empresa con este RFC');
      }
      throw new BadRequestException('Error al crear la empresa');
    }
  }
  

  @Get()
  async findAll() {

    const empresas = await this.empresasService.findAll();

    if (!empresas || empresas.length === 0) {
      return { message: 'No se encontraron empresas' }
    }

    return empresas;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const empresa = await this.empresasService.findOne(id);

    if (!empresa) {
      throw new NotFoundException('No se encontró la empresa');
    }

    return empresa;
  }

  @Patch('/actualizar-empresa/:id')
  async update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const updatedEmpresa = await this.empresasService.update(id, updateEmpresaDto);

    if (!updatedEmpresa) {
      return { message: `No se pudo actualizar la empresa con id ${id}` };
    }

    return {
      message: 'Empresa actualizada exitosamente',
      data: updatedEmpresa,
    };
  }

  @Delete('/eliminar-empresa/:id')
  async remove(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedEmpresa = await this.empresasService.remove(id);

    if (!deletedEmpresa) {
      return { message: `La empresa con ID ${id} no existe o ya ha sido eliminada.` };
    }
    
    return {
      message: 'Empresa eliminada exitosamente',
    };
  }
}
