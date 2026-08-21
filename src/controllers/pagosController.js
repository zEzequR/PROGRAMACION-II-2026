import Pagos from '../models/pagos.js'
import { crearPagoService, actualizarPagoService } from '../services/pagosService.js'
import {Payment} from 'mercadopago'
import mpClient from '../config/mercadopago.js'
import { procesarPagoBrickService, crearPreferenciaService } from '../services/api/mercadoPagoService.js'
import { cerrarVentaService, cancelarVentaService } from '../services/ventasService.js'


export async function crearPago(req, res)
{
    try
    {
        const { idTransaccion, estado, metodoPago, monto } = req.body;

        const pago = new Pagos(idTransaccion, estado, metodoPago, monto);

        const idPago = await crearPagoService(pago);

        return res.status(201).json({mensaje: "Pago creado correctamente"});
    }
    catch(err)
    {
        return res.status(500).json({mensaje: `No se pudo crear el pago: ${err.message}`});
    }
}



export async function actualizarPago(req, res)
{
    try
    {
        const { idDetPago, idTransaccion, estado } = req.body;

        const pago = new Pagos(idTransaccion, estado);
        pago.idDetPago = idDetPago;

        await actualizarPagoService(pago);

        return res.status(200).json({ mensaje: "Pago actualizado correctamente" });
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudo actualizar el pago: ${err.message}` });
    }
}


export async function webhookMercadoPago(req, res)
{
    try
    {
        const type = req.query.type || req.body?.type;
        const dataId = req.query['data.id'] || req.body?.data?.id;

        if (type === "payment" && dataId)
        {
            const payment = new Payment(mpClient);
            const info = await payment.get({ id: dataId });

            const pago = new Pagos(Number(info.id), info.status, info.payment_method_id, Number(info.transaction_amount));
            const idPago = await crearPagoService(pago);

            const idVenta = info.external_reference;

            if (info.status === 'approved')
            {
                await cerrarVentaService(idVenta, idPago);
            }
            else if (info.status === 'rejected')
            {
                await cancelarVentaService(idVenta);
            }
        }

        return res.status(200).send("ok");
    }
    catch(err)
    {
        console.error(err);
        return res.status(200).send("ok");
    }
}


export async function procesarPagoBrick(req, res)
{
    try
    {
        const { idVenta, descripcion, monto, ...formData } = req.body;

        const resultado = await procesarPagoBrickService(formData, { idVenta, descripcion, monto });


        return res.status(201).json(
        {
            status: resultado.status,
            status_detail: resultado.status_detail,
            id_pago: resultado.id
        });
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudo procesar el pago: ${err.message}` });
    }
}

export async function crearPreferencia(req, res)
{
    try
    {
        const { idVenta, nombreProd, precioFinal } = req.body;

        const pref = await crearPreferenciaService({ idVenta, nombreProd, precioFinal });

        return res.status(201).json(
        {
            preferenceId: pref.id,
            init_point: pref.init_point,
            sandbox_init_point: pref.sandbox_init_point
        });
    }
    catch(err)
    {
        return res.status(500).json({ mensaje: `No se pudo crear la preferencia: ${err.message}` });
    }
}