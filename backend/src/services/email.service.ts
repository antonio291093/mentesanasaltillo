import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

const SAGE      = '#7C9A7E';
const TERRACOTA = '#C4623A';

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F9F7F4;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F7F4;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:${SAGE};padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.75);">Mente Sana Saltillo</p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:normal;color:#FFFFFF;">${title}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;color:#3D3530;font-size:16px;line-height:1.7;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F3F0EC;padding:20px 40px;text-align:center;border-top:1px solid #E8E3DC;">
            <p style="margin:0;font-size:12px;color:#9E968E;line-height:1.6;">
              Mente Sana Saltillo · Saltillo, Coahuila<br>
              Si no esperabas este correo, puedes ignorarlo con seguridad.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(href: string, label: string): string {
  return `<p style="text-align:center;margin:28px 0 8px;">
    <a href="${href}" style="display:inline-block;background:${TERRACOTA};color:#FFFFFF;text-decoration:none;font-size:15px;padding:13px 32px;border-radius:8px;font-family:Arial,sans-serif;letter-spacing:0.3px;">${label}</a>
  </p>`;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
}

export async function sendWelcomeUser(to: string, nombre: string): Promise<void> {
  const body = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>¡Bienvenido a Mente Sana Saltillo! Nos alegra que estés aquí. Encontrar apoyo psicológico de calidad en tu ciudad ahora es más fácil.</p>
    <p>Explora nuestro directorio de especialistas verificados y da el primer paso hacia tu bienestar.</p>
    ${cta(`${env.FRONTEND_URL}/especialistas`, 'Ver especialistas')}
    <p style="font-size:14px;color:#9E968E;margin-top:24px;">Si tienes alguna duda, no dudes en escribirnos.</p>
  `;
  await send(to, 'Bienvenido a Mente Sana Saltillo', layout('Bienvenido', body));
}

export async function sendWelcomeProfessional(to: string, nombre: string): Promise<void> {
  const body = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Recibimos tu registro como profesional en Mente Sana Saltillo. Gracias por querer ser parte de nuestra red de especialistas en salud mental.</p>
    <p>Nuestro equipo revisará tu información en los próximos <strong>2 a 3 días hábiles</strong>. Te notificaremos por correo cuando tu perfil haya sido revisado.</p>
    <p>Mientras tanto, puedes completar o actualizar tu perfil desde tu dashboard:</p>
    ${cta(`${env.FRONTEND_URL}/dashboard`, 'Ir a mi dashboard')}
    <p style="font-size:14px;color:#9E968E;margin-top:24px;">Gracias por contribuir al bienestar de Saltillo.</p>
  `;
  await send(to, 'Recibimos tu registro profesional — Mente Sana Saltillo', layout('Registro recibido', body));
}

export async function sendProfessionalApproved(to: string, nombre: string): Promise<void> {
  const body = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>¡Excelentes noticias! Tu perfil profesional ha sido <strong style="color:${SAGE};">verificado y aprobado</strong>. A partir de ahora eres visible en el directorio de especialistas de Mente Sana Saltillo.</p>
    <p>Te invitamos a revisar tu perfil y asegurarte de que toda tu información esté completa para que las personas puedan encontrarte fácilmente.</p>
    ${cta(`${env.FRONTEND_URL}/dashboard`, 'Ver mi perfil')}
    <p style="font-size:14px;color:#9E968E;margin-top:24px;">Gracias por ser parte de nuestra comunidad.</p>
  `;
  await send(to, '¡Tu perfil fue aprobado! — Mente Sana Saltillo', layout('Perfil aprobado', body));
}

export async function sendProfessionalRejected(to: string, nombre: string, motivo: string): Promise<void> {
  const body = `
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Gracias por tu interés en formar parte de Mente Sana Saltillo. Tras revisar tu solicitud, necesitamos pedirte que realices algunos ajustes antes de que podamos aprobar tu perfil.</p>
    <p><strong>Motivo:</strong></p>
    <blockquote style="margin:16px 0;padding:12px 20px;background:#F9F7F4;border-left:3px solid ${TERRACOTA};border-radius:4px;font-size:15px;color:#5C524C;">
      ${motivo}
    </blockquote>
    <p>Puedes corregir la información desde tu perfil y volver a enviarla para revisión. Estamos aquí para apoyarte en el proceso.</p>
    ${cta(`${env.FRONTEND_URL}/dashboard/perfil`, 'Actualizar mi perfil')}
    <p style="font-size:14px;color:#9E968E;margin-top:24px;">Si tienes alguna pregunta, con gusto te ayudamos.</p>
  `;
  await send(to, 'Actualización sobre tu solicitud — Mente Sana Saltillo', layout('Revisión de perfil', body));
}
