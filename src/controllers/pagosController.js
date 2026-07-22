import Pagos from '../models/pagos.js'
import { crearPagoService, actualizarPagoService } from '../services/pagosService.js'
import { Preference, Payment, Customer, CustomerCard } from 'mercadopago'
import mpClient from '../config/mercadopago.js'
import { obtenerTarjetasClienteService, guardarTarjetaClienteService } from '../services/tarjetasPagoService.js'
import { procesarPagoBrickService, obtenerOCrearCustomerMP, guardarTarjetaMP, procesarPagoTarjetaGuardadaService, crearPreferenciaService } from '../services/api/mercadoPagoService.js'
import { cerrarVentaService, cancelarVentaService } from '../services/ventasService.js'


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

            const idPago = await crearPagoService(
            {
                idTransaccion: Number(info.id),
                estado: info.status,
                metodoPago: info.payment_method_id,
                monto: Number(info.transaction_amount)
            });

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

export async function obtenerTarjetas(req, res)
{
    try
    {
        const { idCliente } = req.params;
        const tarjetas = await obtenerTarjetasClienteService(idCliente);

        return res.status(200).json(
        {
            estado: "EXITO",
            customerId: tarjetas[0]?.servicio_cliente_id || null,
            tarjetas: tarjetas.map(t => (
            {
                cardId: t.servicio_tarjeta_id,
                ultimosDigitos: t.ult_digitos_tarjeta,
                marca: t.marca_tarjeta,
                expiraMes: t.expira_mes,
                expiraAno: t.expira_ano,
                porDefecto: t.por_defecto,
                issuerId: t.issuer_id
            }))
        });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}

export async function procesarPagoBrick(req, res)
{
    try
    {
        const { idVenta, descripcion, idCliente, guardarTarjeta, ...formData } = req.body;

        const resultado = await procesarPagoBrickService(formData, { idVenta, descripcion });

        if (resultado.status === 'approved' && guardarTarjeta && idCliente)
        {
            try
            {
                const tarjetasExistentes = await obtenerTarjetasClienteService(idCliente);
                const customerIdExistente = tarjetasExistentes[0]?.servicio_cliente_id || null;

                const customerId = await obtenerOCrearCustomerMP(
                    `test_payer_${idCliente}@testuser.com`,
                    customerIdExistente
                );
                const tarjetaGuardada = await guardarTarjetaMP(customerId, formData.token);
                console.log("RESPUESTA COMPLETA DE MP AL GUARDAR TARJETA:", tarjetaGuardada);
                const yaExiste = tarjetasExistentes.some(t => t.servicio_tarjeta_id === String(tarjetaGuardada.id));

                if (!yaExiste)
                {
            await guardarTarjetaClienteService(
            {
                idCliente,
                customerId,
                cardId: tarjetaGuardada.id,
                ultimosDigitos: tarjetaGuardada.last_four_digits,
                marca: tarjetaGuardada.payment_method?.id,
                expiraMes: tarjetaGuardada.expiration_month,
                expiraAno: tarjetaGuardada.expiration_year,
                porDefecto: tarjetasExistentes.length === 0,
                issuerId: tarjetaGuardada.issuer?.id
            });
                }
            }
            catch(errTarjeta)
            {
                console.error("No se pudo guardar la tarjeta:", errTarjeta);
            }
        }

        return res.status(201).json(
        {
            estado: "EXITO",
            status: resultado.status,
            status_detail: resultado.status_detail,
            id_pago: resultado.id
        });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}

///////////////////////////////


export async function procesarPagoTarjetaGuardada(req, res)
{
    try
    {
        const { token, paymentMethodId, issuerId, customerId, idVenta, descripcion, monto, cuotas } = req.body;

        const resultado = await procesarPagoTarjetaGuardadaService(
        {
            token, paymentMethodId, issuerId, customerId, idVenta, descripcion, monto, cuotas
        });

        return res.status(201).json(
        {
            estado: "EXITO",
            status: resultado.status,
            status_detail: resultado.status_detail,
            id_pago: resultado.id
        });
    }
    catch(err)
    {
        console.error(err);
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
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
            preferenceId: pref.id,
            init_point: pref.init_point,
            sandbox_init_point: pref.sandbox_init_point
        });
    }
    catch(err)
    {
        return res.status(500).json({ estado: "ERROR", mensaje: err.message });
    }
}