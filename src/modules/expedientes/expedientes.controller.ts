import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { CreateAntidopingDto } from './dto/create-antidoping.dto';
import { UpdateAntidopingDto } from './dto/update-antidoping.dto';
import { CreateAptitudDto } from './dto/create-aptitud.dto';
import { UpdateAptitudDto } from './dto/update-aptitud.dto';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import { CreateDocumentoExternoDto } from './dto/create-documento-externo.dto';
import { UpdateDocumentoExternoDto } from './dto/update-documento-externo.dto';
import { isValidObjectId } from 'mongoose';

@Controller('api/expedientes/:trabajadorId/documentos')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  /////////// Antidopings ///////////
  @Post('crear-antidoping')
  async createAntidoping(@Body() createAntidopingDto: CreateAntidopingDto) {
    try {
      const antidoping = await this.expedientesService.createAntidoping(createAntidopingDto);
      return { message: 'Antidoping creado exitosamente', data: antidoping };
    } catch (error) {
      console.error('Error detallado:', error);
      throw new BadRequestException('Error al crear el antidoping', error);
    }
  }

  @Get('antidopings')
  async findAntidopings(@Param('trabajadorId') trabajadorId: string) {
    
    const antidopings = await this.expedientesService.findAntidopings(trabajadorId);

    if (!antidopings || antidopings.length === 0) {
      return { message: 'No se encontraron antidopings' };
    }

    return antidopings;

  }

  @Patch('actualizar-antidoping/:id')
  async updateAntidoping(@Param('id') id: string, @Body() updateAntidopingDto: UpdateAntidopingDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const updatedAntidoping = await this.expedientesService.updateAntidoping(id, updateAntidopingDto);

    if (!updatedAntidoping) {
      return { message: `No se pudo actualizar el antidoping con id ${id}` };
    }

    return { message: 'Antidoping actualizado', data: updatedAntidoping };
  }

  @Delete('eliminar-antidoping/:id')
  async removeAntidoping(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedAntidoping = await this.expedientesService.removeAntidoping(id);

    if (!deletedAntidoping) {
      return { message: `El antidoping con id ${id} no existe o ya ha sido eliminado` };
    }
    return { message: `Antidoping con id ${id} ha sido eliminado exitosamente` };
  }

  /////////// Aptitudes al puesto ///////////
  @Post('crear-aptitud-al-puesto')
  async createAptitud(@Body() createAptitudDto: CreateAptitudDto) {
    try {
      const aptitud = await this.expedientesService.createAptitud(createAptitudDto);
      return { message: 'Informe de aptitud al puesto creado exitosamente', data: aptitud };
    } catch (error) {
      console.error('Error detallado:', error);
      throw new BadRequestException('Error al crear informe de aptitud al puesto', error);
    }
  }

  @Get('aptitudes-al-puesto')
  async findAptitudes(@Param('trabajadorId') trabajadorId: string) {
    
    const aptitudes = await this.expedientesService.findAptitudes(trabajadorId);

    if (!aptitudes || aptitudes.length === 0) {
      return { message: 'No se encontraron informes de aptitud al puesto' };
    }

    return aptitudes;

  }

  @Patch('actualizar-aptitud-al-puesto/:id')
  async updateAptitud(@Param('id') id: string, @Body() updateAptitudDto: UpdateAptitudDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const updatedAptitud = await this.expedientesService.updateAptitud(id, updateAptitudDto);

    if (!updatedAptitud) {
      return { message: `No se pudo actualizar el informe de aptitud al puesto con id ${id}` };
    }

    return { message: 'Informe de aptitud al puesto actualizado', data: updatedAptitud };
  }

  @Delete('eliminar-aptitud-al-puesto/:id')
  async removeAptitud(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedAptitud = await this.expedientesService.removeAptitud(id);

    if (!deletedAptitud) {
      return { message: `El informe de aptitud con id ${id} no existe o ya ha sido eliminado` };
    }
    return { message: `Informe de aptitud al puesto con id ${id} ha sido eliminado exitosamente` };
  }

  /////////// Certificados ///////////
  @Post('crear-certificado')
  async createCertificado(@Body() createCertificadoDto: CreateCertificadoDto) {
    try {
      const certificado = await this.expedientesService.createCertificado(createCertificadoDto);
      return { message: 'Certificado creado exitosamente', data: certificado };
    } catch (error) {
      console.error('Error detallado:', error);
      throw new BadRequestException('Error al crear el Certificado', error);
    }
  }

  @Get('certificados')
  async findCertificados(@Param('trabajadorId') trabajadorId: string) {
    
    const certificados = await this.expedientesService.findCertificados(trabajadorId);

    if (!certificados || certificados.length === 0) {
      return { message: 'No se encontraron certificados' };
    }

    return certificados;

  }

  @Patch('actualizar-certificado/:id')
  async updateCertificado(@Param('id') id: string, @Body() updateCertificadoDto: UpdateCertificadoDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const updatedCertificado = await this.expedientesService.updateCertificado(id, updateCertificadoDto);

    if (!updatedCertificado) {
      return { message: `No se pudo actualizar el certificado con id ${id}` };
    }

    return { message: 'Certificado actualizado', data: updatedCertificado };
  }

  @Delete('eliminar-certificado/:id')
  async removeCertificado(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedCertificado = await this.expedientesService.removeCertificado(id);

    if (!deletedCertificado) {
      return { message: `El certificado con id ${id} no existe o ya ha sido eliminado` };
    }
    return { message: `Certificado con id ${id} ha sido eliminado exitosamente` };
  }

  /////////// Documentos Externos ///////////
  @Post('cargar-documento-externo')
  async uploadDocumentoExterno(@Body() uploadDocumentoExternoDto: CreateDocumentoExternoDto) {
    try {
      const documentoExterno = await this.expedientesService.uploadDocumentoExterno(uploadDocumentoExternoDto);
      return { message: 'Documento externo subido exitosamente', data: documentoExterno };
    } catch (error) {
      console.error('Error detallado:', error);
      throw new BadRequestException('Error al subir el documento externo', error);
    }
  }

  @Get('externos')
  async findDocumentosExternos(@Param('trabajadorId') trabajadorId: string) {
    
    const documentosExternos = await this.expedientesService.findDocumentosExternos(trabajadorId);

    if (!documentosExternos || documentosExternos.length === 0) {
      return { message: 'No se encontraron documentos externos' };
    }

    return documentosExternos;

  }

  @Patch('actualizar-documento-externo/:id')
  async updateDocumentoExterno(@Param('id') id: string, @Body() updateDocumentoExternoDto: UpdateDocumentoExternoDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const updatedDocumentoExterno = await this.expedientesService.updateDocumentoExterno(id, updateDocumentoExternoDto);

    if (!updatedDocumentoExterno) {
      return { message: `No se pudo actualizar el documentocon id ${id}` };
    }

    return { message: 'Documento externo actualizado', data: updatedDocumentoExterno };
  }

  @Delete('eliminar-documento-externo/:id')
  async removeDocumentoExterno(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedDocumentoExterno = await this.expedientesService.removeDocumentoExterno(id);

    if (!deletedDocumentoExterno) {
      return { message: `El documento con id ${id} no existe o ya ha sido eliminado` };
    }
    return { message: `El documento con id ${id} ha sido eliminado exitosamente` };
  }
}
