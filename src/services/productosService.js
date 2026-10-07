import pool from '../config/conexion.js'
import fs from 'fs'
import { subirArchivo, generarUrlDescarga } from '../services/api/awsS3Service.js'
import { guardarCategoriaService } from './categoriasService.js'
import { SyncProductoEvento } from '../models/eventos.js';
import { publicarEvento } from './api/kafkaService.js';
import { ArchivoDigital } from '../models/archivoDigital.js';
import { Productos } from '../models/productos.js';

const queryProductoCompleto = `
    SELECT Productos.id_producto, Productos.id_tienda, Productos.id_cat, Categorias_Productos.categoria,
        Productos.tipo_prod, Productos.nombre_prod, Productos.imagen_prod,
        COALESCE(Productos.descrip_prod, '') AS descrip_prod,
        Productos.precio, Productos.activo,
        Productos_Fisicos.stock,
        Productos_Digitales.archivo_prod,
        COALESCE(Productos_Digitales.usa_licencia, FALSE) AS usa_licencia,
        Tiendas.nombre_tienda, Tiendas.logo_tienda, Tiendas.activo AS tienda_activa
    FROM Productos
    JOIN Tiendas ON Tiendas.id_tienda = Productos.id_tienda
    LEFT JOIN Categorias_Productos ON Categorias_Productos.id_cat = Productos.id_cat
    LEFT JOIN Productos_Fisicos ON Productos_Fisicos.id_producto = Productos.id_producto
    LEFT JOIN Productos_Digitales ON Productos_Digitales.id_producto = Productos.id_producto
`;

async function publicarSyncProducto(fila)
{
    if (fila.id_cat === null || fila.id_tienda === null)
    {
        return;
    }

    try
    {
        const evento = new SyncProductoEvento({
            tipo: 'producto',
            idProducto: fila.id_producto,
            idCat: fila.id_cat,
            idTienda: fila.id_tienda,
            activo: fila.activo === true
        });

        await publicarEvento('sync_postgres_feed', {
            tipo: evento.tipo,
            id_producto: evento.idProducto,
            id_cat: evento.idCat,
            id_tienda: evento.idTienda,
            activo: evento.activo
        });
    }
    catch (errEvento)
    {
        console.error(`No se pudo publicar el sync del producto ${fila.id_producto}: ${errEvento.message}`);
    }
}

export async function sincronizarProductosTiendaFeed(tienda)
{
    const query = `
        SELECT Productos.id_producto, Productos.id_cat, Productos.id_tienda,
            (COALESCE(Productos.activo, FALSE) AND COALESCE(Tiendas.activo, FALSE)) AS activo
        FROM Productos
        JOIN Tiendas ON Tiendas.id_tienda = Productos.id_tienda
        WHERE Productos.id_tienda = $1
    `;

    try
    {
        const resultado = await pool.query(query, [tienda.idTienda]);

        for (const fila of resultado.rows)
        {
            await publicarSyncProducto(fila);
        }
    }
    catch (err)
    {
        console.error(`No se pudo sincronizar con el feed los productos de la tienda ${tienda.idTienda}: ${err.message}`);
    }
}


