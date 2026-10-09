import logging
import os
import smtplib
import ssl
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app

logger = logging.getLogger("ganaderapp.mailer")

ROL_LABELS = {
    "admin": "Administrador",
    "encargado_general": "Encargado General",
    "encargado_rancho": "Encargado de Rancho",
    "encargado_area": "Encargado de Área",
}


def get_mail_config():
    """Obtiene la configuración de correo desde Flask current_app o variables de entorno."""
    if current_app:
        cfg = current_app.config
        server = cfg.get("MAIL_SERVER", "smtp.gmail.com")
        port = int(cfg.get("MAIL_PORT", 587))
        use_tls = bool(cfg.get("MAIL_USE_TLS", True))
        use_ssl = bool(cfg.get("MAIL_USE_SSL", False))
        username = (cfg.get("MAIL_USERNAME") or os.environ.get("GMAIL_USER") or "").strip()
        password = (cfg.get("MAIL_PASSWORD") or os.environ.get("GMAIL_APP_PASSWORD") or "").strip()
        sender = (cfg.get("MAIL_DEFAULT_SENDER") or "").strip()
        app_url = cfg.get("APP_URL", "http://localhost:5173")
    else:
        server = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
        port = int(os.environ.get("MAIL_PORT", "587"))
        use_tls = os.environ.get("MAIL_USE_TLS", "1").lower() not in ("0", "false", "no")
        use_ssl = os.environ.get("MAIL_USE_SSL", "0").lower() in ("1", "true", "yes")
        username = (os.environ.get("MAIL_USERNAME") or os.environ.get("GMAIL_USER") or "").strip()
        password = (os.environ.get("MAIL_PASSWORD") or os.environ.get("GMAIL_APP_PASSWORD") or "").strip()
        sender = os.environ.get("MAIL_DEFAULT_SENDER", "").strip()
        app_url = os.environ.get("APP_URL", "http://localhost:5173")

    if not sender:
        sender = f"GanaderAPP <{username}>" if username else "GanaderAPP <notificaciones@ganaderapp.com>"

    return {
        "server": server,
        "port": port,
        "use_tls": use_tls,
        "use_ssl": use_ssl,
        "username": username,
        "password": password,
        "sender": sender,
        "app_url": app_url,
    }


