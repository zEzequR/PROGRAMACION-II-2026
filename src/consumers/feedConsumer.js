import { kafka } from '../config/kafka.js';
import { registrarInteraccionFeed, syncProductoFeed, setInteresesUsuarioFeed } from '../services/api/MCPservice.js';

async function manejarInteraccion(datos)
{
    await registrarInteraccionFeed(datos.id_persona, datos.id_producto, datos.tipo_evento);
}

async function manejarSync(datos)
{
    if (datos.tipo === 'producto')
    {
        await syncProductoFeed(datos.id_producto, datos.id_cat, datos.id_tienda, datos.activo);
    }
    else if (datos.tipo === 'interes')
    {
        await setInteresesUsuarioFeed(datos.id_persona, datos.id_cat, datos.accion);
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