// Servicios para gestionar la data que se almacena en la base de datos
import { Injectable, BadRequestException, Inject, forwardRef, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Antidoping } from './schemas/antidoping.schema';
import { AptitudPuesto } from './schemas/aptitud-puesto.schema';
import { Audiometria } from './schemas/audiometria.schema';
import { Certificado } from './schemas/certificado.schema';
import { CertificadoExpedito } from './schemas/certificado-expedito.schema';
import { DocumentoExterno } from './schemas/documento-externo.schema';
import { ExamenVista } from './schemas/examen-vista.schema';
import { ExploracionFisica } from './schemas/exploracion-fisica.schema';
import { HistoriaClinica } from './schemas/historia-clinica.schema';
import { NotaMedica } from './schemas/nota-medica.schema';
import { ControlPrenatal } from './schemas/control-prenatal.schema';
import { HistoriaOtologica } from './schemas/historia-otologica.schema';
import { PrevioEspirometria } from './schemas/previo-espirometria.schema';
import { ConstanciaAptitud } from './schemas/constancia-aptitud.schema';
import { Receta } from './schemas/receta.schema';
import { Lesion } from './schemas/lesion.schema';
import { startOfDay, endOfDay } from 'date-fns';
import { FilesService } from '../files/files.service';
import { convertirFechaISOaDDMMYYYY } from 'src/utils/dates';
import path from 'path';
import { parseISO } from 'date-fns';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';
import { DocumentoEstado } from './enums/documento-estado.enum';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';
import { Empresa } from '../empresas/schemas/empresa.schema';
import { CatalogsService } from '../catalogs/catalogs.service';


@Injectable()
export class ExpedientesService {
  private readonly models: Record<string, Model<any>>;
  private readonly dateFields: Record<string, string>;

  constructor(
    @InjectModel(Antidoping.name) private antidopingModel: Model<Antidoping>,
    @InjectModel(AptitudPuesto.name) private aptitudModel: Model<AptitudPuesto>,
    @InjectModel(Audiometria.name) private audiometriaModel: Model<Audiometria>,
    @InjectModel(Certificado.name) private certificadoModel: Model<Certificado>,
    @InjectModel(CertificadoExpedito.name) private certificadoExpeditoModel: Model<CertificadoExpedito>,
    @InjectModel(DocumentoExterno.name) private documentoExternoModel: Model<DocumentoExterno>,
    @InjectModel(ExamenVista.name) private examenVistaModel: Model<ExamenVista>,
    @InjectModel(ExploracionFisica.name) private exploracionFisicaModel: Model<ExploracionFisica>,
    @InjectModel(HistoriaClinica.name) private historiaClinicaModel: Model<HistoriaClinica>,
    @InjectModel(NotaMedica.name) private notaMedicaModel: Model<NotaMedica>,
    @InjectModel(ControlPrenatal.name) private controlPrenatalModel: Model<ControlPrenatal>,
    @InjectModel(Trabajador.name) private trabajadorModel: Model<Trabajador>,
    @InjectModel(HistoriaOtologica.name) private historiaOtologicaModel: Model<HistoriaOtologica>,
    @InjectModel(PrevioEspirometria.name) private previoEspirometriaModel: Model<PrevioEspirometria>,
    @InjectModel(Receta.name) private recetaModel: Model<Receta>,
    @InjectModel(ConstanciaAptitud.name) private constanciaAptitudModel: Model<ConstanciaAptitud>,
    @InjectModel(Lesion.name) private lesionModel: Model<Lesion>,
    @InjectModel(CentroTrabajo.name) private centroTrabajoModel: Model<CentroTrabajo>,
    @InjectModel(Empresa.name) private empresaModel: Model<Empresa>,
    private readonly filesService: FilesService,
    private readonly nom024Util: NOM024ComplianceUtil,
    private readonly catalogsService: CatalogsService
  ) {
    this.models = {
      antidoping: this.antidopingModel,
      aptitud: this.aptitudModel,
      audiometria: this.audiometriaModel,
      certificado: this.certificadoModel,
      certificadoExpedito: this.certificadoExpeditoModel,
      documentoExterno: this.documentoExternoModel,
      examenVista: this.examenVistaModel,
      exploracionFisica: this.exploracionFisicaModel,
      historiaClinica: this.historiaClinicaModel,
      notaMedica: this.notaMedicaModel,
      controlPrenatal: this.controlPrenatalModel,
      historiaOtologica: this.historiaOtologicaModel,
      previoEspirometria: this.previoEspirometriaModel,
      receta: this.recetaModel,
      constanciaAptitud: this.constanciaAptitudModel,
    };

    this.dateFields = {
      antidoping: 'fechaAntidoping',
      aptitud: 'fechaAptitudPuesto',
      audiometria: 'fechaAudiometria',
      certificado: 'fechaCertificado',
      certificadoExpedito: 'fechaCertificadoExpedito',
      documentoExterno: 'fechaDocumento',
      examenVista: 'fechaExamenVista',
      exploracionFisica: 'fechaExploracionFisica',
      historiaClinica: 'fechaHistoriaClinica',
      notaMedica: 'fechaNotaMedica',
      controlPrenatal: 'fechaInicioControlPrenatal',
      historiaOtologica: 'fechaHistoriaOtologica',
      previoEspirometria: 'fechaPrevioEspirometria',
      receta: 'fechaReceta',
      constanciaAptitud: 'fechaConstanciaAptitud',
    };
  }

