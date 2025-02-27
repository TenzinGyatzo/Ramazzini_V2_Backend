// emails.service.ts
import { Injectable } from '@nestjs/common';
import { createTransport } from './emails.config';
import { text } from 'stream/consumers';

@Injectable()
export class EmailsService {
  async sendEmailVerification({ username, email, token }) {
    const transporter = createTransport(
      process.env.EMAIL_HOST,
      process.env.EMAIL_PORT,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );

    // Enviar el email
    const info = await transporter.sendMail({
      from: `"Soporte Ramazzini" <${process.env.EMAIL_USER}>`,
      to: email,
      bcc: process.env.EMAIL_USER, // Copia oculta al remitente
      subject: 'Ramazzini - Confirma tu cuenta',
      text: 'Ramazzini - Confirma tu cuenta',
      html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <h1 style="font-size: 24px; color: #2c3e50;">Confirma tu Cuenta</h1>
        <p>Hola <strong>${username}</strong>, confirma tu cuenta en Ramazzini.</p>
        <p>Tu cuenta está casi lista, solo debes confirmarla haciendo clic en el siguiente enlace:</p>
        <p><a href="${process.env.FRONTEND_URL_DOMAIN}/auth/confirmar-cuenta/${token}" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Cuenta</a></p>
        <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>`,
    });

    console.log('Mensaje enviado', info.messageId);
  }

  async sendEmailPasswordReset({ username, email, token }) {
    const transporter = createTransport(
      process.env.EMAIL_HOST,
      process.env.EMAIL_PORT,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );

    // Enviar el email
    const info = await transporter.sendMail({
      from: `"Soporte Ramazzini" <${process.env.EMAIL_USER}>`,
      to: email,
      bcc: process.env.EMAIL_USER, // Copia oculta al remitente
      subject: 'Ramazzini - Reestablece tu contraseña',
      text: 'Ramazzini - Reestablece tu contraseña',
      html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <h1 style="font-size: 24px; color: #2c3e50;">Nueva contraseña</h1>
        <p>Hola <strong>${username}</strong>, has solicitado reestablecer tu contraseña.</p>
        <p>Presiona el siguiente botón para continuar:</p>
        <p><a href="${process.env.FRONTEND_URL_DOMAIN}/auth/olvide-password/${token}" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reestablecer contraseña</a></p>
        <p>Si tú no solicitaste esto, puedes ignorar este mensaje.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>`,
    });

    console.log('Mensaje enviado', info.messageId);
  }

  async sendNewSubscriptionDetails({ email, nombrePlan, inicioSuscripcion, fechaActualizacion, montoMensual, fechaProximoPago, usuariosDisponibles, empresasDisponibles }) {
    const transporter = createTransport(
      process.env.EMAIL_HOST,
      process.env.EMAIL_PORT,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );
  
    // Enviar el email
    const info = await transporter.sendMail({
      from: `"Soporte Ramazzini" <${process.env.EMAIL_USER}>`,
      // to: email,
      to: 'edgarcoronel66@gmail.com', // Cambiar por email del usuario
      bcc: process.env.EMAIL_USER, // Copia oculta al remitente
      subject: 'Bienvenido a Ramazzini - Detalles de tu Nueva Suscripción',
      text: 'Detalles de tu Nueva Suscripción - Ramazzini',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background-color: #2c3e50; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1 style="font-size: 24px; color: #fff; margin: 0;">¡Bienvenido a Ramazzini!</h1>
          </div>
  
          <!-- Body -->
          <div style="padding: 20px; background-color: #f8f9fa; border-radius: 0 0 5px 5px;">
              <p style="font-size: 16px;">Hola,</p>
              <p style="font-size: 16px;">¡Gracias por unirte a <strong>Ramazzini</strong>! Aquí tienes los detalles de tu nueva suscripción:</p>
  
              <!-- Detalles de la suscripción -->
              <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #ddd;">
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Plan Contratado:</strong> ${nombrePlan}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Fecha de Inicio:</strong> ${inicioSuscripcion}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Monto Mensual:</strong> $${montoMensual} MXN</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Próximo Pago:</strong> ${fechaProximoPago}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Usuarios Disponibles:</strong> ${usuariosDisponibles}</p>
                  <p style="font-size: 16px; margin: 0;"><strong>Empresas Disponibles:</strong> ${empresasDisponibles}</p>
              </div>
  
              <!-- Llamado a la acción -->
              <p style="font-size: 16px; text-align: center; margin: 20px 0;">
                  <a href="${process.env.FRONTEND_URL_DOMAIN}/suscripcion-activa" 
                     style="background-color: #27ae60; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                     Acceder a Mi Cuenta
                  </a>
              </p>
  
              <!-- Mensaje de bienvenida -->
              <p style="font-size: 16px;">Estamos emocionados de tenerte con nosotros. Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          </div>
  
          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Ramazzini. Todos los derechos reservados.</p>
          </div>
      </div>`,
    });
  
    console.log('Mensaje enviado', info.messageId);
  }

  async sendUpdatedSubscriptionDetails({ email, nombrePlan, inicioSuscripcion, fechaActualizacion, montoMensual, fechaProximoPago, usuariosDisponibles, empresasDisponibles }) {
    const transporter = createTransport(
      process.env.EMAIL_HOST,
      process.env.EMAIL_PORT,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );
  
    // Enviar el email
    const info = await transporter.sendMail({
      from: `"Soporte Ramazzini" <${process.env.EMAIL_USER}>`,
      // to: email,
      to: 'edgarcoronel66@gmail.com', // Cambiar por email del usuario
      bcc: process.env.EMAIL_USER, // Copia oculta al remitente
      subject: 'Suscripción Actualizada',
      text: 'Detalles de Suscripción - Ramazzini',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background-color: #2c3e50; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1 style="font-size: 24px; color: #fff; margin: 0;">Detalles de tu Suscripción</h1>
          </div>
  
          <!-- Body -->
          <div style="padding: 20px; background-color: #f8f9fa; border-radius: 0 0 5px 5px;">
              <p style="font-size: 16px;">Hola,</p>
              <p style="font-size: 16px;">Aquí tienes los detalles actualizados de tu suscripción en <strong>Ramazzini</strong>:</p>
  
              <!-- Detalles de la suscripción -->
              <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #ddd;">
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Plan Actual:</strong> ${nombrePlan}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Fecha de Inicio:</strong> ${inicioSuscripcion}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Última Actualización:</strong> ${fechaActualizacion}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Monto Mensual:</strong> $${montoMensual} MXN</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Próximo Pago:</strong> ${fechaProximoPago}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Usuarios Disponibles:</strong> ${usuariosDisponibles}</p>
                  <p style="font-size: 16px; margin: 0;"><strong>Empresas Disponibles:</strong> ${empresasDisponibles}</p>
              </div>
  
              <!-- Llamado a la acción -->
              <p style="font-size: 16px; text-align: center; margin: 20px 0;">
                  <a href="${process.env.FRONTEND_URL_DOMAIN}/suscripcion-activa" 
                     style="background-color: #27ae60; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                     Ver Mi Cuenta
                  </a>
              </p>
  
              <!-- Mensaje de agradecimiento -->
              <p style="font-size: 16px;">Gracias por confiar en <strong>Ramazzini</strong>. Si tienes alguna pregunta, no dudes en contactarnos.</p>
          </div>
  
          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Ramazzini. Todos los derechos reservados.</p>
          </div>
      </div>`,
    });
  
    console.log('Mensaje enviado', info.messageId);
  }

