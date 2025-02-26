import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { UsersService } from '../users/users.service';
import { Suscripcion } from './schemas/suscripcion.schema';
import { Pago } from './schemas/pago.schema';
import { ProveedorSalud } from '../proveedores-salud/schemas/proveedor-salud.schema';
import { EmailsService } from '../emails/emails.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatDate = (dateString) => {
  return dateString ? format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es }) : 'No disponible';
};

const formatCurrency = (amount) => {
  return amount.toLocaleString("en-US");
};

@Injectable()
export class PagosService {
  private preApproval: PreApproval;

  constructor(
    private usersService: UsersService,
    private readonly emailsService: EmailsService,
    @InjectModel(Suscripcion.name) private subscriptionModel: Model<Suscripcion>,
    @InjectModel(Pago.name) private paymentModel: Model<Pago>,
    @InjectModel(ProveedorSalud.name) private proveedorSaludModel: Model<ProveedorSalud>
  ) {
    // Inicializamos el cliente de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken:
        process.env.MERCADOPAGO_ACCESS_TOKEN ||
        'APP_USR-7511097887532725-020623-9a55ea3357976dcc3313d4a21568910f-2250541213',
    });

    // Inicializamos las APIs de PreApproval
    this.preApproval = new PreApproval(client);
  }

  // Método para crear una suscripción
  async crearSuscripcion(subscriptionData: any): Promise<any> {
    try {
      const response = await this.preApproval.create({
        body: subscriptionData,
      });
      return response;
    } catch (error) {
      console.error('Error al crear la suscripción:', error);
      throw new Error('No se pudo crear la suscripción.');
    }
  }

  async actualizarSuscripcion(subscriptionId: string, subscriptionData: any): Promise<any> {
    try {
      const response = await this.preApproval.update({
        id: subscriptionId,
        body: subscriptionData,
      });

      return response;

    } catch (error) {
      console.error('Error al actualizar la suscripción:', error);
      throw new Error('No se pudo actualizar la suscripción.');
    }
  }

  async obtenerSuscripcionDeAPI(subscriptionId: string): Promise<any> {
    try {
      const url = `https://api.mercadopago.com/preapproval/${subscriptionId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN ||
            'APP_USR-7511097887532725-020623-9a55ea3357976dcc3313d4a21568910f-2250541213'}`,
        },
      })

      return response.data;

    } catch (error) {
      console.error('Error al obtener la suscripción:', error);
      throw new Error('No se pudo obtener la suscripción.');
    }
  }

  async obtenerSuscripcionDeBaseDatos(subscriptionId: string): Promise<any> {
    return this.subscriptionModel.findOne({ subscription_id: subscriptionId });
  }

  async saveSubscription(subscriptionPayload: any): Promise<any> {
    const proveedor = await this.proveedorSaludModel.findById(subscriptionPayload.idProveedorSalud);
    if (!proveedor) throw new Error('Proveedor de salud no encontrado');

    // Si la suscripción está autorizada, actualizar límites
    if (subscriptionPayload.status === 'authorized') {
        // Verificar que la suscripción anterior no esté ya cancelada antes de intentar cancelarla
        if (
            proveedor.suscripcionActiva &&
            proveedor.suscripcionActiva !== subscriptionPayload.subscription_id
        ) {
            const suscripcionAnterior = await this.subscriptionModel.findOne({
                subscription_id: proveedor.suscripcionActiva,
            });

            if (suscripcionAnterior && suscripcionAnterior.status !== 'cancelled') {
                try {
                    await this.cancelarSuscripcion(proveedor.suscripcionActiva);
                } catch (error) {
                    console.warn('No se pudo cancelar la suscripción anterior, ya estaba cancelada.');
                }
            }
        }

        proveedor.suscripcionActiva = subscriptionPayload.subscription_id;
        proveedor.estadoSuscripcion = 'authorized';
        proveedor.finDeSuscripcion = subscriptionPayload.next_payment_date;

        // Obtener el plan correspondiente a la suscripción
        const selectedPlan = this.getPlanDetails(subscriptionPayload.reason);
        if (selectedPlan) {
            proveedor.maxUsuariosPermitidos = selectedPlan.users + proveedor.addOns.find(a => a.tipo === 'usuario_adicional')?.cantidad || 0;
            proveedor.maxEmpresasPermitidas = selectedPlan.companies + proveedor.addOns.find(a => a.tipo === 'empresas_extra')?.cantidad || 0;
        }

        // Enviar email con detalles de la suscripción
        const emailData = {
          email: subscriptionPayload.external_reference,
          nombrePlan: subscriptionPayload.reason,
          inicioSuscripcion: formatDate(subscriptionPayload.date_created),
          fechaActualizacion: formatDate(subscriptionPayload.last_modified),
          montoMensual: formatCurrency(subscriptionPayload.auto_recurring.transaction_amount),
          fechaProximoPago: formatDate(subscriptionPayload.next_payment_date),
          usuariosDisponibles: proveedor.maxUsuariosPermitidos,
          empresasDisponibles: proveedor.maxEmpresasPermitidas,
        };

        const isNewSubscription = subscriptionPayload.date_created === subscriptionPayload.last_modified;
        await this.emailsService[isNewSubscription ? 'sendNewSubscriptionDetails' : 'sendUpdatedSubscriptionDetails'](emailData);

    } 
    // Si la suscripción es cancelada
    else if (subscriptionPayload.status === 'cancelled') {
        if (proveedor.suscripcionActiva === subscriptionPayload.subscription_id) {
            proveedor.estadoSuscripcion = 'cancelled';
            proveedor.finDeSuscripcion = subscriptionPayload.next_payment_date;
            proveedor.suscripcionActiva = ''; // Aquí aseguramos que se vacíe

            // Estos 3 se ajustarán cuando acabe el ciclo de suscripción
            // proveedor.maxUsuariosPermitidos = 1;
            // proveedor.maxEmpresasPermitidas = 0;
            // proveedor.addOns = [];
        }
    }

    await this.subscriptionModel.findOneAndUpdate(
        { subscription_id: subscriptionPayload.subscription_id },
        subscriptionPayload,
        { upsert: true }
    );

    await proveedor.save();
  }

  // Nueva función para obtener detalles del plan desde la razón de la suscripción
  getPlanDetails(reason: string) {
      const plans = [
          { name: "Ramazzini: Plan Básico", users: 1, companies: 10 },
          { name: "Ramazzini: Plan Profesional", users: 5, companies: 50 },
          { name: "Ramazzini: Plan Empresarial", users: 15, companies: 150 },
      ];
      return plans.find(plan => reason.includes(plan.name)) || null;
  }

  async cancelarSuscripcion(subscriptionId: string): Promise<void> {
    try {
      await this.preApproval.update({ id: subscriptionId, body: { status: 'cancelled' } });
      await this.subscriptionModel.findOneAndUpdate(
        { subscription_id: subscriptionId },
        { status: 'cancelled' }
      );

      // Obtener suscripcion
      const subscriptionDetails = await this.subscriptionModel.findOne({ subscription_id: subscriptionId });

      // Obtener proveedor de salud
      const proveedor = await this.proveedorSaludModel.findById(subscriptionDetails.idProveedorSalud);

      // Crear emailData
      const emailData = {
        email: subscriptionDetails.payer_email,
        nombrePlan: subscriptionDetails.reason,
        inicioSuscripcion: formatDate(subscriptionDetails.date_created),
        fechaCancelacion: formatDate(new Date()),
        montoMensual: formatCurrency(subscriptionDetails.auto_recurring.transaction_amount),
        fechaFinDeSuscripcion: formatDate(subscriptionDetails.next_payment_date),
        usuariosDisponibles: proveedor.maxUsuariosPermitidos,
        empresasDisponibles: proveedor.maxEmpresasPermitidas,
      }

      // Enviar email de cancelación de suscripción
      await this.emailsService.sendCancellationConfirmation(emailData);

    } catch (error) {
      console.error('Error al cancelar la suscripción:', error);
      throw error;
    }
  }

  async savePayment(paymentPayload: any): Promise<any> {
    const existingPayment = await this.paymentModel.findById(paymentPayload.id);

    if (existingPayment) {
      await this.paymentModel.findByIdAndUpdate(paymentPayload.id, paymentPayload);
    } else {
      await new this.paymentModel(paymentPayload).save();
    }

    if (paymentPayload.status === 'rejected' && paymentPayload.retry_attempt < 3) {
      console.warn('Pago fallido, se intentará nuevamente.');
    } else if (paymentPayload.status === 'rejected' && paymentPayload.retry_attempt >= 3) {
      const proveedor = await this.proveedorSaludModel.findById(paymentPayload.proveedorSaludId);
      if (proveedor && proveedor.suscripcionActiva === paymentPayload.preapproval_id) {
        proveedor.estadoSuscripcion = 'inactive';
        proveedor.finDeSuscripcion = null;
        await proveedor.save();
        console.warn('Pago fallido después de múltiples intentos, acceso revocado.');
      }
    }
  }

  // Método para procesar un evento de preapproval
  async procesarPreapproval(preapprovalId: string): Promise<any> {
    try {
      const preapprovalDetails = await this.preApproval.get({ id: preapprovalId });
      // console.log('Detalles de la suscripcion:', preapprovalDetails);

      // Buscar el usuario por su email para obtener el idProveedorSalud
      const payer_email = preapprovalDetails.external_reference;
      const user = await this.usersService.findByEmail(payer_email);

      const subscriptionPayload = {
        subscription_id: preapprovalDetails.id,
        idProveedorSalud: user.idProveedorSalud,
        payer_id: preapprovalDetails.payer_id,
        payer_email: preapprovalDetails.external_reference,
        back_url: preapprovalDetails.back_url,
        status: preapprovalDetails.status,
        reason: preapprovalDetails.reason,
        date_created: preapprovalDetails.date_created,
        last_modified: preapprovalDetails.last_modified,
        init_point: preapprovalDetails.init_point,
        auto_recurring: preapprovalDetails.auto_recurring,
        next_payment_date: preapprovalDetails.next_payment_date,
        payment_method_id: preapprovalDetails.payment_method_id
      };
      
      // Guardar suscripcion en la base de datos referenciando el idProveedorSalud
      await this.saveSubscription(subscriptionPayload);

      // console.log('preapprovalDetails:', preapprovalDetails);

      console.log('Resumen de suscripcion que se manda a guardar:', {
        subscription_id: preapprovalDetails.id,
        idProveedorSalud: user.idProveedorSalud,
        payer_email: preapprovalDetails.external_reference,
        status: preapprovalDetails.status,
      });

    } catch (error) {
      console.error('Error al obtener los detalles de la suscripción:', error);
      throw error;
    }
  }

  // Método para procesar un evento de authorized payment
  async procesarAuthorizedPayment(paymentId: string): Promise<any> {
    try {
      const url = `https://api.mercadopago.com/authorized_payments/${paymentId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN ||
            'APP_USR-7511097887532725-020623-9a55ea3357976dcc3313d4a21568910f-2250541213'}`
        }
      });

      const paymentDetails = response.data;
      // console.log('Detalles del pago:', paymentDetails);

      // Buscar el usuario por su email
      const payer_email = paymentDetails.external_reference;
      const user = await this.usersService.findByEmail(payer_email);

      const paymentPayload = {
        payment_id: paymentDetails.id,
        preapproval_id: paymentDetails.preapproval_id,
        proveedorSaludId: user.idProveedorSalud,
        type: paymentDetails.type,
        status: paymentDetails.status,
        date_created: paymentDetails.date_created,
        last_modified: paymentDetails.last_modified,
        transaction_amount: paymentDetails.transaction_amount,
        currency_id: paymentDetails.currency_id,
        reason: paymentDetails.reason,
        external_reference: paymentDetails.external_reference, // email del usuario
        payment: paymentDetails.payment, // id, status, status_detail
        retry_attempt: paymentDetails.retry_attempt,
        next_retry_date: paymentDetails.next_retry_date,
        payment_method_id: paymentDetails.payment_method_id
      };

      // Guardar pago en la base de datos referenciando el idProveedorSalud
      await this.savePayment(paymentPayload);

      // console.log('paymentDetails:', paymentDetails);

      console.log('Resumen de pago que se manda a guardar:', {
        payment_id: paymentDetails.id,
        preapproval_id: paymentDetails.preapproval_id,
        proveedorSaludId: user.idProveedorSalud,
        status: paymentDetails.status,
        payment: paymentDetails.payment,
        transaction_amount: paymentDetails.transaction_amount,
      });

    } catch (error) {
      console.error('Error al obtener los detalles del pago:', error);
      throw error;
    }
  }
  
}


