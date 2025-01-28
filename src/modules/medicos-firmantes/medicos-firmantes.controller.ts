import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MedicosFirmantesService } from './medicos-firmantes.service';
import { CreateMedicoFirmanteDto } from './dto/create-medico-firmante.dto';
import { UpdateMedicoFirmanteDto } from './dto/update-medico-firmante.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { isValidObjectId } from 'mongoose';

@Controller('medicos-firmantes')
export class MedicosFirmantesController {
  constructor(
    private readonly medicosFirmantesService: MedicosFirmantesService,
  ) {}

  @Post('registrar-medico')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: path.resolve(
          __dirname,
          `../../../../${process.env.SIGNATORIES_UPLOADS_DIR}`,
        ),
        filename: (req, file, callback) => {
          // Genera un nombre de archivo único basado en el nombre del médico firmante
          const sanitizedDoctorName = req.body.nombre
            .replace(/\s+/g, '-') // Reemplaza espacios por guiones
            .replace(/[^a-zA-Z0-9\-]/g, '') // Elimina caracteres especiales
            .toLowerCase(); // Convierte a minúsculas

          // Forma el nombre del archivo dependiendo del campo enviado
          let uniqueFilename = `${sanitizedDoctorName}-firma${path.extname(file.originalname)}`;
          if (file.fieldname === 'firmaConAntefirma') {
            uniqueFilename = `${sanitizedDoctorName}-firma-con-antefirma${path.extname(file.originalname)}`;
          }

          callback(null, uniqueFilename);
        },
      }),
    }),
  )
  async create(
    @Body() createMedicoFirmanteDto: CreateMedicoFirmanteDto,
    @UploadedFile() files: Express.Multer.File[],
  ) {
    console.log('Archivos recibidos:', files);
    console.log('Datos del médico firmante:', createMedicoFirmanteDto);

    try {
      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file.fieldname === 'firma') {
            createMedicoFirmanteDto.firma = {
              data: file.filename,
              contentType: file.mimetype,
            };
          } else if (file.fieldname === 'firmaConAntefirma') {
            createMedicoFirmanteDto.firmaConAntefirma = {
              data: file.filename,
              contentType: file.mimetype,
            };
          }
        });
      }

      const medico = await this.medicosFirmantesService.create(
        createMedicoFirmanteDto,
      );
      return { message: 'Creado exitosamente', data: medico };
    } catch (error) {
      throw new BadRequestException(
        'Error al crear al registrar datos del médico firmante',
      );
    }
  }

  @Get('obtener-medicos')
  async findAll() {
    const medicos = await this.medicosFirmantesService.findAll();

    if (!medicos || medicos.length === 0) {
      return { message: 'No se encontraron medicos' };
    }

    return medicos;
  }

  @Get('obtener-medico/:id')
  async findOne(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const medico = await this.medicosFirmantesService.findOne(id);

    if (!medico) {
      throw new NotFoundException('No se encontró el médico firmante');
    }

    return medico;
  }

  @Get('obtener-medico-por-usuario/:idUser')
  async findOneByUserId(@Param('idUser') idUser: string) {
    // Validar si el idUser es un ObjectId válido (si es necesario)
    if (!isValidObjectId(idUser)) {
      throw new BadRequestException(
        'El ID de usuario proporcionado no es válido',
      );
    }

    // Llamar al servicio para buscar por idUser
    const medico =
      await this.medicosFirmantesService.findOneByUserId(idUser);

    // Si no se encuentra el médico, lanzar una excepción
    if (!medico) {
      return { message: 'No se encontró el médico firmante', data: null };
    }

    return medico;
  }

  @Patch('actualizar-medico/:id')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: path.resolve(
          __dirname,
          `../../../../${process.env.SIGNATORIES_UPLOADS_DIR}`,
        ),
        filename: (req, file, callback) => {
          // Genera un nombre de archivo único basado en el nombre del médico firmante
          const sanitizedDoctorName = req.body.nombre
            .replace(/\s+/g, '-') // Reemplaza espacios por guiones
            .replace(/[^a-zA-Z0-9\-]/g, '') // Elimina caracteres especiales
            .toLowerCase(); // Convierte a minúsculas

          // Forma el nombre del archivo dependiendo del campo enviado
          let uniqueFilename = `${sanitizedDoctorName}-firma${path.extname(file.originalname)}`;
          if (file.fieldname === 'firmaConAntefirma') {
            uniqueFilename = `${sanitizedDoctorName}-firma-con-antefirma${path.extname(file.originalname)}`;
          }

          callback(null, uniqueFilename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateMedicoFirmanteDto: UpdateMedicoFirmanteDto,
    @UploadedFile() files: Express.Multer.File[],
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }
    // Si se sube un archivo, se añade al DTO para actualizar el logotipo
    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file.fieldname === 'firma') {
          updateMedicoFirmanteDto.firma = {
            data: file.filename,
            contentType: file.mimetype,
          };
        } else if (file.fieldname === 'firmaConAntefirma') {
          updateMedicoFirmanteDto.firmaConAntefirma = {
            data: file.filename,
            contentType: file.mimetype,
          };
        }
      });
    }

    const medico = await this.medicosFirmantesService.update(
      id,
      updateMedicoFirmanteDto,
    );

    if (!medico) {
      return {
        message: `No se pudo actualziar el medico firmante con id ${id}`,
      };
    }

    return {
      message: 'Actualizado exitosamente',
      data: medico,
    };
  }

  @Delete('eliminar-medico/:id')
  async remove(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedMedicoFirmante = await this.medicosFirmantesService.remove(id);

    if (!deletedMedicoFirmante) {
      return {
        message: `El médico firmante con ID ${id} no existe o ya ha sido eliminada.`,
      };
    }

    return {
      message: 'Médico firmante eliminado exitosamente',
    };
  }
}
