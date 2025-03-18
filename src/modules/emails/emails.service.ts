// emails.service.ts
import { Injectable } from '@nestjs/common';
import { createTransport } from './emails.config';
import { text } from 'stream/consumers';
import path from 'path';
import * as fs from 'fs';
import { Cron } from '@nestjs/schedule';
import * as os from 'os';
import pidusage from 'pidusage';
import { execSync } from 'child_process';
import { get } from 'mongoose';
import mongoose from 'mongoose';

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

  async sendNewSubscriptionDetails({ email, nombrePlan, inicioSuscripcion, fechaActualizacion, montoMensual, fechaProximoPago, historiasDisponibles }) {
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
      // to: 'edgarcoronel66@gmail.com', // Cambiar por email del usuario
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
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Límite de Historias Clínicas al Mes:</strong> ${historiasDisponibles}</p>
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

  async sendUpdatedSubscriptionDetails({ email, nombrePlan, inicioSuscripcion, fechaActualizacion, montoMensual, fechaProximoPago, historiasDisponibles }) {
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
      // to: 'edgarcoronel66@gmail.com', // Cambiar por email del usuario
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
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Límite de Historias Clínicas al Mes:</strong> ${historiasDisponibles}</p>
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

  async sendCancellationConfirmation({ email, nombrePlan, inicioSuscripcion, fechaCancelacion, montoMensual, fechaFinDeSuscripcion, historiasDisponibles }) {
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
      // to: 'edgarcoronel66@gmail.com', // Cambiar por email del usuario
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
                  <p style="font-size: 16px; margin: 0 0 10px;"><strong>Límite de Historias Clínicas al Mes:</strong> ${historiasDisponibles}</p>
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

  //// Funciones para el reporte de uso del servidor ////

  private readonly METRICS_FILE = process.env.METRICS_FILE || path.join(__dirname, 'server_metrics.json');

  async saveMetric() {
    const timestamp = new Date().toISOString();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercentage = (usedMemory / totalMemory) * 100;
    const pidStats = await pidusage(process.pid);
    const cpuUsage = pidStats.cpu;
    const diskStats = await this.getDiskUsage();
  
    const newMetric = {
      timestamp,
      memoryUsagePercentage,
      cpuUsage,
      diskStats,
    };
  
    let metrics = [];
  
    if (fs.existsSync(this.METRICS_FILE)) {
      metrics = JSON.parse(fs.readFileSync(this.METRICS_FILE, 'utf8'));
    }
  
    metrics.push(newMetric);
  
    // Mantener solo los últimos 2 días de datos
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    metrics = metrics.filter((m) => new Date(m.timestamp) >= twoDaysAgo);
  
    fs.writeFileSync(this.METRICS_FILE, JSON.stringify(metrics, null, 2));
  }  

  async getMetricsSummary(): Promise<string> {
    if (!fs.existsSync(this.METRICS_FILE)) {
      return "⚠️ No hay datos históricos suficientes.";
    }
  
    const metrics = JSON.parse(fs.readFileSync(this.METRICS_FILE, 'utf8'));
  
    const cpuUsages = metrics.map((m) => m.cpuUsage);
    const memoryUsages = metrics.map((m) => m.memoryUsagePercentage);
  
    const avgCpu = (cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length).toFixed(2);
    const peakCpu = Math.max(...cpuUsages).toFixed(2);
  
    const avgMemory = (memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length).toFixed(2);
    const peakMemory = Math.max(...memoryUsages).toFixed(2);
  
    return `
  Resumen de las Últimas 12 Horas (Horario Pico)
  🔹 CPU Promedio: ${avgCpu}%
  🔹 CPU Máximo: ${peakCpu}%
  🔹 Memoria Promedio: ${avgMemory}%
  🔹 Memoria Máxima: ${peakMemory}%
  `;
  }  

  async generateAlerts(): Promise<string> {
    if (!fs.existsSync(this.METRICS_FILE)) {
      return "⚠️ No hay datos históricos para generar alertas.";
    }
  
    const metrics = JSON.parse(fs.readFileSync(this.METRICS_FILE, 'utf8'));
  
    const highCpuUsage = metrics.filter((m) => m.cpuUsage > 80);
    const highMemoryUsage = metrics.filter((m) => m.memoryUsagePercentage > 90);
  
    let alerts = [];
  
    if (highCpuUsage.length > 6) {
      alerts.push("⚠️ CPU ha estado sobre 80% por más de 1 hora.");
    }
    if (highMemoryUsage.length > 3) {
      alerts.push("⚠️ Memoria ha estado sobre 90% por más de 30 minutos.");
    }
  
    return alerts.length > 0 ? alerts.join("\n") : "✅ No se detectaron problemas críticos.";
  }

  async getDiskUsage(): Promise<string> {
    try {
      if (os.platform() === 'win32') {
        const output = execSync('wmic logicaldisk get deviceid, freespace, size').toString().trim();
        const lines = output.split('\n').slice(1);
        let result = '';
  
        lines.forEach((line) => {
          const values = line.trim().split(/\s+/);
          if (values.length === 3) {
            const device = values[0].replace(':', '');
            const free = parseInt(values[1], 10);
            const size = parseInt(values[2], 10);
            const used = size - free;
            const usedGB = (used / 1e9).toFixed(2);
            const sizeGB = (size / 1e9).toFixed(2);
            const usagePercentage = ((used / size) * 100).toFixed(2);
  
            result += `📂 ${device}: ${usedGB} GB usados de ${sizeGB} GB (${usagePercentage}% ocupado)\n`;
          }
        });
  
        return result.trim();
      } else {
        // Verificar si df está disponible antes de ejecutarlo
        try {
          execSync("which df");
        } catch {
          return "⚠️ df no está instalado. Usa `sudo apt install coreutils`.";
        }
  
        return execSync("df -h | awk 'NR>1 {print $1, $3, $4, $5}'").toString().trim();
      }
    } catch (error) {
      return '⚠️ No se pudo obtener información del disco.';
    }
  } 

  async getCpuUsage(): Promise<string> {
    try {
      if (os.platform() === 'win32') {
        return Promise.resolve(execSync('wmic cpu get loadpercentage').toString().trim());
      } else {
        // Verificar si mpstat está instalado antes de ejecutarlo
        try {
          execSync("which mpstat");
        } catch {
          return "⚠️ mpstat no está instalado. Usa `sudo apt install sysstat`.";
        }
  
        return Promise.resolve(execSync("mpstat 1 1 | awk 'NR==4 {print 100-$NF}'").toString().trim() + " %");
      }
    } catch (error) {
      return Promise.resolve('⚠️ No se pudo obtener información de CPU.');
    }
  }
  
  async checkServiceStatus(service: string): Promise<string> {
    try {
      return os.platform() === 'win32'
        ? '⚠️ No disponible en Windows'
        : execSync(`systemctl is-active ${service}`).toString().trim() === 'active'
        ? `✅ ${service} está activo`
        : `⚠️ ${service} está detenido`;
    } catch (error) {
      return `⚠️ Error al verificar ${service}`;
    }
  }

  async checkMongoConnection(): Promise<string> {
    try {
        const db = await mongoose.createConnection(process.env.MONGODB_URI);
        await db.close();
        return "✅ Conexión con MongoDB exitosa.";
    } catch (error) {
        return "⚠️ No se pudo conectar a MongoDB.";
    }
  }

  async getActiveConnections(): Promise<string> {
    try {
      return os.platform() === 'win32'
        ? '⚠️ No disponible en Windows'
        : execSync("netstat -an | grep ESTABLISHED | wc -l").toString().trim() + " conexiones activas";
    } catch (error) {
      return '⚠️ No se pudo obtener conexiones activas.';
    }
  }

  async saveUsageHistory(report: string) {
    const historyPath = path.join(__dirname, 'usage_history.txt');
    
    // Cargar el historial existente
    let history = fs.existsSync(historyPath) ? fs.readFileSync(historyPath, 'utf8').split('\n') : [];

    // Filtrar solo los reportes de los últimos 2 días
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    history = history.filter(line => {
        const match = line.match(/\d{4}-\d{2}-\d{2}/);
        return match ? new Date(match[0]) >= twoDaysAgo : false;
    });

    // ✅ Verificar si el nuevo reporte ya está en el historial
    if (history.includes(report.trim())) {
        console.log("⚠️ Reporte duplicado detectado. No se guardará nuevamente.");
        return;
    }

    // Agregar el nuevo reporte y escribir de nuevo
    history.push(report);
    fs.writeFileSync(historyPath, history.join('\n'), 'utf8');
}
  
  async getPreviousUsage(): Promise<string> {
    const historyPath = path.join(__dirname, 'usage_history.txt');
    
    if (!fs.existsSync(historyPath)) return '📊 No hay historial previo.';
  
    const history = fs.readFileSync(historyPath, 'utf8').split('\n').slice(-50); // Limitar a las últimas 50 líneas
    
    return history.join('\n');
  }
  
  
  //// Generar el reporte de uso del servidor ////

  async generateServerReport(): Promise<string> {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercentage = (usedMemory / totalMemory) * 100;
  
    const pidStats = await pidusage(process.pid);
    const cpuUsage = pidStats.cpu;
    const memoryUsedByNode = pidStats.memory;
  
    const totalCpuUsage = await this.getCpuUsage();
    const loadAvg = os.loadavg();
    const diskStats = await this.getDiskUsage();
    const runningProcesses = execSync("ps aux | wc -l").toString().trim();
  
    const dbStatus = await this.checkMongoConnection();
    const nginxStatus = await this.checkServiceStatus('nginx');
    const activeConnections = await this.getActiveConnections();
  
    const peakMetrics = await this.getMetricsSummary();
    const alertMessages = await this.generateAlerts();
    const previousUsage = await this.getPreviousUsage();
  
    // 📌 Reporte Formateado
    const reportContent = `
    ═════════════════════════════
    📊 𝗥𝗘𝗣𝗢𝗥𝗧𝗘 𝗗𝗘 𝗦𝗘𝗥𝗩𝗜𝗗𝗢𝗥 - 𝗥𝗔𝗠𝗔𝗭𝗭𝗜𝗡𝗜
    ═════════════════════════════
    
    💾 𝗠𝗘𝗠𝗢𝗥𝗜𝗔
    ─────────────────────────────
    🟢 Total: ${(totalMemory / 1e9).toFixed(2)} GB
    🟡 Usada: ${(usedMemory / 1e9).toFixed(2)} GB (${memoryUsagePercentage.toFixed(2)}%)
    🔵 Libre: ${(freeMemory / 1e9).toFixed(2)} GB
    🟣 Node.js: ${(memoryUsedByNode / 1e6).toFixed(2)} MB
  
    🖥️ 𝗖𝗣𝗨
    ─────────────────────────────
    🟠 CPU (Node.js): ${cpuUsage.toFixed(2)}%
    🔴 CPU Total: ${totalCpuUsage}
  
    📊 𝗖𝗔𝗥𝗚𝗔 𝗗𝗘𝗟 𝗦𝗜𝗦𝗧𝗘𝗠𝗔
    ─────────────────────────────
    ⏳ Último minuto: ${loadAvg[0].toFixed(2)}
    ⏳ Últimos 5 minutos: ${loadAvg[1].toFixed(2)}
    ⏳ Últimos 15 minutos: ${loadAvg[2].toFixed(2)}
  
    📊 𝗦𝗨𝗠𝗔𝗥𝗜𝗢 𝗗𝗘𝗟 𝗛𝗢𝗥𝗔𝗥𝗜𝗢 𝗣𝗜𝗖𝗢 (7 AM - 7 PM)
    ─────────────────────────────
    ${peakMetrics}
  
    💽 𝗘𝗦𝗧𝗔𝗗𝗜́𝗦𝗧𝗜𝗖𝗔𝗦 𝗗𝗘 𝗗𝗜𝗦𝗖𝗢
    ─────────────────────────────
    ${diskStats}
  
    ⚙️ 𝗣𝗥𝗢𝗖𝗘𝗦𝗢𝗦 𝗬 𝗖𝗢𝗡𝗘𝗫𝗜𝗢𝗡𝗘𝗦
    ─────────────────────────────
    📌 Procesos en Ejecución: ${runningProcesses}
    🌐 Conexiones Activas: ${activeConnections}
  
    🔧 𝗘𝗦𝗧𝗔𝗗𝗢 𝗗𝗘 𝗦𝗘𝗥𝗩𝗜𝗖𝗜𝗢𝗦
    ─────────────────────────────
    ✅ ${dbStatus}
    ✅ ${nginxStatus}
  
    📜 𝗛𝗜𝗦𝗧𝗢𝗥𝗜𝗔𝗟 𝗗𝗘 𝗟𝗔𝗦 𝗨́𝗟𝗧𝗜𝗠𝗔𝗦 𝟮𝟰 𝗛𝗢𝗥𝗔𝗦
    ─────────────────────────────
    ${previousUsage}
  
    🚨 𝗔𝗟𝗘𝗥𝗧𝗔𝗦 𝗬 𝗥𝗘𝗖𝗢𝗠𝗘𝗡𝗗𝗔𝗖𝗜𝗢𝗡𝗘𝗦
    ═════════════════════════════
    ${alertMessages}
    `;
  
    // Guardar historial del reporte sin duplicaciones
    await this.saveUsageHistory(reportContent);
  
    return reportContent;
  }
  
  
  async sendServerReport() {
    const transporter = createTransport(
      process.env.EMAIL_HOST,
      process.env.EMAIL_PORT,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );

    const reportContent = await this.generateServerReport();

    // Generar el reporte (puede ser un archivo PDF, CSV, etc.)
    // const reportPath = path.join(__dirname, 'reporte.txt');
    // fs.writeFileSync(reportPath, reportContent, 'utf8');
  
    // Enviar el email
    const info = await transporter.sendMail({
      from: `"Reportes Ramazzini" <${process.env.EMAIL_USER}>`,
      to: "edgarcoronel66@gmail.com",
      bcc: process.env.EMAIL_USER, // Copia oculta al remitente
      subject: '📊 Reporte de Uso del Servidor',
      // text: 'Adjunto el reporte generado automáticamente',
      // text: reportContent,
      // attachments: [{ filename: 'Salud de Servidor Ramazzini.txt', path: reportPath }], // Adjuntar respaldo simple
      html: `<pre>${reportContent}</pre>`,
    });
  
    console.log('Mensaje enviado', info.messageId);
  }

  @Cron('*/10 7-19 * * *')   // De 12 AM a 2 AM UTC-7 (convertido a 12 AM - 2 AM UTC)
  async trackMetrics() {
    console.log(`📊 Guardando métricas de servidor a las ${new Date().toLocaleString()} (hora local)`);
    await this.saveMetric();
  }

  // 🔹 Ejecutar el reporte automáticamente cada día a las 19:00 AM
  @Cron('0 19 * * *')
  async handleCron() {
    console.log(`⏳ Enviando reporte diario a las ${new Date().toLocaleString()} (hora local)`);
    await this.sendServerReport();
  }

}
