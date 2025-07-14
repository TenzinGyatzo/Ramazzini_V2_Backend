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
    🔹 CPU Promedio: ${avgCpu}% (${this.interpretValue(Number(avgCpu), { low: 50, high: 80 })})
    🔹 CPU Máximo: ${peakCpu}% (${this.interpretValue(Number(peakCpu), { low: 50, high: 80 })})
    🔹 Memoria Promedio: ${avgMemory}% (${this.interpretValue(Number(avgMemory), { low: 60, high: 90 })})
    🔹 Memoria Máxima: ${peakMemory}% (${this.interpretValue(Number(peakMemory), { low: 60, high: 90 })})
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
  
            result += `    📂 ${device}: ${usedGB} GB usados de ${sizeGB} GB (${usagePercentage}% ocupado)\n`;
          }
        });
  
        return result.trim();
      } else {
        // Verificar si df está disponible
        try {
          execSync("which df");
        } catch {
          return "⚠️ df no está instalado. Usa `sudo apt install coreutils`.";
        }
  
        const output = execSync("df -k --output=source,used,size,pcent | tail -n +2")
          .toString()
          .trim()
          .split('\n');
  
        let result = '';
  
        output.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts[0].startsWith('/dev/')) {
            const device = parts[0].replace('/dev/', '');
            const used = (parseInt(parts[1]) * 1024 / 1e9).toFixed(2); // de KB a GB
            const size = (parseInt(parts[2]) * 1024 / 1e9).toFixed(2);
            const percent = parts[3];
  
            result += `    📂 ${device}: ${used} GB usados de ${size} GB (${percent} ocupado)\n`;
          }
        });
  
        return result.trim();
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

  async saveUsageHistory(cpuUsage: number, memoryUsagePercentage: number) {
    const historyPath = path.join(__dirname, 'usage_history.txt');
    const today = new Date().toISOString().split('T')[0];
  
    // Formato simple de línea única
    const line = `${today} | CPU: ${cpuUsage.toFixed(2)}% | Memoria: ${memoryUsagePercentage.toFixed(2)}%`;
  
    // Leer historial existente
    let history = fs.existsSync(historyPath)
      ? fs.readFileSync(historyPath, 'utf8').split('\n')
      : [];
  
    // Eliminar duplicados del mismo día
    history = history.filter(h => !h.startsWith(today));
  
    // Agregar nueva línea
    history.push(line);
  
    // Limitar a últimos 3 días
    const maxLines = 3;
    if (history.length > maxLines) {
      history = history.slice(history.length - maxLines);
    }
  
    fs.writeFileSync(historyPath, history.join('\n'), 'utf8');
  }  

  async checkAndSendAlertIfCritical() {
    const metricsFile = this.METRICS_FILE;
  
    if (!fs.existsSync(metricsFile)) return;
  
    const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
    const lastMetric = metrics[metrics.length - 1];
  
    const alerts: string[] = [];
  
    if (lastMetric.cpuUsage > 80) {
      alerts.push(`⚠️ Uso de CPU alto: ${lastMetric.cpuUsage.toFixed(2)}%`);
    }
  
    if (lastMetric.memoryUsagePercentage > 90) {
      alerts.push(`⚠️ Uso de Memoria alto: ${lastMetric.memoryUsagePercentage.toFixed(2)}%`);
    }
  
    const diskLines = lastMetric.diskStats.split('\n');
    for (const line of diskLines) {
      const match = line.match(/(\d+)%/);
      if (match && parseInt(match[1]) >= 95) {
        alerts.push(`⚠️ Espacio en disco crítico: ${line}`);
        break;
      }
    }
  
    if (alerts.length === 0) return; // No hay alertas, salir
  
    // Si hay alertas, enviar correo
    const transporter = createTransport(
      process.env.EMAIL_HOST,
      process.env.EMAIL_PORT,
      process.env.EMAIL_USER,
      process.env.EMAIL_PASS,
    );
  
    const info = await transporter.sendMail({
      from: `"Alertas Ramazzini" <${process.env.EMAIL_USER}>`,
      to: "edgarcoronel66@gmail.com",
      subject: '🚨 Alerta Crítica del Servidor',
      html: `<pre>${alerts.join('\n')}</pre>`,
    });
  
    console.log('📨 Alerta crítica enviada:', info.messageId);
  }  

  private interpretValue(value: number, thresholds: { low: number; high: number }): string {
    if (value < thresholds.low) return '🟢 Bajo';
    if (value < thresholds.high) return '🟡 Medio';
    return '🔴 Alto';
  }

  private async getCreatedPdfsSummary(): Promise<string> {
    const basePath = path.resolve('expedientes-medicos');
    const tiposValidos = [
      'Antidoping',
      'Aptitud',
      'Certificado',
      'Examen Vista',
      'Historia Clinica',
      'Exploracion Fisica',
      'Nota Medica',
    ];

    const hoy = new Date();
    const hoyFormateado = hoy.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-'); // "DD-MM-YYYY"

    let totalArchivos = 0;
    let totalMB = 0;

    const recorrer = async (dir: string) => {
      const elementos = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const el of elementos) {
        const fullPath = path.join(dir, el.name);

        if (el.isDirectory()) {
          await recorrer(fullPath);
        } else if (
          el.isFile() &&
          el.name.endsWith('.pdf') &&
          tiposValidos.some(tipo => el.name.startsWith(tipo + ' '))
        ) {
          const stat = await fs.promises.stat(fullPath);

          const createdDate = stat.mtime.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).replace(/\//g, '-');

          if (createdDate === hoyFormateado) {
            totalArchivos++;
            totalMB += stat.size / (1024 * 1024);
          }
        }
      }
    };

    try {
      await recorrer(basePath);
    } catch (err) {
      return '⚠️ No se pudo calcular la cantidad de PDFs creados.';
    }

    if (totalArchivos === 0) {
      return '📁 No se generaron informes PDF hoy.';
    }

    return `📄 Creados: ${totalArchivos} archivos — ${totalMB.toFixed(2)} MB usados`;
  }

  private async getUploadedExternalDocsSummary(): Promise<string> {
    const basePath = path.resolve('expedientes-medicos');
    const tiposInternos = [
      'Antidoping',
      'Aptitud',
      'Certificado',
      'Examen Vista',
      'Historia Clinica',
      'Exploracion Fisica',
      'Nota Medica',
    ];

    const extensionesExternas = ['.pdf', '.jpg', '.jpeg', '.png'];

    const hoy = new Date();
    const hoyFormateado = hoy.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-'); // "DD-MM-YYYY"

    let totalArchivos = 0;
    let totalMB = 0;

    const recorrer = async (dir: string) => {
      const elementos = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const el of elementos) {
        const fullPath = path.join(dir, el.name);

        if (el.isDirectory()) {
          await recorrer(fullPath);
        } else if (el.isFile()) {
          const ext = path.extname(el.name).toLowerCase();
          const esExtensionValida = extensionesExternas.includes(ext);
          const esGeneradoInternamente = tiposInternos.some(tipo => el.name.startsWith(tipo + ' '));

          if (esExtensionValida && !esGeneradoInternamente) {
            const stat = await fs.promises.stat(fullPath);

            const createdDate = stat.mtime.toLocaleDateString('es-MX', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).replace(/\//g, '-');

            if (createdDate === hoyFormateado) {
              totalArchivos++;
              totalMB += stat.size / (1024 * 1024);
            }
          }
        }
      }
    };

    try {
      await recorrer(basePath);
    } catch (err) {
      return '⚠️ No se pudo calcular los documentos externos subidos.';
    }

    if (totalArchivos === 0) {
      return '📁 No se subieron documentos externos hoy.';
    }

    return `📎 Externos: ${totalArchivos} archivos — ${totalMB.toFixed(2)} MB usados`;
  }

  private async getArchivoPdfCreadoMasAntiguo(): Promise<{ nombre: string; fullPath: string; fecha: Date } | null> {
    const basePath = path.resolve('expedientes-medicos');
    const tiposValidos = [
      'Antidoping',
      'Aptitud',
      'Certificado',
      'Examen Vista',
      'Historia Clinica',
      'Exploracion Fisica',
      'Nota Medica',
    ];

    let masAntiguo: { nombre: string; fullPath: string; fecha: Date } | null = null;

    const recorrer = async (dir: string) => {
      const elementos = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const el of elementos) {
        const fullPath = path.join(dir, el.name);

        if (el.isDirectory()) {
          await recorrer(fullPath);
        } else if (
          el.isFile() &&
          el.name.endsWith('.pdf') &&
          tiposValidos.some(tipo => el.name.toLowerCase().includes(tipo.toLowerCase()))
        ) {
          const stat = await fs.promises.stat(fullPath);
          const fecha = stat.mtime;

          if (!masAntiguo || fecha < masAntiguo.fecha) {
            masAntiguo = {
              nombre: el.name,
              fullPath,
              fecha,
            };
          }
        }
      }
    };

    await recorrer(basePath);
    return masAntiguo;
  }

  private async getDocumentoExternoSubidoMasAntiguo(): Promise<{ nombre: string; fullPath: string; fecha: Date } | null> {
    const basePath = path.resolve('expedientes-medicos');
    const tiposInternos = [
      'Antidoping',
      'Aptitud',
      'Certificado',
      'Examen Vista',
      'Historia Clinica',
      'Exploracion Fisica',
      'Nota Medica',
    ];
    const extensionesValidas = ['.pdf', '.jpg', '.jpeg', '.png'];

    let masAntiguo: { nombre: string; fullPath: string; fecha: Date } | null = null;

    const recorrer = async (dir: string) => {
      const elementos = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const el of elementos) {
        const fullPath = path.join(dir, el.name);

        if (el.isDirectory()) {
          await recorrer(fullPath);
        } else if (el.isFile()) {
          const ext = path.extname(el.name).toLowerCase();
          const esExtensionValida = extensionesValidas.includes(ext);
          const esGeneradoInternamente = tiposInternos.some(tipo => el.name.toLowerCase().includes(tipo.toLowerCase()));

          if (esExtensionValida && !esGeneradoInternamente) {
            const stat = await fs.promises.stat(fullPath);
            const fecha = stat.mtime;

            if (!masAntiguo || fecha < masAntiguo.fecha) {
              masAntiguo = {
                nombre: el.name,
                fullPath,
                fecha,
              };
            }
          }
        }
      }
    };

    await recorrer(basePath);
    return masAntiguo;
  }

  private formatearFechaHoy(): string {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  private async getDeletedPdfsLog(): Promise<string> {
    const logPath = path.resolve('logs', `eliminados-${this.formatearFechaHoy()}.log`);

    if (!fs.existsSync(logPath)) {
      return '📁 No se eliminaron archivos PDF hoy.';
    }

    const contenido = await fs.promises.readFile(logPath, 'utf8');

    const lineasConSangria = contenido
      .split('\n')
      .map((linea, i) => {
        if (i === 0) return linea; // ya tiene sangría
        return `    ${linea}`;
      })
      .join('\n');

    return lineasConSangria;
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
    
    const recommendations: string[] = [];
    
    if (cpuUsage > 80) {
      recommendations.push("🔴 El uso de CPU de Node.js es alto. Considera revisar qué procesos están activos.");
    }
    if (memoryUsagePercentage > 90) {
      recommendations.push("🔴 El uso de memoria está por encima del 90%. Puede ser momento de considerar más RAM o revisar fugas de memoria.");
    }
    if (diskStats.includes(' 95%') || diskStats.includes(' 100%')) {
      recommendations.push("🔴 Espacio en disco muy bajo. Considera liberar espacio o ampliar el almacenamiento.");
    }

    const createdPdfsSummary = await this.getCreatedPdfsSummary();
    const archivoPdfCreadoMasAntiguo = await this.getArchivoPdfCreadoMasAntiguo();

    const uploadedDocsSummary = await this.getUploadedExternalDocsSummary();
    const documentoExternoSubidoMasAntiguo = await this.getDocumentoExternoSubidoMasAntiguo();

    const deletedPdfsLog = await this.getDeletedPdfsLog();

    // 📌 Reporte Formateado
    let reportContent = `
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
  
    🚨 𝗔𝗟𝗘𝗥𝗧𝗔𝗦 𝗬 𝗥𝗘𝗖𝗢𝗠𝗘𝗡𝗗𝗔𝗖𝗜𝗢𝗡𝗘𝗦
    ═════════════════════════════
    ${alertMessages}

    📁 𝗣𝗗𝗙s 𝗖𝗥𝗘𝗔𝗗𝗢𝗦 𝗬 𝗗𝗢𝗖𝗨𝗠𝗘𝗡𝗧𝗢𝗦 𝗘𝗫𝗧𝗘𝗥𝗡𝗢𝗦 𝗦𝗨𝗕𝗜𝗗𝗢𝗦 (HOY)
    ─────────────────────────────
    ${createdPdfsSummary}
    ${uploadedDocsSummary}

    🗑️ 𝗟𝗜𝗠𝗣𝗜𝗘𝗭𝗔 𝗔𝗨𝗧𝗢𝗠𝗔́𝗧𝗜𝗖𝗔 𝗗𝗘 𝗣𝗗𝗙s (2 MESES)
    ─────────────────────────────
    ${deletedPdfsLog}

    📄 𝗔𝗥𝗖𝗛𝗜𝗩𝗢𝗦 𝗠𝗔́𝗦 𝗔𝗡𝗧𝗜𝗚𝗨𝗢𝗦
    ─────────────────────────────
    ${archivoPdfCreadoMasAntiguo
      ? `📘 PDF creado más antiguo: ${archivoPdfCreadoMasAntiguo.nombre} — ${archivoPdfCreadoMasAntiguo.fecha.toLocaleDateString('es-MX')}`
      : '📘 PDF creado más antiguo: No encontrado'}
    ${documentoExternoSubidoMasAntiguo
      ? `📗 Documento externo más antiguo: ${documentoExternoSubidoMasAntiguo.nombre} — ${documentoExternoSubidoMasAntiguo.fecha.toLocaleDateString('es-MX')}`
      : '📗 Documento externo más antiguo: No encontrado'}
    `;

    if (recommendations.length > 0) {
      reportContent += `\n${recommendations.join('\n')}`;
    }    
  
    // Guardar historial del reporte sin duplicaciones
    await this.saveUsageHistory(cpuUsage, memoryUsagePercentage);
  
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
    await this.checkAndSendAlertIfCritical(); // <- agregar esta línea
  }

  // 🔹 Ejecutar el reporte automáticamente cada día a las 19:00 AM
  @Cron('0 19 * * *')
  async handleCron() {
    console.log(`⏳ Enviando reporte diario a las ${new Date().toLocaleString()} (hora local)`);
    await this.sendServerReport();
  }

}
