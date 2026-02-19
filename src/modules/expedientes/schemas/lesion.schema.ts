import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from '../../trabajadores/schemas/trabajador.schema';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentoEstado } from '../enums/documento-estado.enum';

/**
 * GIIS-B013 Lesion/Injury Schema (Reporte de Lesión y/o Violencia)
 *
 * Represents injury and violence reporting per GIIS-B013 specification.
 * Only enabled for MX providers (proveedorSalud.pais === 'MX').
 * CLUES se obtiene de ProveedorSalud cuando se requiere (export, etc.).
 */
@Schema()
export class Lesion extends Document {
  @Prop({
    required: true,
    match: /^[0-9]{1,8}$/,
  })
  folio: string; // 1-8 caracteres numéricos, único por CLUES + fechaAtencion

  @Prop({ required: true })
  folioScopeId: string; // CLUES o idProveedorSalud (fallback cuando ProveedorSalud no tiene CLUES)

  @Prop({ required: false })
  rutaPDF?: string; // Ruta del directorio donde se guarda el PDF

  // ========== STEP 0: Fecha del reporte ==========
  @Prop({ required: true })
  fechaReporteLesion: Date; // Fecha en que se capturó/llenó el formulario del reporte

  // ========== STEP 1: ¿Cuándo ocurrió el evento? ==========
  @Prop({ required: true })
  fechaEvento: Date; // Fecha del evento/lesión

  @Prop()
  horaEvento?: string; // Hora del evento (HH:mm)

  @Prop({ required: false })
  diaFestivo?: number; // 1=SI, 2=NO - ¿El día se considera festivo?

  @Prop({ required: false })
  eventoRepetido?: number; // 1=Única vez, 2=Repetido

  // ========== STEP 2: ¿Dónde ocurrió? (Lugar) ==========
  @Prop({
    required: true,
    // Cat SITIO_OCURRENCIA_LESION
  })
  sitioOcurrencia: number; // Lugar donde ocurrió el evento

  @Prop({ required: false })
  entidadOcurrencia?: string; // Cat ENTIDAD_FEDERATIVA - 99=SE IGNORA

  @Prop({ required: false })
  municipioOcurrencia?: string; // Cat MUNICIPIO - 998=SE IGNORA, 999=NO ESPECIFICADO

  @Prop({ required: false })
  localidadOcurrencia?: string; // Cat LOCALIDAD - 9998=SE IGNORA, 9999=NO ESPECIFICADO

  @Prop({ required: false })
  otraLocalidad?: string; // Especificación cuando localidad no está en catálogo

  @Prop({ required: false })
  codigoPostal?: string; // 99999=SE IGNORA, 00000=NO ESPECIFICADO

  @Prop({ required: false })
  tipoVialidad?: number; // Cat TIPO_VIALIDAD

  @Prop({ required: false })
  nombreVialidad?: string;

  @Prop({ required: false })
  numeroExterior?: string;

  @Prop({ required: false })
  tipoAsentamiento?: number; // Cat TIPO_ASENTAMIENTO

  @Prop({ required: false })
  nombreAsentamiento?: string;

  // ========== STEP 3: ¿Cómo ocurrió? (Circunstancias / Intencionalidad) ==========
  @Prop({
    required: true,
    enum: [1, 2, 3, 4], // 1=Accidental, 2=Violencia Familiar, 3=Violencia No Familiar, 4=Autoinfligido
  })
  intencionalidad: number;

  @Prop({ required: false })
  agenteLesion?: number; // Cat AGENTE_LESION - obligatorio si 1,4 o violencia física/sexual

  @Prop({ required: false })
  especifique?: string; // Especificar agente si agenteLesion=25 (OTRA)

  @Prop({ type: [Number], required: false })
  tipoViolencia?: number[]; // Obligatorio si intencionalidad 2 o 3 - multivalor

  @Prop({ required: false })
  numeroAgresores?: number; // Violencia: 1=Único, 2=Más de uno, 3=No especificado

  @Prop({ required: false })
  parentescoAfectado?: number; // Cat PARENTESCO con agresor

  @Prop({ required: false })
  sexoAgresor?: number; // Cat SEXO del agresor

  @Prop({ required: false })
  edadAgresor?: number; // Edad en años (0 si no aplica)

  @Prop({ required: false })
  agresorBajoEfectos?: string; // Multivalor "&": 1=Alcohol, 2=Droga médica, 3=Drogas ilegales, 4=SE IGNORA, 5=Ninguna

  @Prop({ required: false })
  lesionadoVehiculoMotor?: number; // Si agente=20: 1=Conductor, 2=Ocupante, 3=Peatón, 4=SE IGNORA

  @Prop({ required: false })
  usoEquipoSeguridad?: number; // Si conductor/ocupante: 1=SI, 2=NO, 9=SE IGNORA

  @Prop({ required: false })
  equipoUtilizado?: number; // 1=Cinturón, 2=Casco, 3=Silla infantil, 4=Otro

  @Prop({ required: false })
  especifiqueEquipo?: string; // Si equipoUtilizado=4

