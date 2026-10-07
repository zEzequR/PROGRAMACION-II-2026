import { kafka } from '../config/kafka.js';
import { registrarInteraccionFeed, syncProductoFeed, setInteresesUsuarioFeed } from '../services/api/MCPservice.js';
import { InteraccionEvento, SyncProductoEvento, SyncInteresEvento } from '../models/eventos.js';

async function manejarInteraccion(datos)
{
    const evento = new InteraccionEvento({
        idPersona: datos.id_persona,
        idProducto: datos.id_producto,
        tipoEvento: datos.tipo_evento
    });

    await registrarInteraccionFeed(evento);
}

async function manejarSync(datos)
{
    if (datos.tipo === 'producto')
    {

        const evento = new SyncProductoEvento({
            tipo: 'producto',
            idProducto: datos.id_producto,
            idCat: datos.id_cat,
            idTienda: datos.id_tienda,
            activo: datos.activo
        });

        await syncProductoFeed(evento);
    }
    else if (datos.tipo === 'interes')
    {
        const evento = new SyncInteresEvento({
            tipo: 'interes',
            idPersona: datos.id_persona,
            idCat: datos.id_cat,
            accion: datos.accion
        });

        await setInteresesUsuarioFeed(evento);
    }
    else
    {
        console.error(`Mensaje de sync_postgres_feed con tipo desconocido: ${datos.tipo}`);
    }
}

async function iniciarConsumer()
{
    const consumer = kafka.consumer({ groupId: 'feed-service-consumer' });

    await consumer.connect();
    await consumer.subscribe({ topic: 'interacciones_feed', fromBeginning: false });
    await consumer.subscribe({ topic: 'sync_postgres_feed', fromBeginning: false });

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

            try
            {
                if (topic === 'interacciones_feed')
                {
                    await manejarInteraccion(datos);
                }
                else if (topic === 'sync_postgres_feed')
                {
                    await manejarSync(datos);
                }
                console.log(`Procesado: ${topic} ->`, datos);
            }
            catch(err)
            {
                console.error(`No se pudo procesar ${topic}, se descarta:`, datos, err.message);
            }
            
        }
    });

    console.log('Consumer de Kafka conectado y escuchando interacciones_feed y sync_postgres_feed.');
}

iniciarConsumer().catch(function (err)
{
    console.error(`No se pudo iniciar el consumer: ${err.message}`);
    process.exit(1);
});