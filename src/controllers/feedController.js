import { obtenerFeedService } from '../services/feedService.js';
import { buscarProductosService } from '../services/productosService.js';
import { Tiendas } from '../models/tiendas.js';

export async function obtenerFeed(req, res)
{
    try
    {
        const [usuario, filtros] = req.models;

        if (filtros.busqueda !== undefined || filtros.idCat !== undefined)
        {
            const productos = await buscarProductosService(filtros);
            return res.status(200).json(productos);
        }

        let tiendaPropia = null;
        if (req.user && req.user.id_tienda)
        {
            tiendaPropia = new Tiendas({ idTienda: req.user.id_tienda });
        }

        const productos = await obtenerFeedService(usuario, filtros, tiendaPropia);
        return res.status(200).json(productos);
    }
    catch (err)
    {
        console.error(err);
        return res.status(500).end();
    }
}

