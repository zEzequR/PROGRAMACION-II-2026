import Pagos from '../models/pagos.js'
import { crearPagoService, actualizarPagoService } from '../services/pagosService.js'

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
        const
        {
            idTransaccion,
            estado
        } = req.body

        const pago = new Pagos(idTransaccion, estado);

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