  /**
   * Validate CIE-10 codes for documents with diagnosis fields (MX providers only)
   */
  private async validateCIE10ForDocument(
    documentType: string,
    dto: any,
    trabajadorId: string
  ): Promise<void> {
    // Only validate for NotaMedica and HistoriaClinica
    if (documentType !== 'notaMedica' && documentType !== 'historiaClinica') {
      return;
    }

    const proveedorSaludId = await this.getProveedorSaludIdFromTrabajador(trabajadorId);
    if (!proveedorSaludId) {
      // If we can't determine provider, allow (backward compatibility)
      return;
    }

    const requiresCompliance = await this.nom024Util.requiresNOM024Compliance(proveedorSaludId);
    if (!requiresCompliance) {
      // Non-MX provider: CIE-10 is optional
      return;
    }

    // MX provider: validate CIE-10 codes
    const errors: string[] = [];

    // Validate primary CIE-10 code
    if (!dto.codigoCIE10Principal || dto.codigoCIE10Principal.trim() === '') {
      errors.push('Código CIE-10 principal es obligatorio para proveedores en México (NOM-024)');
    } else {
      const codigoPrincipal = dto.codigoCIE10Principal.trim().toUpperCase();
      const isValid = await this.catalogsService.validateCIE10(codigoPrincipal);
      if (!isValid) {
        errors.push(`Código CIE-10 principal inválido: ${codigoPrincipal}. No se encuentra en el catálogo CIE-10`);
      }
    }

    // Validate secondary CIE-10 codes if provided
    if (dto.codigosCIE10Secundarios && Array.isArray(dto.codigosCIE10Secundarios)) {
      for (const codigo of dto.codigosCIE10Secundarios) {
        if (codigo && codigo.trim() !== '') {
          const codigoSecundario = codigo.trim().toUpperCase();
          const isValid = await this.catalogsService.validateCIE10(codigoSecundario);
          if (!isValid) {
            errors.push(`Código CIE-10 secundario inválido: ${codigoSecundario}. No se encuentra en el catálogo CIE-10`);
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }
  }

  async createDocument(documentType: string, createDto: any): Promise<any> {
    const model = this.models[documentType];
  
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }

    // Validate CIE-10 codes for MX providers
    if (createDto.idTrabajador) {
      await this.validateCIE10ForDocument(documentType, createDto, createDto.idTrabajador);
    }
  
    const createdDocument = new model(createDto);
    const savedDocument = await createdDocument.save();

    // ✅ Actualizar el updatedAt del trabajador
    if (createDto.idTrabajador) {
      await this.actualizarUpdatedAtTrabajador(createDto.idTrabajador);
    }
  
    return savedDocument;
  } 

  /**
   * Get ProveedorSalud ID from a trabajador ID
   */
  private async getProveedorSaludIdFromTrabajador(trabajadorId: string): Promise<string | null> {
    try {
      const trabajador = await this.trabajadorModel.findById(trabajadorId).lean();
      if (!trabajador || !trabajador.idCentroTrabajo) {
        return null;
      }

      const centroTrabajo = await this.centroTrabajoModel.findById(trabajador.idCentroTrabajo).lean();
      if (!centroTrabajo || !centroTrabajo.idEmpresa) {
        return null;
      }

      const empresa = await this.empresaModel.findById(centroTrabajo.idEmpresa).lean();
      if (!empresa || !empresa.idProveedorSalud) {
        return null;
      }

      return empresa.idProveedorSalud.toString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get ProveedorSalud ID from a document's trabajador
   */
  private async getProveedorSaludIdFromDocument(document: any): Promise<string | null> {
    try {
      const trabajadorId = document.idTrabajador?.toString();
      if (!trabajadorId) {
        return null;
      }

      const trabajador = await this.trabajadorModel.findById(trabajadorId).lean();
      if (!trabajador || !trabajador.idCentroTrabajo) {
        return null;
      }

      const centroTrabajo = await this.centroTrabajoModel.findById(trabajador.idCentroTrabajo).lean();
      if (!centroTrabajo || !centroTrabajo.idEmpresa) {
        return null;
      }

      const empresa = await this.empresaModel.findById(centroTrabajo.idEmpresa).lean();
      if (!empresa || !empresa.idProveedorSalud) {
        return null;
      }

      return empresa.idProveedorSalud.toString();
    } catch (error) {
      return null;
    }
  }

  async updateOrCreateDocument(documentType: string, id: string, updateDto: any): Promise<any> {
    const model = this.models[documentType];
    const dateField = this.dateFields[documentType];
  
    if (!model || !dateField) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
  
    const newFecha = parseISO(updateDto[dateField]); // Convertimos a Date
    const trabajadorId = updateDto.idTrabajador;
  
    if (!newFecha) {
      throw new BadRequestException(`El campo ${dateField} es requerido para este documento`);
    }
  
    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }
  
    const existingDocument = await model.findById(id).exec();
  
    if (!existingDocument) {
      throw new BadRequestException(`Documento con ID ${id} no encontrado`);
    }

    // Check immutability for MX providers (NOM-024)
    if (existingDocument.estado === DocumentoEstado.FINALIZADO) {
      const proveedorSaludId = await this.getProveedorSaludIdFromDocument(existingDocument);
      if (proveedorSaludId) {
        const requiresCompliance = await this.nom024Util.requiresNOM024Compliance(proveedorSaludId);
        if (requiresCompliance) {
          throw new ForbiddenException(
            'No se puede actualizar un documento finalizado. Los documentos finalizados son inmutables para proveedores en México según NOM-024.'
          );
        }
      }
    }
  
    const oldFecha = new Date(existingDocument[dateField]);
  
    let result;
    if (newFecha.toISOString() !== oldFecha.toISOString()) {
      const newDocumentData = { ...updateDto };
      delete newDocumentData._id;
  
      const newDocument = new model(newDocumentData);
      result = await newDocument.save();
    } else {
      // Limpieza especial para antidoping
      if (documentType === 'antidoping') {
        const allDrugs = [
          'marihuana', 'cocaina', 'anfetaminas', 'metanfetaminas',
          'opiaceos', 'benzodiacepinas', 'fenciclidina', 'metadona',
          'barbituricos', 'antidepresivosTriciclicos',
        ];
  
        const unsetFields = Object.fromEntries(
          allDrugs.filter((campo) => !(campo in updateDto)).map((campo) => [campo, ""])
        );
  
        if (Object.keys(unsetFields).length > 0) {
          await model.updateOne({ _id: id }, { $unset: unsetFields });
        }
      }
  
      result = await model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    }
  
    // ✅ Actualizar el updatedAt del trabajador
    await this.actualizarUpdatedAtTrabajador(trabajadorId);
  
    return result;
  }

  /**
   * Finalize a document (set estado to FINALIZADO)
   * Only allowed for documents in BORRADOR state
   * For MX providers, finalized documents become immutable
   */
  async finalizarDocumento(documentType: string, id: string, userId: string): Promise<any> {
    const model = this.models[documentType];

    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }

    const document = await model.findById(id).exec();

    if (!document) {
      throw new BadRequestException(`Documento con ID ${id} no encontrado`);
    }

    // Check current state
    if (document.estado === DocumentoEstado.FINALIZADO) {
      throw new BadRequestException('El documento ya está finalizado');
    }

    if (document.estado === DocumentoEstado.ANULADO) {
      throw new BadRequestException('No se puede finalizar un documento anulado');
    }

    // Update document state
    document.estado = DocumentoEstado.FINALIZADO;
    document.fechaFinalizacion = new Date();
    document.finalizadoPor = userId;

    const savedDocument = await document.save();

    // Update trabajador's updatedAt
    if (document.idTrabajador) {
      await this.actualizarUpdatedAtTrabajador(document.idTrabajador.toString());
    }

    return savedDocument;
  }

  /**
   * GIIS-B013: Validate Lesion-specific business rules
   * 
   * Note: Official DGIS catalogs for SITIO_OCURRENCIA, AGENTE_LESION, AREA_ANATOMICA, 
   * and CONSECUENCIA are not publicly available. We validate only:
   * - Integer type
   * - Basic bounds (>= 0 or >= 1)
   * - Requiredness based on intencionalidad
   * - Format validation (no strict catalog enumeration)
   */
  private async validateLesionRules(lesionDto: any, trabajadorId: string): Promise<void> {
    const errors: string[] = [];

    // 1. Check MX provider requirement
    const proveedorSaludId = await this.getProveedorSaludIdFromTrabajador(trabajadorId);
    if (!proveedorSaludId) {
      errors.push('No se pudo determinar el proveedor de salud del trabajador');
    } else {
      const requiresCompliance = await this.nom024Util.requiresNOM024Compliance(proveedorSaludId);
      if (!requiresCompliance) {
        errors.push('Los registros de lesiones (GIIS-B013) solo están disponibles para proveedores en México');
      }
    }

    // 2. Validate temporal sequence: fechaNacimiento <= fechaEvento <= fechaAtencion <= fechaActual
    const fechaNacimiento = new Date(lesionDto.fechaNacimiento);
    const fechaEvento = new Date(lesionDto.fechaEvento);
    const fechaAtencion = new Date(lesionDto.fechaAtencion);
    const fechaActual = new Date();

    if (fechaEvento < fechaNacimiento) {
      errors.push('La fecha del evento no puede ser anterior a la fecha de nacimiento');
    }

    if (fechaAtencion < fechaEvento) {
      errors.push('La fecha de atención no puede ser anterior a la fecha del evento');
    }

    if (fechaAtencion > fechaActual) {
      errors.push('La fecha de atención no puede ser futura');
    }

    // If same day, validate hour sequence
    if (
      lesionDto.horaEvento &&
      lesionDto.horaAtencion &&
      fechaEvento.toDateString() === fechaAtencion.toDateString()
    ) {
      const horaEvento = lesionDto.horaEvento.split(':').map(Number);
      const horaAtencion = lesionDto.horaAtencion.split(':').map(Number);
      const minutosEvento = horaEvento[0] * 60 + horaEvento[1];
      const minutosAtencion = horaAtencion[0] * 60 + horaAtencion[1];

      if (minutosAtencion <= minutosEvento) {
        errors.push('La hora de atención debe ser posterior a la hora del evento cuando ocurren el mismo día');
      }
    }

    // 3. Validate age (should be < 100 years)
    const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    if (edad >= 100) {
      errors.push('La edad calculada debe ser menor a 100 años');
    }

    // 4. Basic numeric validation for catalog fields (without strict catalog enumeration)
    // Official DGIS catalogs not publicly available - validate only type and basic bounds
    if (lesionDto.sitioOcurrencia !== undefined) {
      if (!Number.isInteger(lesionDto.sitioOcurrencia) || lesionDto.sitioOcurrencia < 1) {
        errors.push('Sitio de ocurrencia debe ser un número entero mayor o igual a 1');
      }
    }

    if (lesionDto.areaAnatomica !== undefined) {
      if (!Number.isInteger(lesionDto.areaAnatomica) || lesionDto.areaAnatomica < 1) {
        errors.push('Área anatómica debe ser un número entero mayor o igual a 1');
      }
    }

    if (lesionDto.consecuenciaGravedad !== undefined) {
      if (!Number.isInteger(lesionDto.consecuenciaGravedad) || lesionDto.consecuenciaGravedad < 1) {
        errors.push('Consecuencia/gravedad debe ser un número entero mayor o igual a 1');
      }
    }

    // 5. Conditional validation based on intencionalidad
    if (lesionDto.intencionalidad === 1 || lesionDto.intencionalidad === 4) {
      // Accidental (1) or Self-inflicted (4): agenteLesion is required
      if (!lesionDto.agenteLesion) {
        errors.push('Agente de lesión es obligatorio para eventos accidentales o autoinfligidos');
      } else if (!Number.isInteger(lesionDto.agenteLesion) || lesionDto.agenteLesion < 1) {
        errors.push('Agente de lesión debe ser un número entero mayor o igual a 1');
      }
    }

    if (lesionDto.intencionalidad === 2 || lesionDto.intencionalidad === 3) {
      // Violence (2 or 3): tipoViolencia is required
      if (!lesionDto.tipoViolencia || lesionDto.tipoViolencia.length === 0) {
        errors.push('Tipo de violencia es obligatorio para eventos de violencia');
      } else {
        // Validate array elements are integers >= 1
        const invalidTipos = lesionDto.tipoViolencia.filter(
          (tipo: any) => !Number.isInteger(tipo) || tipo < 1
        );
        if (invalidTipos.length > 0) {
          errors.push('Cada tipo de violencia debe ser un número entero mayor o igual a 1');
        }
      }
    }

    // Validate tipoAtencion array elements
    if (lesionDto.tipoAtencion && lesionDto.tipoAtencion.length > 0) {
      const invalidTipos = lesionDto.tipoAtencion.filter(
        (tipo: any) => !Number.isInteger(tipo) || tipo < 1
      );
      if (invalidTipos.length > 0) {
        errors.push('Cada tipo de atención debe ser un número entero mayor o igual a 1');
      }
    }

    // 6. Validate CIE-10 codes (these catalogs ARE available)
    if (lesionDto.codigoCIEAfeccionPrincipal) {
      const isValidPrincipal = await this.catalogsService.validateCIE10(lesionDto.codigoCIEAfeccionPrincipal);
      if (!isValidPrincipal) {
        errors.push(`Código CIE-10 afección principal inválido: ${lesionDto.codigoCIEAfeccionPrincipal}`);
      }
    }

    if (lesionDto.codigoCIECausaExterna) {
      // Validate that it's a Chapter XX code (V01-Y98)
      if (!/^V[0-9]{2}|^W[0-9]{2}|^X[0-9]{2}|^Y[0-9]{2}$/.test(lesionDto.codigoCIECausaExterna)) {
        errors.push('Código CIE-10 causa externa debe ser del Capítulo XX (V01-Y98)');
      } else {
        const isValidExterna = await this.catalogsService.validateCIE10(lesionDto.codigoCIECausaExterna);
        if (!isValidExterna) {
          errors.push(`Código CIE-10 causa externa inválido: ${lesionDto.codigoCIECausaExterna}`);
        }
      }
    }

    // 7. Validate curpResponsable != curpPaciente
    if (lesionDto.curpPaciente === lesionDto.curpResponsable) {
      errors.push('El CURP del responsable debe ser diferente al CURP del paciente');
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }
  }

  /**
   * GIIS-B013: Create Lesion record
   */
  async createLesion(createDto: any): Promise<any> {
    await this.validateLesionRules(createDto, createDto.idTrabajador);

    // Check folio uniqueness per CLUES + fechaAtencion
    const fechaAtencion = new Date(createDto.fechaAtencion);
    const fechaAtencionOnly = new Date(fechaAtencion.getFullYear(), fechaAtencion.getMonth(), fechaAtencion.getDate());

    const existingLesion = await this.lesionModel.findOne({
      clues: createDto.clues,
      fechaAtencion: {
        $gte: fechaAtencionOnly,
        $lt: new Date(fechaAtencionOnly.getTime() + 24 * 60 * 60 * 1000),
      },
      folio: createDto.folio,
    }).exec();

    if (existingLesion) {
      throw new BadRequestException(
        `Ya existe un registro de lesión con el folio ${createDto.folio} para el CLUES ${createDto.clues} en la fecha ${fechaAtencionOnly.toISOString().split('T')[0]}`
      );
    }

    const createdLesion = new this.lesionModel(createDto);
    const savedLesion = await createdLesion.save();

    if (createDto.idTrabajador) {
      await this.actualizarUpdatedAtTrabajador(createDto.idTrabajador);
    }

    return savedLesion;
  }

  /**
   * GIIS-B013: Update Lesion record
   */
  async updateLesion(id: string, updateDto: any): Promise<any> {
    const existingLesion = await this.lesionModel.findById(id).exec();

    if (!existingLesion) {
      throw new BadRequestException(`Lesión con ID ${id} no encontrada`);
    }

    // Check immutability for MX providers
    if (existingLesion.estado === DocumentoEstado.FINALIZADO) {
      const proveedorSaludId = await this.getProveedorSaludIdFromDocument(existingLesion);
      if (proveedorSaludId) {
        const requiresCompliance = await this.nom024Util.requiresNOM024Compliance(proveedorSaludId);
        if (requiresCompliance) {
          throw new ForbiddenException(
            'No se puede actualizar una lesión finalizada. Los registros finalizados son inmutables para proveedores en México según NOM-024.'
          );
        }
      }
    }

    const mergedDto = {
      ...existingLesion.toObject(),
      ...updateDto,
    };

    await this.validateLesionRules(mergedDto, mergedDto.idTrabajador.toString());

    // Check folio uniqueness if changed
    if (updateDto.folio || updateDto.clues || updateDto.fechaAtencion) {
      const finalClues = updateDto.clues || existingLesion.clues;
      const finalFechaAtencion = updateDto.fechaAtencion
        ? new Date(updateDto.fechaAtencion)
        : existingLesion.fechaAtencion;
      const finalFolio = updateDto.folio || existingLesion.folio;

      const fechaAtencionOnly = new Date(
        finalFechaAtencion.getFullYear(),
        finalFechaAtencion.getMonth(),
        finalFechaAtencion.getDate()
      );

      const existingLesionWithFolio = await this.lesionModel.findOne({
        _id: { $ne: id },
        clues: finalClues,
        fechaAtencion: {
          $gte: fechaAtencionOnly,
          $lt: new Date(fechaAtencionOnly.getTime() + 24 * 60 * 60 * 1000),
        },
        folio: finalFolio,
      }).exec();

      if (existingLesionWithFolio) {
        throw new BadRequestException(
          `Ya existe otro registro de lesión con el folio ${finalFolio} para el CLUES ${finalClues} en la fecha ${fechaAtencionOnly.toISOString().split('T')[0]}`
        );
      }
    }

    const updatedLesion = await this.lesionModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();

    if (updateDto.idTrabajador || existingLesion.idTrabajador) {
      await this.actualizarUpdatedAtTrabajador(
        (updateDto.idTrabajador || existingLesion.idTrabajador).toString()
      );
    }

    return updatedLesion;
  }

  /**
   * GIIS-B013: Find Lesion by ID
   */
  async findLesion(id: string): Promise<any> {
    return this.lesionModel.findById(id).exec();
  }

  /**
   * GIIS-B013: Find all Lesions for a trabajador
   */
  async findLesionesByTrabajador(trabajadorId: string): Promise<any[]> {
    return this.lesionModel.find({ idTrabajador: trabajadorId }).sort({ fechaAtencion: -1 }).exec();
  }

  /**
   * GIIS-B013: Delete Lesion
   */
  async deleteLesion(id: string): Promise<boolean> {
    const lesion = await this.lesionModel.findById(id).exec();
    if (!lesion) {
      throw new BadRequestException(`Lesión con ID ${id} no encontrada`);
    }

    await this.lesionModel.findByIdAndDelete(id).exec();
    return true;
  }

  /**
   * GIIS-B013: Finalize Lesion
   */
  async finalizarLesion(id: string, userId: string): Promise<any> {
    const lesion = await this.lesionModel.findById(id).exec();

    if (!lesion) {
      throw new BadRequestException(`Lesión con ID ${id} no encontrada`);
    }

    if (lesion.estado === DocumentoEstado.FINALIZADO) {
      throw new BadRequestException('La lesión ya está finalizada');
    }

    if (lesion.estado === DocumentoEstado.ANULADO) {
      throw new BadRequestException('No se puede finalizar una lesión anulada');
    }

    lesion.estado = DocumentoEstado.FINALIZADO;
    lesion.fechaFinalizacion = new Date();
    lesion.finalizadoPor = userId as any; // User ObjectId reference

    const savedLesion = await lesion.save();

    if (lesion.idTrabajador) {
      await this.actualizarUpdatedAtTrabajador(lesion.idTrabajador.toString());
    }

    return savedLesion;
  }

  async uploadDocument(createDto: any): Promise<any> {
    const model = this.models['documentoExterno'];
  
    const fechaDocumento = createDto.fechaDocumento;
    const nombreDocumento = createDto.nombreDocumento;
    const trabajadorId = createDto.idTrabajador;
  
    if (!fechaDocumento) {
      throw new BadRequestException(`El campo fechaDocumento es requerido para este documento`);
    }
  
    if (!nombreDocumento) {
      throw new BadRequestException('El campo nombreDocumento es requerido');
    }
  
    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }
  
    // ✅ SIEMPRE crear una nueva entidad para evitar archivos huérfanos
    // Esto permite que cada archivo tenga su propio registro y se pueda gestionar individualmente
    const createdDocument = new model(createDto);
    const result = await createdDocument.save();
  
    // ✅ Actualizar el updatedAt del trabajador
    await this.actualizarUpdatedAtTrabajador(trabajadorId);
  
    return result;
  }

  async findDocuments(documentType: string, trabajadorId: string): Promise<any[]> {
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
    return model.find({ idTrabajador: trabajadorId }).exec();
  }

  async findDocument(documentType: string, id: string): Promise<any> {
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
    return model.findById(id).exec();
  }
  
  async upsertDocumentoExterno(id: string | null, updateDto: any): Promise<any> {
    const model = this.models.documentoExterno;
    const dateField = 'fechaDocumento';
  
    if (!model) {
      throw new BadRequestException('El modelo documentoExterno no está definido');
    }
  
    const newFecha = updateDto[dateField];
    const trabajadorId = updateDto.idTrabajador;
    const newNombreDocumento = updateDto.nombreDocumento;
  
    if (!newFecha) {
      throw new BadRequestException(`El campo ${dateField} es requerido para este documento`);
    }
  
    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }

    let result;
  
    const existingDocument = id ? await model.findById(id).exec() : null;
  
    if (existingDocument) {
      const oldFecha = existingDocument[dateField];
      const oldNombreDocumento = existingDocument.nombreDocumento;
      const oldExtension = existingDocument.extension;
      const rutaDocumento = existingDocument.rutaDocumento;
  
      // Detectar cambios en fecha o nombre del documento
      if (newFecha !== oldFecha || newNombreDocumento !== oldNombreDocumento) {
        try {
          // Construir el nombre del archivo anterior
          const formattedOldFecha = convertirFechaISOaDDMMYYYY(oldFecha).replace(/\//g, '-');
          const oldFileName = `${oldNombreDocumento} ${formattedOldFecha}${oldExtension}`;
          const oldFilePath = path.join(rutaDocumento, oldFileName);
  
          // Construir el nuevo nombre del archivo
          const formattedNewFecha = convertirFechaISOaDDMMYYYY(newFecha).replace(/\//g, '-');
          const newFileName = `${newNombreDocumento} ${formattedNewFecha}${oldExtension}`;
          const newFilePath = path.join(rutaDocumento, newFileName);
  
          // console.log(`[DEBUG] Renombrando archivo: ${oldFilePath} -> ${newFilePath}`);
  
          // Renombrar el archivo
          await this.filesService.renameFile(oldFilePath, newFilePath);
  
          // Actualizar los campos en el DTO
          updateDto.nombreDocumento = newNombreDocumento;
          updateDto.fechaDocumento = newFecha;
        } catch (error) {
          console.error(`[ERROR] Error al renombrar el archivo: ${error.message}`);
        }
      }
  
      // Actualizar el documento existente
      result = await model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    } else {
      const newDocument = new model(updateDto);
      result = await newDocument.save();
    }
  
    // ✅ Actualizar el updatedAt del trabajador
    await this.actualizarUpdatedAtTrabajador(trabajadorId);

    return result;
  }  

  async removeDocument(documentType: string, id: string): Promise<boolean> {
    // console.log(`[DEBUG] Inicio de removeDocument - documentType: ${documentType}, id: ${id}`);
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }

    const document = await model.findById(id).exec();
    if (!document) {
      throw new BadRequestException(`Documento con ID ${id} no encontrado`);
    }

    try {
      let fullPath = '';
      if(documentType === 'documentoExterno') {
        fullPath = document.rutaDocumento;
        if (!fullPath.includes('.pdf') || !fullPath.includes('.png') || !fullPath.includes('.jpg') || !fullPath.includes('.jpeg')) {
          const fechaField = this.dateFields[documentType];
          const fecha = convertirFechaISOaDDMMYYYY(document[fechaField]).replace(/\//g, '-');
          const fileName = `${document.nombreDocumento} ${fecha}${document.extension}`
          fullPath = path.join(document.rutaDocumento, fileName);
        }  
      } else {
        fullPath = document.rutaPDF;
        if (!fullPath.includes('.pdf')) {
          const fechaField = this.dateFields[documentType];
          const fecha = convertirFechaISOaDDMMYYYY(document[fechaField]).replace(/\//g, '-');
          const fileName = formatDocumentName(documentType, fecha); 
          fullPath = path.join(document.rutaPDF, fileName);
        }
      }

      // console.log(`[DEBUG] Intentando eliminar archivo PDF: ${fullPath}`);
      await this.filesService.deleteFile(fullPath); // Usar FilesService
    } catch (error) {
      // console.error(`[ERROR] Error al eliminar el archivo PDF: ${error.message}`);
    }

    const result = await model.findByIdAndDelete(id).exec();
    return result !== null;
  } 
  
  async getAlturaDisponible(trabajadorId: string): Promise<{ altura: number | null, fuente: string | null }> {
    try {
      // 1. Buscar en exploración física (más reciente)
      const exploracionFisica = await this.exploracionFisicaModel
        .findOne({ idTrabajador: trabajadorId })
        .sort({ fechaExploracionFisica: -1 })
        .select('altura')
        .exec();

      if (exploracionFisica?.altura) {
        return { altura: exploracionFisica.altura, fuente: 'exploracionFisica' };
      }

      // 2. Buscar en control prenatal (más reciente)
      const controlPrenatal = await this.controlPrenatalModel
        .findOne({ idTrabajador: trabajadorId })
        .sort({ fechaInicioControlPrenatal: -1 })
        .select('altura')
        .exec();

      if (controlPrenatal?.altura) {
        return { altura: controlPrenatal.altura, fuente: 'controlPrenatal' };
      }

      return { altura: null, fuente: null };
    } catch (error) {
      console.error('Error al consultar altura disponible:', error);
      throw new BadRequestException('Error al consultar la altura disponible');
    }
  }

  async getMotivoExamenReciente(trabajadorId: string): Promise<{ motivoExamen: string | null }> {
    try {
      const historiaClinica = await this.historiaClinicaModel
        .findOne({ idTrabajador: trabajadorId })
        .sort({ fechaHistoriaClinica: -1 })
        .select('motivoExamen')
        .exec();

      if (historiaClinica?.motivoExamen) {
        return { motivoExamen: historiaClinica.motivoExamen };
      }

      return { motivoExamen: null };
    } catch (error) {
      console.error('Error al consultar motivoExamen reciente:', error);
      throw new BadRequestException('Error al consultar el motivoExamen reciente');
    }
  }

  private async actualizarUpdatedAtTrabajador(trabajadorId: string) {
    if (!trabajadorId) return;
    await this.trabajadorModel.findByIdAndUpdate(trabajadorId, { updatedAt: new Date() });
  }

}

function formatDocumentName(documentType: string, fecha: string): string {
  // Separar palabras (asumiendo camelCase, guiones bajos, y preservando espacios existentes)
  const words = documentType
    .split(/(?=[A-Z])|_/g) // Separar por camelCase o guiones bajos
    .flatMap(word => word.split(/\s+/)) // Dividir por espacios múltiples y limpiar
    .filter(word => word.trim() !== ''); // Eliminar palabras vacías
  // Capitalizar la primera letra de cada palabra
  const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  // Unir las palabras con un espacio y agregar la fecha
  return `${capitalized.join(' ')} ${fecha}.pdf`;
}

