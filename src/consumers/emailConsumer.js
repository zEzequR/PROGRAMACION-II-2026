import { kafka } from '../config/kafka.js';
import { obtenerDetalleVentaService } from '../services/ventasService.js';
import { generarPlantillaVenta } from '../scripts/emailTemplate.js';
import { enviarCorreoIndividual } from '../services/api/resendService.js';
import { Correo } from '../models/correo.js';
import { Ventas } from '../models/ventas.js';

const INTENTOS = 3;

function esperar(milisegundos)
{
    return new Promise(function (resolver)
    {
        setTimeout(resolver, milisegundos);
    });
}

async function enviarComprobante(idVenta)
{
    const detalle = await obtenerDetalleVentaService(new Ventas({ idVenta: idVenta }));
    const htmlEmail = await generarPlantillaVenta(detalle);

    const correo = new Correo({
        to: detalle.cliente.email,
        subject: 'Confirmación de compra',
        html: htmlEmail
    });

    await enviarCorreoIndividual(correo);
}

async function manejarVentaCerrada(datos)
{
    for (let intento = 1; intento <= INTENTOS; intento++)
    {
        try
        {
            await enviarComprobante(datos.id_venta);
            console.log(`Comprobante de la venta ${datos.id_venta} enviado`);
            return;
        }
        catch (err)
        {
            console.error(`Intento ${intento} de ${INTENTOS}: no se pudo enviar el comprobante de la venta ${datos.id_venta}: ${err.message}`);

            if (intento < INTENTOS)
            {
                await esperar(intento * 2000);
            }
        }
    }

    console.error(`Se descarta el comprobante de la venta ${datos.id_venta} después de ${INTENTOS} intentos`);
}

async function iniciarConsumer()
{
    const consumer = kafka.consumer({ groupId: 'email-ventas-consumer' });

    await consumer.connect();
    await consumer.subscribe({ topic: 'ventas_cerradas', fromBeginning: false });

    await consumer.run({
        eachMessage: async function ({ topic, message })
        {
            let datos;

            try
            {
                datos = JSON.parse(message.value.toString());
            }
            catch (err)
            {
                console.error(`Mensaje malformado en ${topic}, se descarta: ${err.message}`);
                return;
            }

            await manejarVentaCerrada(datos);
        }
    });

    console.log('Consumer de mails conectado y escuchando ventas_cerradas.');
}

iniciarConsumer().catch(function (err)
{
    console.error(`No se pudo iniciar el consumer de mails: ${err.message}`);
    process.exit(1);
});
