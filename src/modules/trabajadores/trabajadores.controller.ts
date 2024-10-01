import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { TrabajadoresService } from './trabajadores.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { isValidObjectId } from 'mongoose';

@Controller(':centroId')
@ApiTags('Trabajadores')
export class TrabajadoresController {
  constructor(private readonly trabajadoresService: TrabajadoresService) {}

  @Post('registrar-trabajador')
  @ApiOperation({ summary: 'Registra un trabajador nuevo '})
  @ApiResponse({ status: 201, description: 'Trabajador registrado exitosamente'})
  @ApiResponse({ status: 400, description: 'Solicitud Incorrecta *(Muestra violaciones de reglas de validación)*'})
  async create(@Body() createTrabajadorDto: CreateTrabajadorDto) {
    try {
      const trabajador = await this.trabajadoresService.create(createTrabajadorDto);
      return { message: 'Trabajador registrado', data: trabajador }
    } catch (error) {
      throw new BadRequestException('Error al registrar el trabajador');
    } 
  }

  @Get('/trabajadores')
  @ApiOperation({ summary: 'Obtiene todos los trabajadores de una empresa' })
  @ApiResponse({ status: 200, description: 'Trabajadores encontrados exitosamente | Este centro de trabajo no tiene trabajadores registrados' })
  @ApiResponse({ status: 400, description: 'El ID proporcionado no es válido' })
  async findWorkersByCenter(@Param('centroId') centroId: string) {
    if (!isValidObjectId(centroId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const trabajadores = await this.trabajadoresService.findWorkersByCenter(centroId);

    if (!trabajadores || trabajadores.length === 0) {
      return { message: 'No hay trabajadores registrados en este centro de trabajo' };
    }

    return trabajadores;
  }

  @Patch('/actualizar-trabajador/:id')
  @ApiOperation({ summary: 'Actualiza un trabajador' })
  @ApiResponse({ status: 200, description: 'Trabajador actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'El ID de trabajador proporcionado no es válido | Solicitud Incorrecta *(Muestra violaciones de reglas de validación)*' })
  async update(@Param('id') id: string, @Body() updateTrabajadorDto: UpdateTrabajadorDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const updatedTrabajador = await this.trabajadoresService.update(id, updateTrabajadorDto);

    if (!updatedTrabajador) {
      return { message: `No se pudo actualizar el trabajador con id ${id}` };
    }

    return { message: 'Trabajador actualizado', data: updatedTrabajador };
  }

  // AQUI TERMINAR DE DESARROLLAR ESTE
  @Delete('/eliminar-trabajador/:id')
  @ApiOperation({ summary: 'Elimina un trabajador' })
  @ApiResponse({ status: 200, description: 'Trabajador eliminado exitosamente | El trabajador del ID proporcionado no existe o ya ha sido eliminado' })
  @ApiResponse({ status: 400, description: 'El ID de trabajador proporcionado no es válido' })
  async remove(@Param('centroId') centroId: string, @Param('id') id: string) {
    if (!isValidObjectId(centroId)) {
      throw new BadRequestException('El ID de centro de trabajo proporcionado no es válido');
    }

    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID de trabajador proporcionado no es válido');
    }

    const deletedTrabajador = await this.trabajadoresService.remove(id);

    if (!deletedTrabajador) {
      return { message: `El trabajador con ID ${centroId} no existe o ya ha sido eliminado.` };
    }
    return {
      message: 'Trabajador/a eliminado exitosamente',
    }
  }
}
