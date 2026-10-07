import jwt from 'jsonwebtoken'
import Pagos from '../models/pagos.js'
import { Emprendedor } from '../models/usuario.js'
import { Ventas } from '../models/ventas.js'
import { crearPagoService } from '../services/pagosService.js'
import { finalizarVentaService, obtenerVentaParaPagarService } from '../services/ventasService.js'
import { obtenerEmprendedorPorMpUserId, modificarEmprendedorService } from '../services/emprendedorService.js'
import { validarDireccion } from '../services/api/googleMapsService.js'
import { generarToken } from '../utils/generarToken.js'
import { MP_QR_CLIENT_ID, MP_WEBHOOK_SECRET, MP_QR_WEBHOOK_SECRET, MP_CONEXION_RETORNO_URL } from '../config/mercadopago.js'
import
{
    obtenerUrlConexion,
    intercambiarCodigoService,
    obtenerAccessTokenVigente,
    obtenerUrlConexionQr,
    intercambiarCodigoQrService,
    obtenerAccessTokenQrVigente,
    crearOrdenService,
    crearSucursalYCajaService,
    validarFirmaWebhook,
    consultarOrdenService
} from '../services/api/mercadoPagoService.js'

// ============================================================
// CONEXIÓN OAUTH — TARJETA
// Rutas: GET /mercadopago/conectar (protegida, solo EMPRENDEDOR)
//        GET /mercadopago/callback (pública, la llama Mercado Pago)
// ============================================================

// El frontend (conectar-mp.html) llama a esto con el JWT del emprendedor
// logueado. Devuelve la URL de Mercado Pago a la que hay que redirigirlo
// para que autorice la conexión (no hace el redirect, solo arma la URL).
export async function conectarMercadoPago(req, res)
{
    try
    {
        // Guardamos quién inició esto en un "state" firmado por nosotros, para
        // saber a qué persona corresponde cuando Mercado Pago nos avise del lado del callback.
        const state = generarToken({ idPersona: req.user.idPersona });
        const url = obtenerUrlConexion(state);

        return res.status(200).json({ url });
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudo iniciar la conexión con Mercado Pago: ${err.message}` });
    }
}

// Mercado Pago redirige acá después de que el emprendedor autoriza (o cancela).
// Trae ?code=...&state=... por query string. Si todo sale bien, guarda el
// access_token/refresh_token del emprendedor en la base y lo manda de vuelta a feedtrucho.html.
export async function callbackMercadoPago(req, res)
{
    try
    {
        const { code, state } = req.query;

        if (!code || !state)
        {
            return res.redirect(`${MP_CONEXION_RETORNO_URL}?mpError=cancelado`);
        }

        // Recuperamos quién había iniciado la conexión (ver conectarMercadoPago).
        let decoded;
        try
        {
            decoded = jwt.verify(state, process.env.JWT_SECRET);
        }
        catch(errState)
        {
            return res.redirect(`${MP_CONEXION_RETORNO_URL}?mpError=vencido`);
        }

        const resultado = await intercambiarCodigoService(code);

        const emprendedor = new Emprendedor({
            idPersona: decoded.idPersona,
            mpAccessToken: resultado.access_token,
            mpRefreshToken: resultado.refresh_token,
            mpUserId: String(resultado.user_id),
            mpPublicKey: resultado.public_key,
            mpTokenExpiresAt: new Date(Date.now() + (resultado.expires_in || 15552000) * 1000)
        });

        await modificarEmprendedorService(emprendedor);

        return res.redirect(MP_CONEXION_RETORNO_URL);
    }
    catch(err)
    {
        console.error(err);
        return res.redirect(`${MP_CONEXION_RETORNO_URL}?mpError=fallo`);
    }
}

// ============================================================
// CONEXIÓN OAUTH — QR
// Rutas: GET /mercadopago/conectar-qr (protegida, solo EMPRENDEDOR)
//        GET /mercadopago/callback-qr (pública, la llama Mercado Pago)
// ============================================================

// Igual que conectarMercadoPago, pero además necesita la dirección real del
// local (viene por query string desde conectar-mp.html) para poder crear la
// sucursal más adelante. La geocodificamos acá mismo con Google Maps y la
// guardamos adentro del "state" junto con el idPersona, así el callback la tiene
// disponible sin tener que volver a pedirla.
export async function conectarMercadoPagoQr(req, res)
{
    try
    {
        const [ubicacion] = req.models;
        ubicacion.pais = "Argentina";

        const resultadoDireccion = await validarDireccion(ubicacion);

        if (!resultadoDireccion.esValida)
        {
            return res.status(400).json({ mensaje: "La dirección ingresada no es válida", motivo: resultadoDireccion.motivo });
        }

        const state = generarToken({ idPersona: req.user.idPersona, direccion: resultadoDireccion.datosUbicacion });
        const url = obtenerUrlConexionQr(state);

        return res.status(200).json({ url });
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudo iniciar la conexión QR con Mercado Pago: ${err.message}` });
    }
}