export async function crearProductoService(Producto, atributos, especificacionObj)
{
    const query = `
    INSERT INTO Productos (id_tienda, id_cat, tipo_prod, nombre_prod, imagen_prod, descrip_prod, precio, activo)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id_producto;
    `
    const values = [
        Producto.idTienda,
        Producto.idCat,
        Producto.tipoProd,
        Producto.nombreProd,
        Producto.imagenProd,
        Producto.descripProd,
        Producto.precio,
        Producto.activo
    ];
    
    try
    {
        const resultado = await pool.query(query, values);
        const idProducto = resultado.rows[0].id_producto;

        switch (Producto.tipoProd)
        {
            case "DIGITAL":
            {
                await pool.query(
                    `INSERT INTO Productos_Digitales(id_producto, archivo_prod, usa_licencia)
                    VALUES ($1, $2, $3);`
                    ,
                    [idProducto,
                    Producto.archivoProd,
                    Producto.usaLicencia]
                );
                
                break;
            }
            case "FISICO":
            {
                await pool.query(
                    `INSERT INTO Productos_Fisicos (id_producto, stock)
                    VALUES ($1, $2);`
                    ,
                    [idProducto,Producto.stock]
                );
                break;
            }
        }

        if (atributos && atributos.nombreAtributo)
        {
            especificacionObj.idProducto = idProducto;
            await guardarCategoriaService(atributos, especificacionObj);
        }

        await publicarSyncProducto({
            id_producto: idProducto,
            id_cat: Producto.idCat,
            id_tienda: Producto.idTienda,
            activo: Producto.activo
        });

        return idProducto;
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function modificarProductoService(Productos, atributos, especificacionObj)
{
    const query = `
        UPDATE Productos SET
            id_cat = COALESCE($3, id_cat),
            nombre_prod = COALESCE($4, nombre_prod),
            imagen_prod = COALESCE($5, imagen_prod),
            descrip_prod= COALESCE($6, descrip_prod),
            precio = COALESCE($7, precio),
            activo = COALESCE($8, activo)
        WHERE id_tienda = $1 AND id_producto = $2;
    `
    const queryDigital = `
        UPDATE Productos_Digitales SET
            archivo_prod = COALESCE($2, archivo_prod),
            usa_licencia = COALESCE($3, usa_licencia)
        WHERE id_producto = $1;
    `;

    const queryFisico = `
        UPDATE Productos_Fisicos SET
            stock = COALESCE($2, stock)
        WHERE id_producto = $1;
    `;

    
    const values = [
        Productos.idTienda,
        Productos.idProducto,
        Productos.idCat, 
        Productos.nombreProd || null,
        Productos.imagenProd || null,
        Productos.descripProd || null,
        Productos.precio !== undefined ? Productos.precio : null,
        Productos.activo
        ]
    try
    {
        await pool.query(query, values);
        switch (Productos.tipoProd)
        {
            case "DIGITAL":
            {
                await pool.query(
                    queryDigital,
                    [Productos.idProducto, Productos.archivoProd,
                    Productos.usaLicencia]
                );
                break;
            }
            case "FISICO":
            {
                await pool.query(
                    queryFisico,
                    [Productos.idProducto, Productos.stock]
                );
                break;
            }
        }
        if (atributos && atributos.nombreAtributo)
        {
            await guardarCategoriaService(atributos, especificacionObj);
        }
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function cambiarActivoProductosService(Productos)
{
    const query = `
        UPDATE Productos SET activo = $3
        WHERE id_tienda = $1 AND id_producto = $2
        RETURNING id_producto, id_cat, id_tienda, activo
    `;

    for (const Producto of Productos)
    {
        if (Producto.activo !== true && Producto.activo !== false)
        {
            throw new Error("Falta indicar si el producto se da de baja o se reactiva");
        }

        const productoActual = await buscarProductoPorId(Producto);

        if (!productoActual || productoActual.idTienda !== Producto.idTienda)
        {
            throw new Error("Hay productos que no existen o no son de tu tienda");
        }
    }

    for (const Producto of Productos)
    {
        const resultado = await pool.query(query, [Producto.idTienda, Producto.idProducto, Producto.activo]);
        await publicarSyncProducto(resultado.rows[0]);
    }

    return true;
}

export async function buscarProductoPorId(producto)
{
    const query = queryProductoCompleto + ' WHERE Productos.id_producto = $1';

    try
    {
        const resultado = await pool.query(query, [producto.idProducto]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return Productos.fromRow(resultado.rows[0]);
    }
    catch (err)
    {
        throw new Error(`Error al buscar producto por ID: ${err.message}`);
    }
}

export async function buscarProductosPorIds(productos)
{
    if (productos.length === 0)
    {
        return [];
    }

    const marcadores = [];
    const ids = [];
    for (const producto of productos)
    {
        ids.push(producto.idProducto);
        marcadores.push('$' + ids.length);
    }

    const query = queryProductoCompleto + ' WHERE Productos.id_producto IN (' + marcadores.join(', ') + ')';

    try
    {
        const resultado = await pool.query(query, ids);
        return resultado.rows.map(function (fila)
        {
            return Productos.fromRow(fila);
        });
    }
    catch (err)
    {
        throw new Error(`Error al buscar productos por ID: ${err.message}`);
    }
}

export async function obtenerArchivoProductoService(producto)
{
    const query = `SELECT archivo_prod FROM Productos_Digitales WHERE id_producto = $1`;

    try
    {
        const resultado = await pool.query(query, [producto.idProducto]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return new ArchivoDigital({ key: resultado.rows[0].archivo_prod });
    }
    catch (err)
    {
        throw new Error(`Error al buscar el archivo del producto: ${err.message}`);
    }
}

export async function subirArchivoDigitalS3(archivo)
{
    try
    {
        return await subirArchivo(archivo)
    }
    finally
    {
        fs.unlink(archivo.path, (err) => {
            if (err) console.error('No se pudo borrar el archivo temporal:', archivo.path, err)
        })
    }
}

export async function obtenerURLService(detalle, usuario)
{
    const query = `
        SELECT Productos_Digitales.archivo_prod, Ventas.estado
        FROM Detalle_Venta
        JOIN Ventas ON Ventas.id_venta = Detalle_Venta.id_venta
        JOIN Clientes ON Clientes.id_cliente = Ventas.id_cliente
        JOIN Productos_Digitales ON Productos_Digitales.id_producto = Detalle_Venta.id_producto
        WHERE Detalle_Venta.id_venta = $1
        AND Detalle_Venta.id_producto = $2
        AND Clientes.id_persona = $3
    `;

    try
    {
        const resultado = await pool.query(query, [detalle.idVenta,
            detalle.idProducto, usuario.idPersona]);
        
        if (resultado.rows.length === 0)
        {
            return false;
        }

        if (resultado.rows[0].estado !== 'CERRADA')
        {
            return false;
        }

        const archivo = new ArchivoDigital(
            {
                key: resultado.rows[0].archivo_prod
            });

        return await generarUrlDescarga(archivo);
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function obtenerProductosTiendaService(tienda)
{
    let filtroActivo = '';
    if (tienda.activo)
    {
        filtroActivo = 'AND Productos.activo = TRUE AND Tiendas.activo = TRUE';
    }

    const query = `
        SELECT Productos.id_producto, Productos.id_tienda, Productos.id_cat, Categorias_Productos.categoria,
            Productos.tipo_prod, Productos.nombre_prod, Productos.imagen_prod,
            COALESCE(Productos.descrip_prod, '') AS descrip_prod,
            Productos.precio, Productos.activo,
            Productos_Fisicos.stock,
            Productos_Digitales.usa_licencia,
            Tiendas.nombre_tienda, Tiendas.logo_tienda
        FROM Productos
        JOIN Tiendas ON Tiendas.id_tienda = Productos.id_tienda
        LEFT JOIN Categorias_Productos ON Categorias_Productos.id_cat = Productos.id_cat
        LEFT JOIN Productos_Fisicos ON Productos_Fisicos.id_producto = Productos.id_producto
        LEFT JOIN Productos_Digitales ON Productos_Digitales.id_producto = Productos.id_producto

        WHERE Productos.id_tienda = $1
        ${filtroActivo}
        ORDER BY Productos.nombre_prod
    `;

    try
    {
        const resultado = await pool.query(query, [tienda.idTienda]);
        return resultado.rows.map(function (fila)
        {
            return Productos.fromRow(fila);
        });

    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function buscarProductosService(filtros)
{
    let total = filtros.total || 20;
    if (total < 1) { total = 1; }
    if (total > 100) { total = 100; }

    let offset = filtros.offset || 0;
    if (offset < 0) { offset = 0; }

    const condiciones = ['Productos.activo = TRUE', 'Tiendas.activo = TRUE'];
    const valores = [];

    if (filtros.idCat !== undefined)
    {
        valores.push(filtros.idCat);
        condiciones.push(`Productos.id_cat = $${valores.length}`);
    }

    if (filtros.busqueda !== undefined)
    {
        valores.push(`%${filtros.busqueda}%`);
        condiciones.push(`Productos.nombre_prod ILIKE $${valores.length}`);
    }

    valores.push(total);
    const parametroTotal = `$${valores.length}`;
    valores.push(offset);
    const parametroOffset = `$${valores.length}`;

    const query = `
        SELECT Productos.id_producto, Productos.id_tienda, Productos.id_cat, Categorias_Productos.categoria,
            Productos.tipo_prod, Productos.nombre_prod, Productos.imagen_prod,
            COALESCE(Productos.descrip_prod, '') AS descrip_prod,
            Productos.precio, Productos.activo,
            Productos_Fisicos.stock,
            Tiendas.nombre_tienda, Tiendas.logo_tienda
        FROM Productos
        JOIN Tiendas ON Tiendas.id_tienda = Productos.id_tienda
        LEFT JOIN Categorias_Productos ON Categorias_Productos.id_cat = Productos.id_cat
        LEFT JOIN Productos_Fisicos ON Productos_Fisicos.id_producto = Productos.id_producto
        WHERE ${condiciones.join(' AND ')}
        ORDER BY Productos.nombre_prod
        LIMIT ${parametroTotal} OFFSET ${parametroOffset}
    `;

    try
    {
        const resultado = await pool.query(query, valores);
        return resultado.rows.map(function (fila)
        {
            return Productos.fromRow(fila);
        });

    }
    catch (err)
    {
        throw new Error(err.message);
    }
}