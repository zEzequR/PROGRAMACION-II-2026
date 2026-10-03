import { getUserFeedMcp } from './api/MCPservice.js';
import { Productos } from '../models/productos.js';
import { buscarProductoPorId, filaAProducto } from './productosService.js';

export async function obtenerFeedService(idPersona, total, offset)
{
    const ids = await getUserFeedMcp(idPersona, total, offset);

    const productosOrdenados = [];

    for (const id of ids)
    {
        const fila = await buscarProductoPorId(new Productos({ idProducto: id }));

        if (fila && fila.activo && fila.tienda_activa)
        {
            productosOrdenados.push(filaAProducto(fila));
        }
    }
    return productosOrdenados;
}

