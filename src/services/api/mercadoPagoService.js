import { Preference, Payment, Customer, CustomerCard } from 'mercadopago'
import mpClient from '../../config/mercadopago.js';
import crypto from 'crypto'


export async function procesarPagoBrickService(formData, datosExtra)
{
    const payment = new Payment(mpClient);

    const body =
    {
        ...formData,
        transaction_amount: Number(datosExtra.monto),
        description: datosExtra.descripcion,
        external_reference: String(datosExtra.idVenta),
        notification_url: process.env.MP_WEBHOOK_URL
    };

    const requestOptions = { idempotencyKey: crypto.randomUUID() };

    try
    {
        const resultado = await payment.create({ body, requestOptions });
        return resultado;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}


export async function crearPreferenciaService(venta)
{
    const preference = new Preference(mpClient);

    const body =
    {
        items:
        [
            {
                id: String(venta.idVenta),
                title: venta.nombreProd || "Compra en tienda",
                quantity: 1,
                unit_price: Number(venta.precioFinal),
                currency_id: "ARS"
            }
        ],
        external_reference: String(venta.idVenta),
        notification_url: process.env.MP_WEBHOOK_URL,
        back_urls:
        {
            success: process.env.MP_BACK_SUCCESS,
            failure: process.env.MP_BACK_FAILURE,
            pending: process.env.MP_BACK_PENDING
        },
        auto_return: "approved"
    };

    try
    {
        const resultado = await preference.create({ body });
        return resultado;
    }
    catch(err)
    {
        throw new Error(err.message);
    }
}