import { kafka } from '../../config/kafka.js';

const producer = kafka.producer();

try
{
    await producer.connect();
    console.log('Conexión exitosa al producer de Kafka');
}
catch (error)
{
    console.log(`No se pudo conectar el producer de Kafka. Motivo: ${error.message}`);
}

export async function publicarEvento(topic, mensaje)
{
    await producer.send({
        topic: topic,
        messages: [{ value: JSON.stringify(mensaje) }]
    });
}