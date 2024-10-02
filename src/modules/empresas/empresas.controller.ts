import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, NotFoundException } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { isValidObjectId } from 'mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('api/empresas')
@ApiTags('Empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post('crear-empresa')
  @ApiOperation({ summary: 'Crea una nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud Incorrecta *(Muestra violaciones de reglas de validación)*' })
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
  @ApiOperation({ summary: 'Obtiene todas las empresas' })
  @ApiResponse({ status: 200, description: 'Empresas obtenidas exitosamente' })
  async findAll() {

    const empresas = await this.empresasService.findAll();

    if (!empresas || empresas.length === 0) {
      return { message: 'No se encontraron empresas' }
    }

    return empresas;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una empresa por su ID' })
  @ApiResponse({ status: 200, description: 'Empresa obtenida exitosamente' })
  @ApiResponse({ status: 400, description: 'El ID proporcionado no es válido' })
  @ApiResponse({ status: 404, description: 'No se encontró la empresa' })
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
  @ApiOperation({ summary: 'Actualiza una empresa por su ID' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'El ID proporcionado no es válido | Solicitud Incorrecta *(Muestra violaciones de reglas de validación)*' })
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
  @ApiOperation({ summary: 'Elimina una empresa por su ID' })
  @ApiResponse({ status: 200, description: 'Empresa eliminada exitosamente | La empresa del ID proporcionado no existe o ya ha sido eliminada' })
  @ApiResponse({ status: 400, description: 'El ID proporcionado no es válido' })
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
