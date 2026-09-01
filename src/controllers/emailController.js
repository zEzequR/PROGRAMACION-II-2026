import { Correo } from '../models/correo.js';
import { Usuario } from '../models/usuario.js';
import { enviarPromocionTiendaService } from '../services/emailService.js';
import { obtenerIDUsuario } from '../services/usuarioService.js';
import { generarCodigo } from '../utils/generarCodigo.js';
import { enviarCorreoIndividual } from '../services/api/resendService.js';

export async function enviarPromocion(req, res) {
    try
    {
        const { subject, html, from } = req.body;

        const correo = new Correo({
            idTienda: req.user.id_tienda,
            from,
            to: "temp@placeholder.com",
            subject,
            html
        });

        const resultado = await enviarPromocionTiendaService(idTienda, correo);

        return res.status(200).json({
            estado: "EXITO",
            mensaje: "Promoción enviada correctamente",
            resultado
        });
    }
    catch (err)
    {
        return res.status(500).json({
            estado: "ERROR",
            mensaje: `No se pudo enviar la promoción: ${err.message}`
        });
    }
}

export async function solicitarCodigo(req, res) {
    const { email } = req.body;

    try {

        const usuario = new Usuario({
            email: email
        })
        await obtenerIDUsuario(usuario);

        const codigo = generarCodigo(usuario);


    await enviarCorreoIndividual({
        to: email,
        subject: "Código para recuperar tu contraseña",
        html: `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05060a;padding:40px 20px;">
            <tr><td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0d0f1a;border:1px solid rgba(255,255,255,0.14);border-radius:22px;">
                <tr><td style="padding:38px 34px;font-family:'Segoe UI',Roboto,Arial,sans-serif;">

                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                        <td style="width:26px;height:26px;border-radius:8px;background-color:#5b8cff;"></td>
                        <td style="padding-left:10px;font-size:20px;font-weight:700;color:#f5f7ff;">Localia</td>
                    </tr>
                    </table>

                    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f5f7ff;line-height:1.3;">
                    Recuperá tu contraseña
                    </p>
                    <p style="margin:0 0 28px;font-size:14px;color:#9aa3b8;line-height:1.5;">
                    Usá el siguiente código para continuar con el proceso.
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14);border-radius:14px;margin-bottom:24px;">
                    <tr>
                        <td align="center" style="padding:22px;">
                        <span style="font-size:34px;font-weight:700;letter-spacing:8px;color:#ffffff;">
                            ${codigo}
                        </span>
                        </td>
                    </tr>
                    </table>

                    <p style="margin:0 0 28px;font-size:13px;color:#9aa3b8;line-height:1.5;">
                    Este código expira en 1 minuto. Si vos no solicitaste este cambio, podés ignorar este correo.
                    </p>

                    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.14);margin:0 0 20px;" />

                    <p style="margin:0;font-size:12px;color:#6b7280;">
                    © 2026 Localia · Este es un correo automático, no lo respondas.
                    </p>

                </td></tr>
                </table>
            </td></tr>
            </table>
        `,
        text: `Tu código de recuperación es: ${codigo}. Expira en 1 minuto.`
    });

//        return res.status(200).json({
//            codigoGenerado: codigo
//        })
        return res.status(200).send("ok");
    } catch (err) {
        console.error(err);
        return res.status(200).send("ok");
    }
}