import * as React from 'react';
import { render } from 'react-email';
import { enviarPromocionTiendaService } from '../services/emailService.js';
import { buscarUsuarioPorEmail } from '../services/usuarioService.js';
import { generarCodigo } from '../utils/generarCodigo.js';
import { enviarCorreoIndividual } from '../services/api/resendService.js';
import { CodigoRecuperacion } from '../emails/CodigoRecuperacion.js';
import { Promocion } from '../emails/Promocion.js';
import { Correo } from '../models/correo.js';

export async function enviarPromocion(req, res) {
    try
    {
        const [correo] = req.models;
        correo.idTienda = req.user.id_tienda;

        const elementoCorreo = React.createElement(Promocion, { asunto: correo.subject, contenido: correo.html });
        correo.html = await render(elementoCorreo);
        correo.text = await render(elementoCorreo, { plainText: true });

        const resultado = await enviarPromocionTiendaService(correo);

        return res.status(200).json({
            mensaje: "Promoción enviada correctamente",
            resultado
        });
    }
    catch (err)
    {
        if (err.message === "La tienda no posee clientes suscriptos para recibir promociones.")
        {
            return res.status(409).json({ mensaje: err.message });
        }

        return res.status(500).json({
            mensaje: `No se pudo enviar la promoción: ${err.message}`
        });
    }
}

export async function solicitarCodigo(req, res) {
    try {
        const [usuario] = req.models;

        const usuarioEncontrado = await buscarUsuarioPorEmail(usuario);

        if (!usuarioEncontrado)
        {
            return res.status(200).end();
        }

        const codigo = generarCodigo(usuario);

        const elementoCorreo = React.createElement(CodigoRecuperacion, { codigo: codigo });
        const html = await render(elementoCorreo);
        const text = await render(elementoCorreo, { plainText: true });

        const correo = new Correo({
            to: usuario.email,
            subject: "Código para recuperar tu contraseña",
            html: html,
            text: text
        });

        await enviarCorreoIndividual(correo);
        return res.status(200).end();
    } catch (err) {
        console.error(err);
        return res.status(200).end();
    }
}