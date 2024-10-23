import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { isValidObjectId } from 'mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller('api')
@ApiTags('Empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post('crear-empresa')
  @ApiOperation({ summary: 'Crea una nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud Incorrecta *(Muestra violaciones de reglas de validación)*' })
  @UseInterceptors(
    FileInterceptor('logotipoEmpresa', {
      storage: diskStorage({
        destination: path.resolve(__dirname, `../../../../${process.env.UPLOADS_DIR}`),
        filename: (req, file, callback) => {
          // Genera un nombre de archivo único basado en el nombre comercial de la empresa.
          const sanitizedCompanyName = req.body.nombreComercial
            .replace(/\s+/g, "-") // Reemplaza espacios por guiones
            .replace(/[^a-zA-Z0-9\-]/g, "") // Elimina caracteres especiales para evitar problemas en el nombre de archivo
            .toLowerCase(); // Convierte el nombre a minúsculas

          // Forma el nombre del archivo con el nombre comercial y la extensión original del archivo
          const uniqueFilename = `${sanitizedCompanyName}-logo${path.extname(file.originalname)}`;

          callback(null, uniqueFilename);
        }
      })
    })
  )
  async create(@Body() createEmpresaDto: CreateEmpresaDto, @UploadedFile() file: Express.Multer.File) {
    console.log('Archivo recibido:', file);
    console.log('Datos de la empresa:', createEmpresaDto);

    try {
      if (file) {
        createEmpresaDto.logotipoEmpresa = {
          data: file.filename,
          contentType: file.mimetype
        }
      }

      const empresa = await this.empresasService.create(createEmpresaDto);
      return { message: 'Empresa creada exitosamente', data: empresa };
    } catch (error) {
      if (error.code === 11000) { // No se está aplicando el unique porque ya había registros duplicados desde el uso de Ramazzini-V1
        throw new BadRequestException('Ya existe una empresa con este RFC');
      }
      throw new BadRequestException('Error al crear la empresa');
    }
  }
  
  @Get('empresas')
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
  @UseInterceptors(
    FileInterceptor('logotipoEmpresa', {
      storage: diskStorage({
        destination: path.resolve(__dirname, `../../../../${process.env.UPLOADS_DIR}`),
        filename: (req, file, callback) => {
          // Genera un nombre de archivo único basado en el nombre comercial de la empresa.
          const sanitizedCompanyName = req.body.nombreComercial
            .replace(/\s+/g, "-") // Reemplaza espacios por guiones
            .replace(/[^a-zA-Z0-9\-]/g, "") // Elimina caracteres especiales para evitar problemas en el nombre de archivo
            .toLowerCase(); // Convierte el nombre a minúsculas
  
          // Forma el nombre del archivo con el nombre comercial y la extensión original del archivo
          const uniqueFilename = `${sanitizedCompanyName}-logo${path.extname(file.originalname)}`;
          callback(null, uniqueFilename);
        }
      })
    })
  )
  async update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto, file: Express.Multer.File) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    // Si se sube un archivo, se añade al DTO para actualizar el logotipo
    if (file) {
      updateEmpresaDto.logotipoEmpresa = {
        data: file.filename,
        contentType: file.mimetype,
      };
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