  @Prop({ required: false })
  sospechaBajoEfectosDe?: string; // Multivalor "&" - ¿Lesionado bajo efectos?

  @Prop({ required: false })
  atencionPreHospitalaria?: number; // 1=SI, 2=NO

  @Prop({ required: false })
  tiempoTrasladoUH?: string; // HH:mm - condicional a atencionPreHospitalaria=1

  // ========== STEP 4: Atención recibida ==========
  @Prop({ required: true })
  fechaAtencion: Date; // Fecha de registro clínico

  @Prop()
  horaAtencion?: string; // Hora de atención (HH:mm)

  @Prop({ required: false })
  servicioAtencion?: number; // 1=Consulta Externa, 2=Hospitalización, 3=Urgencias, 4=Servicio Violencia, 5=Otro

  @Prop({ required: false })
  especifiqueServicio?: string; // Si servicioAtencion=5

  @Prop({
    type: [Number],
    required: true,
    // Cat 1-9, máximo 5 valores
  })
  tipoAtencion: number[]; // Tipos de tratamiento otorgado (multivalor, max 5)

  // ========== STEP 5: Evaluación clínica / Diagnóstico ==========
  @Prop({
    required: true,
    // Cat AREA_ANATOMICA
  })
  areaAnatomica: number;

  @Prop({ required: false })
  especifiqueArea?: string; // Si areaAnatomica=16 (OTROS)

  @Prop({
    required: true,
    // Cat CONSECUENCIA_LESION
  })
  consecuenciaGravedad: number;

  @Prop({ required: false })
  especifiqueConsecuencia?: string; // Si consecuenciaGravedad=22 (OTRA)

  @Prop({
    required: true,
    // Acepta formato estándar (S09, S09.7) y 4 chars del catálogo DGIS (S097, S000)
    match: /^[A-Z][0-9]{2,3}(\.[0-9]{1,2})?$/,
  })
  codigoCIEAfeccionPrincipal: string; // Diagnóstico principal (Cap. V, XIX, obstétricos)

  @Prop({ required: false })
  descripcionAfeccionPrincipal?: string; // Descripción texto libre

  @Prop({
    required: true,
    match: /^V[0-9]{2}|^W[0-9]{2}|^X[0-9]{2}|^Y[0-9]{2}$/,
  })
  codigoCIECausaExterna: string; // CIE-10 Capítulo XX (V01-Y98)

  @Prop({ required: false })
  causaExterna?: string; // Descripción texto libre causa externa

  @Prop({ type: [String], required: false })
  afeccionesTratadas?: string[]; // Formato: Num#Desc#CIE

  @Prop({ required: false })
  descripcionAfeccion?: string;

  @Prop({ required: false })
  afeccionPrincipalReseleccionada?: string; // CIE reseleccionado si difiere

  // ========== STEP 6: Destino y seguimiento ==========
  @Prop({ required: false })
  despuesAtencion?: number; // 1=Domicilio, 2=Traslado, 3=Serv. Violencia, 4=Consulta Ext, 5=Defunción, 6=Refugio, 7=DIF, 8=Hosp, 9=MP, 10=Ayuda mutua, 11=Otro

  @Prop({ required: false })
  especifiqueDestino?: string; // Si despuesAtencion=11

  @Prop({ required: false })
  ministerioPublico?: number; // 1=SI, 2=NO - ¿Dio aviso al MP?

  @Prop({ required: false })
  folioCertificadoDefuncion?: string; // Si despuesAtencion=5 y ministerioPublico=2

  // ========== Referencias ==========
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Trabajador',
    required: true,
  })
  idTrabajador: Trabajador;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  idProveedorSalud: MongooseSchema.Types.ObjectId; // Para unicidad folio y obtener CLUES desde ProveedorSalud

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;

  // Consentimiento Diario (NOM-024) - Requerido cuando dailyConsentEnabled
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ConsentimientoDiario',
    required: false,
  })
  consentimientoDiarioId?: MongooseSchema.Types.ObjectId;

  // Document State Management (NOM-024)
  @Prop({
    type: String,
    enum: Object.values(DocumentoEstado),
    default: DocumentoEstado.BORRADOR,
    required: true,
  })
  estado: DocumentoEstado;

  @Prop({ type: Date, required: false })
  fechaFinalizacion?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  finalizadoPor?: User;

  @Prop({ required: false })
  fechaAnulacion?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  anuladoPor?: User;

  @Prop({ required: false })
  razonAnulacion?: string;
}

export const LesionSchema = SchemaFactory.createForClass(Lesion);

// Unicidad folio por CLUES (o idProveedorSalud) + fechaAtencion
LesionSchema.index(
  { folioScopeId: 1, fechaAtencion: 1, folio: 1 },
  { unique: true },
);

LesionSchema.index({ idTrabajador: 1 });
LesionSchema.index({ fechaAtencion: 1 });
LesionSchema.index({ fechaEvento: 1 });

LesionSchema.set('timestamps', true);
