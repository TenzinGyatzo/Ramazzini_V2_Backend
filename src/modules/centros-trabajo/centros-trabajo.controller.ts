import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { CentrosTrabajoService } from './centros-trabajo.service';
import { CreateCentrosTrabajoDto } from './dto/create-centros-trabajo.dto';
import { UpdateCentrosTrabajoDto } from './dto/update-centros-trabajo.dto';
import { isValidObjectId } from 'mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('api/:empresaId')
@ApiTags('Centros de Trabajo')
export class CentrosTrabajoController {
  constructor(private readonly centrosTrabajoService: CentrosTrabajoService) {}

  @Post('crear-centro-trabajo')
  @ApiOperation({ summary: 'Crea un nuevo centro de trabajo' })
  @ApiResponse({ status: 201, description: 'Centro de Trabajo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud Incorrecta *(Muestra violaciones de reglas de validación)*' })
  async create(@Body() createCentrosTrabajoDto: CreateCentrosTrabajoDto) {
    try {
      const centroTrabajo = await this.centrosTrabajoService.create(createCentrosTrabajoDto);
      return { message: 'Centro de Trabajo creado exitosamente', data: centroTrabajo };
    } catch (error) {
      throw new BadRequestException('Error al crear el centro de trabajo');
    }
  }

  @Get('/centros-trabajo')
  @ApiOperation({ summary: 'Obtiene todos los centros de trabajo de una empresa' })
  @ApiResponse({ status: 200, description: 'Centros de Trabajo encontrados exitosamente | Esta empresa no tiene centros de trabajo registrados' })
  @ApiResponse({ status: 400, description: 'El ID proporcionado no es válido' })
  async findCentersByCompany(@Param('empresaId') empresaId: string) {
    if (!isValidObjectId(empresaId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }
    
    const centrosTrabajo = await this.centrosTrabajoService.findCentersByCompany(empresaId);
  
    if (!centrosTrabajo || centrosTrabajo.length === 0) {
      return { message: 'Esta empresa no tiene centros de trabajo registrados' }; 
    }
  
    return centrosTrabajo;
  }

  @Patch('/actualizar-centro-trabajo/:centroId')
  @ApiOperation({ summary: 'Actualiza un centro de trabajo' })
  @ApiResponse({ status: 200, description: 'Centro de Trabajo actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'El ID de centro de trabajo proporcionado no es válido | Solicitud Incorrecta *(Muestra violaciones de reglas de validación)*' })
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
  @ApiOperation({ summary: 'Elimina un centro de trabajo' })
  @ApiResponse({ status: 200, description: 'Centro de Trabajo eliminado exitosamente | El centro de trabajo del ID proporcionado no existe o ya ha sido eliminado' })
  @ApiResponse({ status: 400, description: 'El ID de centro de trabajo proporcionado no es válido' })
  async remove(@Param('empresaId') empresaId: string, @Param('centroId') centroId: string) {
    if (!isValidObjectId(empresaId)) {
      throw new BadRequestException('El ID de empresa proporcionado no es válido');
    }

    if (!isValidObjectId(centroId)) {
      throw new BadRequestException('El ID de centro de trabajo proporcionado no es válido');
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

