import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

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
}


