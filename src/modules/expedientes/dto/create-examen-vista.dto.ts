import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

const siONo = ["Si", "No"];

const agudezaVisualInterpretaciones = [
  "Visión excepcional",
  "Visión Normal",
  "Visión ligeramente reducida",
  "Visión moderadamente reducida",
  "Visión significativamente reducida",
  "Visión muy reducida",
];

const ishiharaInterpretaciones = ["Normal", "Daltonismo"];

export class CreateExamenVistaDto {

    @ApiProperty({
        description: 'Fecha del examen de la vista',
        example: '2024-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha del examen debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha del examen no puede estar vacía' })
    fechaExamenVista: Date;

    // Agudeza Visual

    // Sin corrección vista lejana
    @ApiProperty({
        description: 'Agudeza visual lejana de ojo izquierdo sin corrección',
        example: 20
    })
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(10)
    @Max(200)
    @IsNotEmpty({ message: 'La agudeza visual lejana de ojo izquierdo sin corrección no puede estar vacía' })
    ojoIzquierdoLejanaSinCorreccion: number

    @ApiProperty({
        description: 'Agudeza visual lejana de ojo derecho sin corrección',
        example: 20
    })
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(10)
    @Max(200)
    @IsNotEmpty({ message: 'La agudeza visual lejana de ojo derecho sin corrección no puede estar vacía' })
    ojoDerechoLejanaSinCorreccion: number

    @ApiProperty({
        description: 'Interpretación de la agudeza visual lejana sin corrección',
        enum: agudezaVisualInterpretaciones,
        example: 'Visión ligeramente reducida'
    })
    @IsString({ message: 'La interpretación de la agudeza visual lejana sin corrección debe ser un string' })
    @IsNotEmpty({ message: 'La interpretación de la agudeza visual lejana sin corrección no puede estar vacía' })
    @IsEnum(agudezaVisualInterpretaciones, { message: 'La interpretación de la agudeza visual lejana sin corrección debe ser uno de los siguientes: ' + agudezaVisualInterpretaciones })
    sinCorreccionLejanaInterpretacion: string
    
    @ApiProperty({
        description: 'Indica si requiere lentes para la corrección',
        enum: siONo,
        example: 'Si'
    })
    @IsString({ message: 'El indicador de si requiere lentes para la corrección debe ser un string' })
    @IsNotEmpty({ message: 'El indicador de si requiere lentes para la corrección no puede estar vacía' })
    @IsEnum(siONo, { message: 'El indicador de si requiere lentes para la corrección debe ser uno de los siguientes: ' + siONo })
    requiereLentesUsoGeneral: string

    // Sin corrección vista cercana


    
    
    // RESTO
    @ApiProperty({
        description: 'El ID del trabajador',
        example: '671fe9cc00fcb5611b10686e',
    })
    @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
    idTrabajador: string;

    @ApiProperty({
        description: 'Ruta hacía el PDF del examen de la vista',
        example: "expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf"
    })
    @IsString({ message: 'La ruta del PDF del examen de la vista debe ser un string' })
    @IsNotEmpty({ message: 'La ruta del PDF del examen de la vista no puede estar vacía' })
    rutaPDF: string;

    @ApiProperty({
        description: 'El ID del usuario que creó este registro',
        example: '60d9f70fc39b3c1b8f0d6c0b',
    })
    @IsMongoId({ message: 'El ID de "createdBy" no es válido' })
    @IsNotEmpty({ message: 'El ID de "createdBy" no puede estar vacío' })
    createdBy: string;

    @ApiProperty({
        description: 'El ID del usuario que actualizó este registro',
        example: '60d9f70fc39b3c1b8f0d6c0c',
    })
    @IsMongoId({ message: 'El ID de "updatedBy" no es válido' })
    @IsNotEmpty({ message: 'El ID de "updatedBy" no puede estar vacío' })
    updatedBy: string;
}
