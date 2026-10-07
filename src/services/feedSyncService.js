import pool from '../config/conexion.js'
import { ProductoFeed, InteresFeed } from '../models/feedSync.js';
import { resyncCompletoFeed, verificarEstadoFeed } from './api/MCPservice.js';

export async function iniciarFeed()
{
    try
    {
        const estado = await verificarEstadoFeed();
        console.log(`Feed conectado: ${estado}`);

        const cantidades = await resincronizarFeed();
        console.log(`Feed sincronizado: ${cantidades.productos} productos y ${cantidades.intereses} intereses`);
    }
    catch (err)
    {
        console.error(`No se pudo iniciar el feed: ${err.message}`);
    }
}

export async function resincronizarFeed()
{
    const queryProductos = `
        SELECT Productos.id_producto, Productos.id_cat, Productos.id_tienda,
            (COALESCE(Productos.activo, FALSE) AND COALESCE(Tiendas.activo, FALSE)) AS activo
        FROM Productos
        JOIN Tiendas ON Tiendas.id_tienda = Productos.id_tienda
        WHERE Productos.id_cat IS NOT NULL
    `;
    const queryIntereses = `SELECT id_persona, id_cat FROM Personas_Intereses`;

    try
    {
        const resProductos = await pool.query(queryProductos);
        const resIntereses = await pool.query(queryIntereses);

        const productos = [];
        for (const fila of resProductos.rows)
        {
            const producto = new ProductoFeed({
                idProducto: fila.id_producto,
                idCat: fila.id_cat,
                idTienda: fila.id_tienda,
                activo: fila.activo
            });

            productos.push({
                id_producto: producto.idProducto,
                id_cat: producto.idCat,
                id_tienda: producto.idTienda,
                activo: producto.activo
            });
        }

        const intereses = [];
        for (const fila of resIntereses.rows)
        {
            const interes = new InteresFeed({
                idPersona: fila.id_persona,
                idCat: fila.id_cat
            });

            intereses.push({
                id_persona: interes.idPersona,
                id_cat: interes.idCat
            });
        }

        await resyncCompletoFeed(productos, intereses);

        return { productos: productos.length, intereses: intereses.length };
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}