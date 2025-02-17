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
  NotFoundException,
} from '@nestjs/common';
import { ProveedoresSaludService } from './proveedores-salud.service';
import { CreateProveedoresSaludDto } from './dto/create-proveedores-salud.dto';
import { UpdateProveedoresSaludDto } from './dto/update-proveedores-salud.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { isAfter, addDays } from 'date-fns';

@Controller('proveedores-salud')
export class ProveedoresSaludController {
  constructor(
    private readonly proveedoresSaludService: ProveedoresSaludService,
  ) {}

  @Post('crear-proveedor-salud')
  @UseInterceptors(
    FileInterceptor('logotipoEmpresa', {
      storage: diskStorage({
        destination: path.resolve(
          __dirname,
          `../../../../${process.env.PROVIDERS_UPLOADS_DIR}`,
        ),
        filename: (req, file, callback) => {
          // Genera un nombre de archivo único basado en el nombre del proveedor.
          const sanitizedCompanyName = req.body.nombre
            .replace(/\s+/g, '-') // Reemplaza espacios por guiones
            .replace(/[^a-zA-Z0-9\-]/g, '') // Elimina caracteres especiales para evitar problemas en el nombre de archivo
            .toLowerCase(); // Convierte el nombre a minúsculas

          // Forma el nombre del archivo con el nombre y la extensión original del archivo
          const uniqueFilename = `${sanitizedCompanyName}-logo${path.extname(file.originalname)}`;

          callback(null, uniqueFilename);
        },
      }),
    }),
  )
  async create(
    @Body() createProveedoresSaludDto: CreateProveedoresSaludDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('Archivo recibido:', file);
    console.log('Datos del proveedor:', createProveedoresSaludDto);

    try {
      if (file) {
        createProveedoresSaludDto.logotipoEmpresa = {
          data: file.filename,
          contentType: file.mimetype,
        };
      }

      const proveedorSalud = await this.proveedoresSaludService.create(
        createProveedoresSaludDto,
      );
      return {
        message: 'Proveedor de salud creado exitosamente',
        data: proveedorSalud,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Ya existe una empresa con este RFC');
      }
      throw new BadRequestException('Error al crear la empresa');
    }
  }

  @Get('obtener-proveedores-salud')
  async findAll() {
    const proveedoresSalud = await this.proveedoresSaludService.findAll();

    if (!proveedoresSalud || proveedoresSalud.length === 0) {
      return { message: 'No se encontraron proveedores de salud' };
    }

    return proveedoresSalud;
  }

  @Get('obtener-proveedor-salud/:id')
  async findOne(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const proveedorSalud = await this.proveedoresSaludService.findOne(id);

    if (!proveedorSalud) {
      throw new NotFoundException('No se encontró el proveedor de salud');
    }

    return proveedorSalud;
  }

  @Post('actualizar-proveedor-salud/:id')
  @UseInterceptors(
    FileInterceptor('logotipoEmpresa', {
      storage: diskStorage({
        destination: path.resolve(
          __dirname,
          `../../../../${process.env.PROVIDERS_UPLOADS_DIR}`,
        ),
        filename: (req, file, callback) => {
          // Genera un nombre de archivo único basado en el nombre comercial de la empresa.
          const sanitizedCompanyName = req.body.nombre
            .replace(/\s+/g, '-') // Reemplaza espacios por guiones
            .replace(/[^a-zA-Z0-9\-]/g, '') // Elimina caracteres especiales para evitar problemas en el nombre de archivo
            .toLowerCase(); // Convierte el nombre a minúsculas

          // Forma el nombre del archivo con el nombre comercial y la extensión original del archivo
          const uniqueFilename = `${sanitizedCompanyName}-logo${path.extname(file.originalname)}`;
          callback(null, uniqueFilename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProveedoresSaludDto: UpdateProveedoresSaludDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }
    // Si se sube un archivo, se añade al DTO para actualizar el logotipo
    if (file) {
      updateProveedoresSaludDto.logotipoEmpresa = {
        data: file.filename,
        contentType: file.mimetype,
      };
    }

    const proveedorSalud = await this.proveedoresSaludService.update(
      id,
      updateProveedoresSaludDto,
    );

    if (!proveedorSalud) {
      return {
        message: `No se pudo actualizar el proveedor de salud con id ${id}`,
      };
    }

    return {
      message: 'Actualizado exitosamente',
      data: proveedorSalud,
    };
  }

  @Delete('eliminar-proveedor-salud/:id')
  async remove(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const deletedProveedorSalud = await this.proveedoresSaludService.remove(id);

    if (!deletedProveedorSalud) {
      return {
        message: `El proveedor de salud con ID ${id} no existe o ya ha sido eliminado.`,
      };
    }

    return {
      message: 'Proveedor de salud eliminado exitosamente',
    };
  }

  @Get('verificar-periodo-prueba/:id')
  async verificarPeriodoDePrueba(@Param('id') id: string) {
    console.log('controller')
    if (!isValidObjectId(id)) {
      throw new BadRequestException('El ID proporcionado no es válido');
    }

    const proveedorSalud = await this.proveedoresSaludService.findOne(id);

    if (!proveedorSalud) {
      throw new NotFoundException('No se encontró el proveedor de salud');
    }

    const fechaLimite = addDays(new Date(proveedorSalud.fechaInicioTrial), 15); // Día siguiente a la fecha de inicio

    // Verificar si la fecha actual es posterior a la fecha límite
    if (isAfter(new Date(), fechaLimite)) {
      console.log('El periodo de prueba ha finalizado');
      // Si el periodo ha finalizado y no está marcado, actualizarlo
      if (!proveedorSalud.periodoDePruebaFinalizado) {
        const updatedProveedorSalud = await this.proveedoresSaludService.update(
          id,
          { 
            periodoDePruebaFinalizado: true,
            fechaInicioTrial: proveedorSalud.fechaInicioTrial
          },
        );

        if (!updatedProveedorSalud) {
          return {
            message: 'No se pudo actualizar el proveedor de salud',
          };
        }

        return {
          message: 'El proveedor de salud ha finalizado su periodo de prueba',
          data: updatedProveedorSalud,
        };
      }
    } else {
      console.log('El periodo de prueba sigue activo');
    }

    return {
      message: 'El proveedor de salud no se encuentra en periodo de prueba',
      data: proveedorSalud,
    };
  }
}
