export async function realizarPago(req, res)
{
    try
    {
        const
        {
            nombreTienda,
            ultDigitosTarjeta,
            montoTotal
        } = req.body

        if (!nombreTienda || !ultDigitosTarjeta || !montoTotal)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Faltan campos obligatorios"
            })
        }

        // await fetch a Mercado Pago o Stripe

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Pago realizado con éxito",
            comprobante :
            {
                nombreTienda,
                ultDigitosTarjeta,
                monto : montoTotal,
                fechaPago : new Date()
            }
        })
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado : "ERROR",
            mensaje : err.message
        })
    }
}

export async function obtenerDetallesPago(req, res)
{
    try
    {
        const
        {
            nombreTienda,
            idPago
        } = req.query

        if (!nombreTienda || !idPago)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Faltan completar campos obligatorios"
            })
        }

        return res.status(200).json(
        {
            estado : "OK",
            mensaje : "Detalles del pago obtenidos con éxito",
            pago :
            {
                nombreTienda,
                idPago : idPago,
                monto : 4000,
                moneda : "ARS",
                estadoPago : "aprobado",
                fechaPago : Date.now()
            }
        })
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado : "ERROR",
            mensaje : err.message
        })
    }
}

