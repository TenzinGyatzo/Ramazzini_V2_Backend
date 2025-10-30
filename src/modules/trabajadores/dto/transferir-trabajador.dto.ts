import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class TransferirTrabajadorDto {
  @ApiProperty({
    description: 'El ID del centro de trabajo destino',
    example: '60d9f70fc39b3c1b8f0d6c0a'
  })
  @IsMongoId({ message: 'El ID de centro de trabajo debe ser un ObjectId válido' })
  @IsNotEmpty({ message: 'El ID de centro de trabajo no puede estar vacío' })
  nuevoCentroId: string;
} 