import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import axios from 'axios';

@Injectable()
export class PagosService {
  private preApproval: PreApproval;

  constructor() {
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

  // Método para eliminar una suscripción
  async eliminarSuscripcion(subscriptionId: string): Promise<any> {
    try {
      // const response = await this.preApproval.cancel(subscriptionId);
      // return response;
      console.log('subscriptionId:', subscriptionId);
    } catch (error) {
      console.error('Error al eliminar la suscripción:', error);
      throw new Error('No se pudo eliminar la suscripción.');
    }
  }

  // Método para procesar un evento de preapproval
  async procesarPreapproval(preapprovalId: string): Promise<any> {
    try {
      const preapprovalDetails = await this.preApproval.get({ id: preapprovalId });
      console.log('Detalles de la suscripcion:', preapprovalDetails);
      
      // Actualizar proveedorSalud en la base de datos usando esos datos obtenidos
      const subscriptionId = preapprovalDetails.id;
      const payer_email = preapprovalDetails.external_reference;
      const transaction_amount = preapprovalDetails.auto_recurring.transaction_amount;
      const status = preapprovalDetails.status; // pending, authorized, cancelled

      console.log('------------------------------------------------');
      console.log('subscriptionId:', subscriptionId);
      console.log('payer_email:', payer_email);
      console.log('transaction_amount:', transaction_amount);
      console.log('status:', status);
      console.log('------------------------------------------------');

    } catch (error) {
      console.error('Error al obtener los detalles de la suscripción:', error);
      throw error;
    }
  }

  // Método para procesar un evento de authorized payment
  async procesarAuthorizedPayment(paymentId: string): Promise<any> {
    try {
      const url = `https://api.mercadopago.com/authorized_payments/${paymentId}`;

      console.log('URL:', url);
      console.log('Authorization:', `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN ||
        'APP_USR-7511097887532725-020623-9a55ea3357976dcc3313d4a21568910f-2250541213'}`);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN ||
            'APP_USR-7511097887532725-020623-9a55ea3357976dcc3313d4a21568910f-2250541213'}`
        }
      });

      const paymentDetails = response.data;
      console.log('Detalles del pago:', paymentDetails);

      // Actualizar estadoSuscripcion de proveedorSalud usando el const status
      const status = paymentDetails.status;
      console.log('------------------------------------------------');
      console.log('status:', status);
      console.log('------------------------------------------------');

    } catch (error) {
      console.error('Error al obtener los detalles del pago:', error);
      throw error;
    }
  }
  
}