  async sendCancellationConfirmation({ email, nombrePlan, inicioSuscripcion, fechaCancelacion, montoMensual, fechaFinDeSuscripcion, usuariosDisponibles, empresasDisponibles }) {
    const transporter = createTransport(
      process.env.EMAIL_HOST,
      process.env.EMAIL_PORT,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );
  
    // Enviar el email
    const info = await transporter.sendMail({
      from: `"Soporte Ramazzini" <${process.env.EMAIL_USER}>`,
      // to: email,
      to: 'edgarcoronel66@gmail.com', // Cambiar por email del usuario
      bcc: process.env.EMAIL_USER, // Copia oculta al remitente
      subject: 'Suscripción Cancelada',
      text: 'Detalles de cancelación',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background-color: #2c3e50; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1 style="font-size: 24px; color: #fff; margin: 0;">Cancelación de Suscripción</h1>
          </div>
  
          <!-- Body -->
          <div style="padding: 20px; background-color: #f8f9fa; border-radius: 0 0 5px 5px;">
              <p style="font-size: 16px;">Hola,</p>
              <p style="font-size: 16px;">Hemos procesado la cancelación de tu suscripción <strong>${nombrePlan}</strong>. A continuación, te proporcionamos los detalles importantes:</p>
  
              <!-- Detalles de la cancelación -->
              <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #ddd;">
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Plan Cancelado:</strong> ${nombrePlan}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Fecha de Inicio:</strong> ${inicioSuscripcion}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Fecha de Cancelación:</strong> ${fechaCancelacion}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Monto Mensual:</strong> $${montoMensual} MXN</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Acceso hasta:</strong> ${fechaFinDeSuscripcion}</p>
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Usuarios Disponibles:</strong> ${usuariosDisponibles} (hasta el fin del periodo)</p>
                  <p style="font-size: 16px; margin: 0;"><strong>Empresas Disponibles:</strong> ${empresasDisponibles} (hasta el fin del periodo)</p>
              </div>
  
              <!-- Mensaje importante -->
              <p style="font-size: 16px; color: #e74c3c; font-weight: bold;">
                  ⚠️ Tu acceso a los beneficios continuará hasta el <strong>${fechaFinDeSuscripcion}</strong>. Después de esta fecha, los beneficios de tu cuenta se desactivarán automáticamente.
              </p>
  
              <!-- Llamado a la acción -->
              <p style="font-size: 16px; text-align: center; margin: 20px 0;">
                  Si cambias de opinión o necesitas ayuda, puedes solicitar una nueva suscripción en cualquier momento:
                  <a href="${process.env.FRONTEND_URL_DOMAIN}/suscripcion" 
                     style="background-color: #27ae60; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block; margin-top: 10px;">
                     Solicitar Nueva Suscripción
                  </a>
              </p>
  
              <!-- Mensaje de agradecimiento -->
              <p style="font-size: 16px;">Gracias por haber sido parte de <strong>Ramazzini</strong>. Esperamos volver a verte pronto.</p>
          </div>
  
          <!-- Footer -->
          <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Ramazzini. Todos los derechos reservados.</p>
          </div>
      </div>`,
    });
  
    console.log('Mensaje enviado', info.messageId);
  }
}
