import { Preference, Payment, Customer, CustomerCard } from 'mercadopago'
import mpClient from '../../config/mercadopago.js';
import crypto from 'crypto'



export async function procesarPagoBrickService(formData, datosExtra)
{
    const payment = new Payment(mpClient);

    const body =
    {
        ...formData,
        description: datosExtra.descripcion,
        external_reference: String(datosExtra.idVenta),
        notification_url: process.env.MP_WEBHOOK_URL
    };

    const requestOptions = { idempotencyKey: crypto.randomUUID() };

    const resultado = await payment.create({ body, requestOptions });
    return resultado;
}

export async function obtenerOCrearCustomerMP(email, customerIdExistente)
{
    if (customerIdExistente) return customerIdExistente;

    const customer = new Customer(mpClient);
    const resultado = await customer.create({ body: { email } });
    return resultado.id;
}

export async function guardarTarjetaMP(customerId, token)
{
    const customerCard = new CustomerCard(mpClient);
    const resultado = await customerCard.create({ customerId, body: { token } });
    return resultado;
}





/////////////////////////
export async function procesarPagoTarjetaGuardadaService(datos)
{
    const payment = new Payment(mpClient);

    const body =
    {
        transaction_amount: Number(datos.monto),
        token: datos.token,
        description: datos.descripcion,
        installments: Number(datos.cuotas) || 1,
        payment_method_id: datos.paymentMethodId,
        issuer_id: datos.issuerId,
        payer:
        {
            type: "customer",
            id: datos.customerId
        },
        external_reference: String(datos.idVenta),
        notification_url: process.env.MP_WEBHOOK_URL
    };

    console.log("BODY QUE SE MANDA A MP:", body);

    const requestOptions = { idempotencyKey: crypto.randomUUID() };

    const resultado = await payment.create({ body, requestOptions });
    return resultado;
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
    }

    const resultado = await preference.create({ body });
    return resultado;
}