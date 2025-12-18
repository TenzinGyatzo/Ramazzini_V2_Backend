import { PartialType } from '@nestjs/mapped-types';
import { CreateProveedoresSaludDto } from './create-proveedores-salud.dto';

export class UpdateProveedoresSaludDto extends PartialType(
  CreateProveedoresSaludDto,
) {
  static logotipoEmpresa: { data: string; contentType: string };
}
