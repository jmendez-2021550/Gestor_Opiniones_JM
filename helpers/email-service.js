import nodemailer from 'nodemailer';
import { config } from '../configs/config.js';

// Configurar el transportador de email (aligned with .NET SmtpSettings)
const createTransporter = () => {
  if (!config.smtp.username || !config.smtp.password) {
    console.warn(
      'SMTP credentials not configured. Email functionality will not work.'
    );
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.enableSsl, // true para 465, false para 587
    auth: {
      user: config.smtp.username,
      pass: config.smtp.password,
    },
    // Evitar que las peticiones HTTP queden colgadas si SMTP no responde
    connectionTimeout: 10_000, // 10s
    greetingTimeout: 10_000, // 10s
    socketTimeout: 10_000, // 10s
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const transporter = createTransporter();

export const sendVerificationEmail = async (email, name, verificationToken) => {
  if (!transporter) {
    throw new Error('SMTP transporter not configured');
  }

  try {
    const frontendUrl = config.app.frontendUrl || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: email,
      subject: '¡Bienvenido a Gestor de Opiniones!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 10px;">¡Bienvenido ${name}!</h1>
            <p style="color: #666; text-align: center; font-size: 14px; margin-bottom: 30px;">A <strong style="color: #007bff;">Gestor de Opiniones</strong></p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Gracias por unirte a nuestra comunidad. Estamos emocionados de tenerte aquí. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el botón de abajo:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href='${verificationUrl}' style='background-color: #007bff; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Verificar Correo</a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 20px 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="color: #007bff; font-size: 11px; text-align: center; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #555; margin-bottom: 15px;">
              <strong>¿Qué puedes hacer en Gestor de Opiniones?</strong>
            </p>
            <ul style="color: #666; line-height: 1.8;">
              <li>💭 Opina sobre las frases más impactantes que has escuchado</li>
              <li>💡 Sube tus ideas y comparte tu perspectiva única</li>
              <li>❤️ Agrega publicaciones a favoritos</li>
              <li>👍 Interactúa con otros usuarios a través de likes y comentarios</li>
              <li>🏷️ Organiza opiniones por categorías</li>
            </ul>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Este enlace de verificación expirará en 24 horas.
            </p>
            
            <p style="color: #999; font-size: 12px;">
              Si no creaste esta cuenta, ignora este correo electrónico.
            </p>
          </div>
          
          <p style="color: #999; font-size: 11px; text-align: center; margin-top: 20px;">
            © 2026 Gestor de Opiniones. Todos los derechos reservados.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  if (!transporter) {
    throw new Error('SMTP transporter not configured');
  }

  try {
    const frontendUrl = config.app.frontendUrl || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Reset your password', // Aligned with .NET
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href='${resetUrl}' style='background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
            Reset Password
        </a>
        <p>If you cannot click the link, copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  if (!transporter) {
    throw new Error('SMTP transporter not configured');
  }

  try {
    const mailOptions = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Welcome to AuthDotnet!', // Aligned with .NET
      html: `
        <h2>Welcome to AuthDotnet, ${name}!</h2>
        <p>Your account has been successfully verified and activated.</p>
        <p>You can now enjoy all the features of our platform.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Thank you for joining us!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendPasswordChangedEmail = async (email, name) => {
  if (!transporter) {
    throw new Error('SMTP transporter not configured');
  }

  try {
    const mailOptions = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Password Changed Successfully', // More aligned with .NET style
      html: `
        <h2>Password Changed</h2>
        <p>Hello ${name},</p>
        <p>Your password has been successfully updated.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>This is an automated email, please do not reply to this message.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password changed email:', error);
    throw error;
  }
};
