import Pagos from '../models/pagos.js'
import { crearPagoService, actualizarPagoService } from '../services/pagosService.js'
import { crearPreferenciaService } from '../services/mercadopagoService.js'
import { Payment } from 'mercadopago'
import mpClient from '../config/mercadopago.js'

export async function crearPago(req, res)
{
    try
    {
        const
        {
            idTransaccion,
            estado,
            metodoPago,
            monto
        } = req.body

        const pago = new Pagos(idTransaccion, estado, metodoPago, monto);

        const dbRes = await crearPagoService(pago);

        if (dbRes)
        {
            return res.status(201).json(
            {
                estado: "EXITO",
                mensaje: "Pago creado correctamente"
            });
        }
        else
            {
                return res.status(500).json(
                {
                    estado: "ERROR",
                    mensaje: "No se pudo crear el pago"
                });
            }
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado: "ERROR",
            mensaje: "No se pudo crear el pago"
        });
    }
}



export async function actualizarPago(req, res)
{
    try
    {
        const { idDetPago, idTransaccion, estado } = req.body

        const pago = new Pagos(idTransaccion, estado);
        pago.idDetPago = idDetPago;

        const dbRes = await actualizarPagoService(pago);

        return res.status(200).json({ estado: "EXITO", mensaje: "Pago actualizado correctamente" });
    }
    catch(err)
    {
        return res.status(500).json({ estado: "ERROR", mensaje: "No se pudo actualizar el pago" });
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
            estado: "EXITO",
            init_point: pref.init_point,
            sandbox_init_point: pref.sandbox_init_point
        });
    }
    catch(err)
    {
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
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

            await crearPagoService(
            {
                idTransaccion: info.id,
                estado: info.status,
                metodoPago: info.payment_method_id,
                monto: info.transaction_amount
            });
        }

        return res.status(200).send("ok");
    }
    catch(err)
    {
        console.error(err);
        return res.status(200).send("ok");
    }
}