// expedientes.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, ValidationPipe } from '@nestjs/common';
import { ExpedientesService } from './expedientes.service';
import { isValidObjectId } from 'mongoose';
import { CreateAntidopingDto } from './dto/create-antidoping.dto';
import { UpdateAntidopingDto } from './dto/update-antidoping.dto';
import { CreateAptitudDto } from './dto/create-aptitud.dto';
import { UpdateAptitudDto } from './dto/update-aptitud.dto';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import { CreateDocumentoExternoDto } from './dto/create-documento-externo.dto';
import { UpdateDocumentoExternoDto } from './dto/update-documento-externo.dto';
import { CreateExamenVistaDto } from './dto/create-examen-vista.dto';
import { UpdateExamenVistaDto } from './dto/update-examen-vista.dto';
import { CreateExploracionFisicaDto } from './dto/create-exploracion-fisica.dto';
import { UpdateExploracionFisicaDto } from './dto/update-exploracion-fisica.dto';
import { CreateHistoriaClinicaDto } from './dto/create-historia-clinica.dto';
import { UpdateHistoriaClinicaDto } from './dto/update-historia-clinica.dto';

@Controller('api/expedientes/:trabajadorId/documentos')
export class ExpedientesController {
  constructor(private readonly expedientesService: ExpedientesService) {}

  // Mapeo de los DTOs correspondientes a cada tipo de documento
  private createDtos = {
    antidoping: CreateAntidopingDto,
    aptitud: CreateAptitudDto,
    certificado: CreateCertificadoDto,
    documentoExterno: CreateDocumentoExternoDto,
    examenVista: CreateExamenVistaDto,
    exploracionFisica: CreateExploracionFisicaDto,
    historiaClinica: CreateHistoriaClinicaDto
  };

  private updateDtos = {
    antidoping: UpdateAntidopingDto,
    aptitud: UpdateAptitudDto,
    certificado: UpdateCertificadoDto,
    documentoExterno: UpdateDocumentoExternoDto,
    examenVista: UpdateExamenVistaDto,
    exploracionFisica: UpdateExploracionFisicaDto,
    historiaClinica: UpdateHistoriaClinicaDto
  };

  @Post(':documentType/crear')
  async createDocument(
    @Param('documentType') documentType: string,
    @Body() createDto: any
  ) {
    const DtoClass = this.createDtos[documentType];
    if (!DtoClass) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }

    // Usa el DtoClass para la validación con el ValidationPipe
    const dtoInstance = Object.assign(new DtoClass(), createDto);
    await new ValidationPipe({ whitelist: true }).transform(dtoInstance, {
      type: 'body',
      metatype: DtoClass,
    });

    try {
      const document = await this.expedientesService.createDocument(documentType, dtoInstance);
      return { message: `${documentType} creado exitosamente`, data: document };
    } catch (error) {
      console.error('Error detallado:', error);
      throw new BadRequestException(`Error al crear el ${documentType}`, error);
    }
  }

  @Get(':documentType')
  async findDocuments(
    @Param('trabajadorId') trabajadorId: string,
    @Param('documentType') documentType: string
  ) {
    const documents = await this.expedientesService.findDocuments(documentType, trabajadorId);

    if (!documents || documents.length === 0) {
      return { message: `No se encontraron documentos de tipo ${documentType}` };
    }

    return documents;
  }

  @Get(':documentType/:id')
  async findDocument(@Param('documentType') documentType: string, @Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es valido');
    }
    const document = await this.expedientesService.findDocument(documentType, id);
    if (!document) {
      return { message: `No se encontró el documento de tipo ${documentType} con id ${id}` };
    }
    return document;
  }

  @Patch(':documentType/actualizar/:id')
  async updateDocument(
    @Param('documentType') documentType: string,
    @Param('id') id: string,
    @Body() updateDto: any
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const DtoClass = this.updateDtos[documentType];
    if (!DtoClass) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }

    // Usa el DtoClass para la validación con el ValidationPipe
    const dtoInstance = Object.assign(new DtoClass(), updateDto);
    await new ValidationPipe({ whitelist: true }).transform(dtoInstance, {
      type: 'body',
      metatype: DtoClass,
    });

    const updatedDocument = await this.expedientesService.updateDocument(documentType, id, dtoInstance);

    if (!updatedDocument) {
      return { message: `No se pudo actualizar el documento de tipo ${documentType} con id ${id}` };
    }

    return { message: `${documentType} actualizado`, data: updatedDocument };
  }

  @Delete(':documentType/eliminar/:id')
  async removeDocument(
    @Param('documentType') documentType: string,
    @Param('id') id: string
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedDocument = await this.expedientesService.removeDocument(documentType, id);

    if (!deletedDocument) {
      return { message: `El documento de tipo ${documentType} con id ${id} no existe o ya ha sido eliminado` };
    }
    return { message: `El documento de tipo ${documentType} con id ${id} ha sido eliminado exitosamente` };
  }
}
