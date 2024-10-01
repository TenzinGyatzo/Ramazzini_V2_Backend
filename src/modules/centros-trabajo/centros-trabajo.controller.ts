import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, HttpCode, Res } from '@nestjs/common';
import { CentrosTrabajoService } from './centros-trabajo.service';
import { CreateCentrosTrabajoDto } from './dto/create-centros-trabajo.dto';
import { UpdateCentrosTrabajoDto } from './dto/update-centros-trabajo.dto';
import { isValidObjectId } from 'mongoose';

@Controller(':empresaId')
export class CentrosTrabajoController {
  constructor(private readonly centrosTrabajoService: CentrosTrabajoService) {}

  @Post('crear-centro-trabajo')
  async create(@Body() createCentrosTrabajoDto: CreateCentrosTrabajoDto) {
    try {
      const centroTrabajo = await this.centrosTrabajoService.create(createCentrosTrabajoDto);
      return { message: 'Centro de Trabajo creado exitosamente', data: centroTrabajo };
    } catch (error) {
      throw new BadRequestException('Error al crear el centro de trabajo');
    }
  }

  @Get('/centros-trabajo')
  async findCentersByCompany(@Param('empresaId') empresaId: string) {
    if (!isValidObjectId(empresaId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }
    
    const centrosTrabajo = await this.centrosTrabajoService.findCentersByCompany(empresaId);
  
    if (!centrosTrabajo || centrosTrabajo.length === 0) {
      return { message: 'No se encontraron centros de trabajo' }; 
    }
  
    return centrosTrabajo;
  }

  @Patch('/actualizar-centro-trabajo/:centroId')
  async update(@Param('centroId') centroId: string, @Body() updateCentrosTrabajoDto: UpdateCentrosTrabajoDto) {
    if (!isValidObjectId(centroId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const updatedCentroTrabajo = await this.centrosTrabajoService.update(centroId, updateCentrosTrabajoDto);

    if (!updatedCentroTrabajo) {
      return { message: `No se pudo actualizar el centro de trabajo con id ${centroId}` };
    }
    
    return {
      message: 'Centro de Trabajo actualizado exitosamente',
      data: updatedCentroTrabajo,
    }
  }

  @Delete('/eliminar-centro-trabajo/:centroId')
  async remove(@Param('empresaId') empresaId: string, @Param('centroId') centroId: string) {
    if (!isValidObjectId(empresaId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    if (!isValidObjectId(centroId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedCentroTrabajo = await this.centrosTrabajoService.remove(centroId);

    if (!deletedCentroTrabajo) {
      return { message: `El centro de trabajo con ID ${centroId} no existe o ya ha sido eliminado.` };
    }

    return {
      message: 'Centro de Trabajo eliminado exitosamente',
    }
  }
}

