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
      from: 'Ramazzini',
      to: email,
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
      from: 'Ramazzini',
      to: email,
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
}