// Callback de la conexión QR. Además de guardar el token (como el de tarjeta),
// esta vez también crea la sucursal y la caja del emprendedor en el mismo paso
// (usando la dirección que viajó adentro del "state"), porque sin eso no se
// puede generar ningún QR después.
export async function callbackMercadoPagoQr(req, res)
{
    try
    {
        const { code, state } = req.query;

        if (!code || !state)
        {
            return res.redirect(`${MP_CONEXION_RETORNO_URL}?mpError=cancelado`);
        }

        let decoded;
        try
        {
            decoded = jwt.verify(state, process.env.JWT_SECRET);
        }
        catch(errState)
        {
            return res.redirect(`${MP_CONEXION_RETORNO_URL}?mpError=vencido`);
        }

        const resultado = await intercambiarCodigoQrService(code);

        // Guardamos el token primero, por si falla la creación de la sucursal/caja
        // más abajo no se pierde la conexión ya lograda.
        const emprendedorConToken = new Emprendedor({
            idPersona: decoded.idPersona,
            mpQrAccessToken: resultado.access_token,
            mpQrRefreshToken: resultado.refresh_token,
            mpQrUserId: String(resultado.user_id),
            mpQrTokenExpiresAt: new Date(Date.now() + (resultado.expires_in || 15552000) * 1000)
        });

        await modificarEmprendedorService(emprendedorConToken);

        const { storeId, posExternalId } = await crearSucursalYCajaService(
            resultado.access_token,
            resultado.user_id,
            decoded.direccion
        );

        const emprendedorConCaja = new Emprendedor({
            idPersona: decoded.idPersona,
            mpQrStoreId: storeId,
            mpQrPosId: posExternalId
        });

        await modificarEmprendedorService(emprendedorConCaja);

        return res.redirect(`${MP_CONEXION_RETORNO_URL}?mpQrConectado=true`);
    }
    catch(err)
    {
        console.error(err);
        return res.redirect(`${MP_CONEXION_RETORNO_URL}?mpError=fallo`);
    }
}

// ============================================================
// WEBHOOK
// Ruta: POST /pagos/webhook (pública, la llama Mercado Pago cada
// vez que cambia el estado de una orden, de cualquiera de las dos apps).
// ============================================================