def send_credentials_email(
    to_email: str,
    username: str,
    password: str,
    full_name: str = "",
    rol: str = "encargado_area",
    area: str = None,
    app_url: str = None,
) -> tuple[bool, str]:
    """Envía un correo con usuario y contraseña por Gmail SMTP al dar de alta un usuario.

    Retorna (True, 'Mensaje de éxito') si se envió, o (False, 'Causa de error') si falló.
    """
    config = get_mail_config()
    server_host = config["server"]
    server_port = config["port"]
    use_tls = config["use_tls"]
    use_ssl = config["use_ssl"]
    mail_username = config["username"]
    mail_password = config["password"]
    mail_sender = config["sender"]
    target_url = app_url or config["app_url"]

    # Validar configuración mínima de Gmail
    if not mail_username or not mail_password:
        msg = (
            "No se han configurado MAIL_USERNAME o MAIL_PASSWORD (contraseña de aplicación de Gmail) "
            "en las variables de entorno o archivo .env. El usuario fue registrado pero no se envió el correo."
        )
        logger.warning(f"[Mailer] {msg}")
        return False, msg

    nombre_display = full_name.strip() or username
    rol_display = ROL_LABELS.get(rol, rol)
    area_display = f" ({area})" if area else ""

    subject = "🐮 Tus credenciales de acceso a GanaderAPP"

    # Cuerpo en texto plano
    text_content = f"""Hola {nombre_display},

Te damos la bienvenida al sistema de gestión GanaderAPP.
Se ha dado de alta tu cuenta con las siguientes credenciales para iniciar sesión:

---------------------------------------------------------
• Usuario:       {username}
• Correo:        {to_email}
• Contraseña:    {password}
• Rol:           {rol_display}{area_display}
---------------------------------------------------------

Puedes ingresar al sistema en el siguiente enlace:
{target_url}

Recomendación de seguridad:
Te sugerimos cambiar tu contraseña temporal después de tu primer inicio de sesión.

Atentamente,
Equipo de Administración de GanaderAPP
"""

    # Plantilla HTML con diseño moderno y colores de GanaderAPP
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credenciales de acceso GanaderAPP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f3eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c2110;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f6f3eb; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Tarjeta Principal -->
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e5dcce; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);" cellspacing="0" cellpadding="0">
          
          <!-- Encabezado con color corporativo GanaderAPP -->
          <tr>
            <td style="background-color: #2e4829; padding: 28px 32px; text-align: left;">
              <div style="display: inline-block; vertical-align: middle;">
                <span style="font-size: 26px; line-height: 1;">🐮</span>
              </div>
              <div style="display: inline-block; vertical-align: middle; margin-left: 10px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">GanaderAPP</h1>
                <p style="margin: 2px 0 0 0; color: #c9dbb8; font-size: 13px;">Sistema Integral de Gestión Ganadera</p>
              </div>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 14px 0; color: #1c2110; font-size: 20px; font-weight: 700;">
                ¡Bienvenido/a, {nombre_display}!
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #5a554a;">
                Se ha generado tu cuenta para acceder a la plataforma <strong>GanaderAPP</strong>. A continuación encontrarás tus credenciales personales para iniciar sesión:
              </p>

              <!-- Caja de Credenciales -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf7f2; border: 1px solid #e5dcce; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 22px;">
                    
                    <!-- Usuario -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                      <tr>
                        <td width="35%" style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #7a7065; letter-spacing: 0.5px;">Usuario:</td>
                        <td width="65%" style="font-size: 15px; font-weight: 600; color: #1c2110; font-family: monospace;">{username}</td>
                      </tr>
                    </table>

                    <!-- Correo -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                      <tr>
                        <td width="35%" style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #7a7065; letter-spacing: 0.5px;">Correo:</td>
                        <td width="65%" style="font-size: 14px; font-weight: 600; color: #1c2110;">{to_email}</td>
                      </tr>
                    </table>

                    <!-- Contraseña -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                      <tr>
                        <td width="35%" style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #7a7065; letter-spacing: 0.5px;">Contraseña:</td>
                        <td width="65%">
                          <span style="display: inline-block; background-color: #ffffff; border: 1px solid #d5cbbe; border-radius: 6px; padding: 4px 10px; font-size: 15px; font-weight: 700; color: #2e4829; font-family: monospace; letter-spacing: 1px;">
                            {password}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Rol -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="35%" style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #7a7065; letter-spacing: 0.5px;">Rol / Área:</td>
                        <td width="65%" style="font-size: 13px; font-weight: 600; color: #435b37;">
                          {rol_display}{area_display}
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Botón Iniciar Sesión -->
              <div style="text-align: center; margin-bottom: 26px;">
                <a href="{target_url}" target="_blank" style="display: inline-block; background-color: #2e4829; color: #ffffff; text-decoration: none; padding: 13px 30px; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(46,72,41,0.25);">
                  Iniciar Sesión en GanaderAPP →
                </a>
              </div>

              <!-- Nota de Seguridad -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff9ea; border-left: 4px solid #d4a34b; border-radius: 4px; padding: 12px 14px; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.5; color: #7a5c1b;">
                    <strong>Consejo de seguridad:</strong> Te recomendamos cambiar tu contraseña una vez que ingreses al sistema para mantener tu cuenta segura.
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #8a8277; line-height: 1.5;">
                Si tienes dudas o necesitas asistencia para acceder, comunícate con el administrador general de tu rancho.
              </p>
            </td>
          </tr>

          <!-- Pie de página -->
          <tr>
            <td style="background-color: #faf7f2; border-top: 1px solid #eee7dc; padding: 18px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9a8f82;">
                Este es un mensaje generado automáticamente por GanaderAPP. Por favor, no respondas a este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = Header(subject, "utf-8")
        msg["From"] = mail_sender
        msg["To"] = to_email

        # Adjuntar versiones texto y html
        part1 = MIMEText(text_content, "plain", "utf-8")
        part2 = MIMEText(html_content, "html", "utf-8")
        msg.attach(part1)
        msg.attach(part2)

        logger.info(f"[Mailer] Conectando a {server_host}:{server_port} con Gmail usuario {mail_username}...")

        if use_ssl:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(server_host, server_port, context=context, timeout=15) as server:
                server.login(mail_username, mail_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(server_host, server_port, timeout=15) as server:
                if use_tls:
                    context = ssl.create_default_context()
                    server.starttls(context=context)
                server.login(mail_username, mail_password)
                server.send_message(msg)

        logger.info(f"[Mailer] Credenciales enviadas exitosamente a {to_email}")
        return True, "Correo con credenciales enviado exitosamente por Gmail"

    except smtplib.SMTPAuthenticationError as auth_err:
        err_msg = (
            "Error de autenticación con Gmail. Verifica que MAIL_USERNAME sea tu dirección @gmail.com "
            "y que MAIL_PASSWORD sea una 'Contraseña de Aplicación' de 16 caracteres generada en tu cuenta de Google."
        )
        logger.error(f"[Mailer] {err_msg} Detalle: {auth_err}")
        return False, err_msg
    except smtplib.SMTPConnectError as conn_err:
        err_msg = f"No se pudo conectar al servidor SMTP de Gmail ({server_host}:{server_port}). Detalle: {conn_err}"
        logger.error(f"[Mailer] {err_msg}")
        return False, err_msg
    except Exception as e:
        err_msg = f"Error al enviar correo por Gmail: {str(e)}"
        logger.error(f"[Mailer] {err_msg}")
        return False, err_msg
