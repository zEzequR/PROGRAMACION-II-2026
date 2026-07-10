import { Preference } from 'mercadopago'
import mpClient from '../config/mercadopago.js'

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
        external_reference: String(venta.idVenta), // así lo identificás cuando vuelve el webhook
        notification_url: process.env.MP_WEBHOOK_URL, // ej: https://tuapi.com/pagos/webhook
        back_urls:
        {
            success: process.env.MP_BACK_SUCCESS,
            failure: process.env.MP_BACK_FAILURE,
            pending: process.env.MP_BACK_PENDING
        },
        auto_return: "approved"
    }

    const resultado = await preference.create({ body });
    return resultado; // resultado.id, resultado.init_point, resultado.sandbox_init_point
}