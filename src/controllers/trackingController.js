import { publicarEvento } from '../services/api/kafkaService.js';

async function registrarInteraccion(req, res)
{
    try
    {
        const [evento] = req.models;

        await publicarEvento('interacciones_feed', {
            id_persona: evento.idPersona,
            id_producto: evento.idProducto,
            tipo_evento: evento.tipoEvento
        });

        return res.status(202).end();
    }
    catch (err)
    {
        console.error(err);
        return res.status(500).end();
    }
}

export async function registrarVista(req, res)
{
    return registrarInteraccion(req, res);
}

export async function registrarClick(req, res)
{
    return registrarInteraccion(req, res);
}
