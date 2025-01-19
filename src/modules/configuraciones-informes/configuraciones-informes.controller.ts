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
import { ConfiguracionesInformesService } from './configuraciones-informes.service';
import { CreateConfiguracionesInformeDto } from './dto/create-configuraciones-informe.dto';
import { UpdateConfiguracionesInformeDto } from './dto/update-configuraciones-informe.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { isValidObjectId } from 'mongoose';

@Controller('configuraciones-informes')
export class ConfiguracionesInformesController {
  constructor(
    private readonly configuracionesInformesService: ConfiguracionesInformesService,
  ) {}

  @Post('crear-configuracion')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: path.resolve(
          __dirname,
          `../../../../${process.env.SIGNATORIES_UPLOADS_DIR}`,
        ),
        filename: (req, file, callback) => {
          // Genera un nombre de archivo único basado en el nombre del médico firmante
          const sanitizedDoctorName = req.body.nombreMedicoFirmante
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
    @Body() createConfiguracionesInformeDto: CreateConfiguracionesInformeDto,
    @UploadedFile() files: Express.Multer.File[],
  ) {
    console.log('Archivos recibidos:', files);
    console.log('Datos de la configuración:', createConfiguracionesInformeDto);

    try {
      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file.fieldname === 'firma') {
            createConfiguracionesInformeDto.firma = {
              data: file.filename,
              contentType: file.mimetype,
            };
          } else if (file.fieldname === 'firmaConAntefirma') {
            createConfiguracionesInformeDto.firmaConAntefirma = {
              data: file.filename,
              contentType: file.mimetype,
            };
          }
        });
      }

      const empresa = await this.configuracionesInformesService.create(
        createConfiguracionesInformeDto,
      );
      return { message: 'Configuración creada exitosamente', data: empresa };
    } catch (error) {
      throw new BadRequestException('Error al crear la configuración');
    }
  }

  @Get('obtener-configuraciones')
  async findAll() {
    const configuraciones = await this.configuracionesInformesService.findAll();

    if (!configuraciones || configuraciones.length === 0) {
      return { message: 'No se encontraron configuraciones' };
    }

    return configuraciones;
  }

  @Get('obtener-configuracion/:id')
  async findOne(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const configuracion = await this.configuracionesInformesService.findOne(id);

    if (!configuracion) {
      throw new NotFoundException('No se encontró la configuración');
    }

    return configuracion;
  }

  @Patch('actualizar-configuracion/:id')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: path.resolve(
          __dirname,
          `../../../../${process.env.SIGNATORIES_UPLOADS_DIR}`,
        ),
        filename: (req, file, callback) => {
          // Genera un nombre de archivo único basado en el nombre del médico firmante
          const sanitizedDoctorName = req.body.nombreMedicoFirmante
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
    @Body() updateConfiguracionesInformeDto: UpdateConfiguracionesInformeDto,
    @UploadedFile() files: Express.Multer.File[],
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }
    // Si se sube un archivo, se añade al DTO para actualizar el logotipo
    if (files && files.length > 0) {
      files.forEach((file) => {
        if (file.fieldname === 'firma') {
          updateConfiguracionesInformeDto.firma = {
            data: file.filename,
            contentType: file.mimetype,
          };
        } else if (file.fieldname === 'firmaConAntefirma') {
          updateConfiguracionesInformeDto.firmaConAntefirma = {
            data: file.filename,
            contentType: file.mimetype,
          };
        }
      });
    }

    const configuracion = await this.configuracionesInformesService.update(
      id,
      updateConfiguracionesInformeDto,
    );

    if (!configuracion) {
      return { message: `No se pudo actualziar la configuración con id ${id}` };
    }

    return {
      message: 'Configuración actualizada exitosamente',
      data: configuracion,
    };
  }

  @Delete('eliminar-configuracion/:id')
  async remove(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedConfiguracion =
      await this.configuracionesInformesService.remove(id);

    if (!deletedConfiguracion) {
      return {
        message: `La configuración con ID ${id} no existe o ya ha sido eliminada.`,
      };
    }

    return {
      message: 'Configuración eliminada exitosamente',
    };
  }
}
