import { obtenerFeedService } from '../services/feedService.js';
import { buscarProductosService } from '../services/productosService.js';

export async function obtenerFeed(req, res)
{
    try
    {
        const { query, user } = req.models;

        if (query.busqueda !== undefined || query.idCat !== undefined)
        {
            const productos = await buscarProductosService(query);
            return res.status(200).json(productos);
        }

        let idPersona;
        if (user)
        {
            idPersona = user.idPersona;
        }

        const productos = await obtenerFeedService(idPersona, query.total, query.offset);

        return res.status(200).json(productos);
    }
    catch (err)
    {
        console.error(err);
        return res.status(500).end();
    }
}
