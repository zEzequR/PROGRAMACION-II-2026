import { getUserFeedMcp } from './api/MCPservice.js';
import { Productos } from '../models/productos.js';
import { buscarProductosPorIds } from './productosService.js';

export async function obtenerFeedService(usuario, filtros, tiendaPropia)
{
    const ids = await getUserFeedMcp(usuario, filtros, tiendaPropia);

    const productos = [];
    for (const id of ids)
    {
        productos.push(new Productos({ idProducto: id }));
    }

    const encontrados = await buscarProductosPorIds(productos);

    const productoPorId = new Map();
    for (const producto of encontrados)
    {
        productoPorId.set(producto.idProducto, producto);
    }

    const productosOrdenados = [];

    for (const id of ids)
    {
        const producto = productoPorId.get(id);

        if (producto && producto.activo && producto.tienda.activo)
        {
            productosOrdenados.push(producto);
        }
    }
    return productosOrdenados;
}
