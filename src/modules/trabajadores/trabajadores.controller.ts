import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, NotFoundException, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as xlsx from 'xlsx';
import { TrabajadoresService } from './trabajadores.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { isValidObjectId } from 'mongoose';
import { Response } from 'express';

@Controller('api/:empresaId/:centroId')
@ApiTags('Trabajadores')
export class TrabajadoresController {
  constructor(private readonly trabajadoresService: TrabajadoresService) {}

  @Get('/exportar-trabajadores')
  @ApiOperation({ summary: 'Exporta todos los trabajadores de un centro de trabajo en un archivo .xlsx' })
  @ApiResponse({ status: 200, description: 'Archivo de trabajadores exportado exitosamente' })
  @ApiResponse({ status: 400, description: 'El ID proporcionado no es válido' })
  async exportarTrabajadores(
    @Param('centroId') centroId: string,
    @Res() res: Response
  ) {
    if (!isValidObjectId(centroId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    // Llamar al servicio para generar el archivo .xlsx temporalmente
    const workbookBuffer = await this.trabajadoresService.exportarTrabajadores(centroId);

    // Configurar encabezados de respuesta para la descarga del archivo
    res.setHeader('Content-Disposition', 'attachment; filename="trabajadores.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Enviar el archivo al cliente
    res.send(workbookBuffer);
  }

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
  async findWorkersByCenter(@Param('empresaId') empresaId: string, @Param('centroId') centroId: string) {
    if (!isValidObjectId(empresaId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    if (!isValidObjectId(centroId)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const trabajadores = await this.trabajadoresService.findWorkersByCenter(centroId);

    if (!trabajadores || trabajadores.length === 0) {
      return { message: 'No hay trabajadores registrados en este centro de trabajo' };
    }

    return trabajadores;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un trabajador por su ID' })
  @ApiResponse({ status: 200, description: 'trabajador obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'El ID proporcionado no es válido' })
  @ApiResponse({ status: 404, description: 'No se encontró el trabajador' })
  async findOne(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const trabajador = await this.trabajadoresService.findOne(id);

    if (!trabajador) {
      throw new NotFoundException('No se encontró el trabajador');
    }

    return trabajador;
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

  @Post('importar-trabajadores')
    @UseInterceptors(FileInterceptor('file'))
    async importarTrabajadores(
        @UploadedFile() file: Express.Multer.File, 
        @Param('centroId') centroId: string,
        @Body('createdBy') createdBy: string
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó un archivo');
        }

        // Procesa el archivo Excel
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Llama al servicio para importar trabajadores y pasarle los datos procesados
        const result = await this.trabajadoresService.importarTrabajadores(data, centroId, createdBy);
        return {
          status: 200,
          message: 'Trabajadores importados exitosamente',
          data: result.data
      };
    }


  
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
