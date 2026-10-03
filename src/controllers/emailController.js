import * as React from 'react';
import { render } from 'react-email';
import { enviarPromocionTiendaService } from '../services/emailService.js';
import { buscarUsuarioPorEmail } from '../services/usuarioService.js';
import { generarCodigo } from '../utils/generarCodigo.js';
import { enviarCorreoIndividual } from '../services/api/resendService.js';
import { CodigoRecuperacion } from '../emails/CodigoRecuperacion.js';

export async function enviarPromocion(req, res) {
    try
    {
        const [correo] = req.models;
        correo.idTienda = req.user.id_tienda;

        const resultado = await enviarPromocionTiendaService(correo);

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
    try {
        const [usuario] = req.models;

        const usuarioEncontrado = await buscarUsuarioPorEmail(usuario);

        // el mail solo sale si la cuenta existe, pero la respuesta es siempre la misma
        if (!usuarioEncontrado)
        {
            return res.status(200).send("ok");
        }

        const codigo = generarCodigo(usuario);

    const elementoCorreo = React.createElement(CodigoRecuperacion, { codigo: codigo });
    const html = await render(elementoCorreo);
    const text = await render(elementoCorreo, { plainText: true });

    await enviarCorreoIndividual({
        to: usuario.email,
        subject: "Código para recuperar tu contraseña",
        html: html,
        text: text
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