export async function webhookMercadoPago(req, res)
{
    try
    {
        // El body trae application_id: con eso sabemos si la notificación es de
        // la app de tarjeta o la de QR, y entonces qué secreto usar para la firma.
        const esNotificacionQr = String(req.body?.application_id) === MP_QR_CLIENT_ID;
        let secretFirma = MP_WEBHOOK_SECRET;

        if (esNotificacionQr)
        {
            secretFirma = MP_QR_WEBHOOK_SECRET;
        }

        const resultadoFirma = validarFirmaWebhook(
            req.headers['x-signature'],
            req.headers['x-request-id'],
            req.query['data.id'],
            secretFirma
        );

        if (!resultadoFirma.valida)
        {
            // No es un aviso real de Mercado Pago (o el secreto está mal) — lo rechazamos.
            console.error('[WEBHOOK FIRMA INVALIDA] razon:', resultadoFirma.razon);
            console.error('[WEBHOOK FIRMA INVALIDA] x-signature:', req.headers['x-signature']);
            console.error('[WEBHOOK FIRMA INVALIDA] x-request-id:', req.headers['x-request-id']);
            console.error('[WEBHOOK FIRMA INVALIDA] data.id:', req.query['data.id']);
            console.error('[WEBHOOK FIRMA INVALIDA] es QR:', esNotificacionQr);
            console.error('[WEBHOOK FIRMA INVALIDA] secret usado (primeros 7):', (secretFirma || '').slice(0, 7));
            return res.status(401).json({ mensaje: "Firma inválida" });
        }

        const type = req.query.type || req.body?.type;
        const dataId = req.query['data.id'] || req.body?.data?.id; // id de la Order en Mercado Pago
        const mpUserId = req.body?.user_id ? String(req.body.user_id) : null; // cuenta MP del vendedor

        if (type === "order" && dataId && mpUserId)
        {
            // user_id identifica al VENDEDOR (no cambia según la app), así
            // encontramos a qué emprendedor nuestro corresponde esta notificación.
            const emprendedor = await obtenerEmprendedorPorMpUserId(new Emprendedor({ mpUserId: mpUserId }));

            if (!emprendedor)
            {
                console.error('[WEBHOOK] No se encontró ningún emprendedor conectado con mp_user_id:', mpUserId);
                return res.status(200).end();
            }

            let accessToken;

            if (esNotificacionQr)
            {
                accessToken = await obtenerAccessTokenQrVigente(emprendedor);
            }
            else
            {
                accessToken = await obtenerAccessTokenVigente(emprendedor);
            }

            // La notificación solo trae el id — hay que pedirle a Mercado Pago el resto (status, monto, etc.).
            const info = await consultarOrdenService(accessToken, dataId);

            // Guardamos el pago en nuestra base (tablas Detalles_Pago/Pagos).
            const pago = new Pagos({
                idTransaccion: String(info.id),
                estado: info.status,
                metodoPago: info.transactions?.payments?.[0]?.payment_method?.type,
                monto: Number(info.total_amount)
            });
            const idPago = await crearPagoService(pago);
            const idVenta = info.external_reference; // nosotros mismos lo pusimos al crear la Order

            if (info.status === 'processed')
            {
                // Pago aprobado: cerramos la venta y queda guardado qué pago la cerró.
                await finalizarVentaService(new Ventas({ idVenta: Number(idVenta), idPago: idPago }));
            }
        }

        // Mercado Pago reintenta si no respondemos 200, así que SIEMPRE devolvemos
        // 200 acá (incluso en el catch de abajo) aunque algo haya fallado del lado nuestro.
        return res.status(200).end();
    }
    catch(err)
    {
        console.error(err);
        return res.status(200).end();
    }
}

// ============================================================
// CREAR PAGOS — lo que llama el checkout al tocar "Pagar"
// Ruta: POST /pagos/procesar-pago  (body.metodo: 'TARJETA' o 'QR')
// ============================================================

// Crea la Order en Mercado Pago para pagar una venta, con tarjeta (token del
// Card Payment Brick) o con QR. Cobra con el token del emprendedor dueño de la
// tienda, no con el nuestro, y por el monto de la venta: el que mande el navegador se ignora.
export async function crearOrden(req, res)
{
    try
    {
        const [venta, usuario] = req.models;
        const metodo = req.body.metodo;

        const [infoVenta, emprendedor] = await obtenerVentaParaPagarService(venta, usuario, metodo);

        const datosVenta = {
            idVenta: venta.idVenta,
            descripcion: req.body.descripcion,
            monto: infoVenta.precioFinal
        };

        // Con tarjeta, req.body trae lo que armó el Card Payment Brick (token, cuotas, etc.)
        const resultado = await crearOrdenService(datosVenta, emprendedor, metodo, req.body);

        const respuesta = {
            status: resultado.status,
            status_detail: resultado.status_detail,
            id_pago: resultado.id
        };

        // Con QR, el front necesita este texto para dibujar el código
        if (metodo === 'QR')
        {
            respuesta.qrData = resultado.type_response?.qr_data;
        }

        return res.status(201).json(respuesta);
    }
    catch(err)
    {
        switch (err.message)
        {
            case "Venta no encontrada":
                return res.status(404).json({ mensaje: err.message });

            case "Esta venta ya no se puede pagar":
            case "Esta tienda todavía no conectó su cuenta de Mercado Pago":
            case "Esta tienda todavía no conectó el cobro por QR":
                return res.status(409).json({ mensaje: err.message });
            case "Los datos del pago no son válidos":
                return res.status(400).json({ mensaje: err.message });
            default:
                return res.status(500).json({ mensaje: `No se pudo crear la orden de pago: ${err.message}` });
        }
    }
}
