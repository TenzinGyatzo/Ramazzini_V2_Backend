import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { CreateAntidopingDto } from './dto/create-antidoping.dto';
import { UpdateAntidopingDto } from './dto/update-antidoping.dto';
import { isValidObjectId } from 'mongoose';

@Controller('api/expedientes/:trabajadorId/documentos')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  @Post('crear-antidoping')
  async create(@Body() createAntidopingDto: CreateAntidopingDto) {
    try {
      const antidoping = await this.expedientesService.create(createAntidopingDto);
      return { message: 'Antidoping creado exitosamente', data: antidoping };
    } catch (error) {
      console.error('Error detallado:', error);
      throw new BadRequestException('Error al crear el antidoping', error);
    }
  }

  @Get('antidopings')
  async findAntiDopings(@Param('trabajadorId') trabajadorId: string) {
    
    const antidopings = await this.expedientesService.findAntidopings(trabajadorId);

    if (!antidopings || antidopings.length === 0) {
      return { message: 'No se encontraron antidopings' };
    }

    return antidopings;

  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.expedientesService.findOne(id);
  // }

  @Patch('actualizar-antidoping/:id')
  async update(@Param('id') id: string, @Body() updateAntidopingDto: UpdateAntidopingDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const updatedAntidoping = await this.expedientesService.update(id, updateAntidopingDto);

    if (!updatedAntidoping) {
      return { message: `No se pudo actualizar el antidoping con id ${id}` };
    }

    return { message: 'Antidoping actualizado', data: updatedAntidoping };
  }

  @Delete('eliminar-antidoping/:id')
  async remove(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedAntidoping = await this.expedientesService.remove(id);

    if (!deletedAntidoping) {
      return { message: `El antidoping con id ${id} no existe o ya ha sido eliminado` };
    }
    return { message: `Antidoping con id ${id} ha sido eliminado exitosamente` };
  }
}
