import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';

const extensiones = [".pdf", ".jpeg", ".jpg", ".png"];

@Schema()
export class DocumentoExterno extends Document {

    @Prop({ required: true })
    nombreDocumento: string

    @Prop({ required: true })
    fechaDocumento: Date

    @Prop()
    notasDocumento: string

    @Prop({ required: true, enum: extensiones })
    extension: string
    
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trabajador', required: true })
    idTrabajador: Trabajador;

    @Prop({ required: true })
    rutaDocumento: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: User;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    updatedBy: User;
}

export const DocumentoExternoSchema = SchemaFactory.createForClass(DocumentoExterno).set('timestamps', true);