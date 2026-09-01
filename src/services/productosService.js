import pool from '../config/conexion.js'
import fs from 'fs'
import { subirArchivo, reemplazarArchivo , generarUrlDescarga } from '../services/api/awsS3Service.js'

export async function crearProductoService(Producto)
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
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function modificarProductoService(Productos)
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
                    `UPDATE Productos_Digitales SET
                        archivo_prod = $2,
                        usa_licencia = $3
                    WHERE id_producto = $1;
                    `,
                    [Productos.idProducto, Productos.archivoProd,
                    Productos.usaLicencia]
                );
                break;
            }
            case "FISICO":
            {
                await pool.query(
                    `UPDATE Productos_Fisicos SET
                    stock = $2
                    WHERE id_producto = $1;
                    `,
                    [Productos.idProducto, Productos.stock]
                );
                break;
            }
        }
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function eliminarProductoService(Productos)
{
    const query = `
        UPDATE Productos SET
        activo = false
        WHERE id_tienda = $1
        AND id_producto = $2;
    `
    
    try
    {
        for (const Producto of Productos)
        {
            await pool.query(query, [
                Producto.idTienda,
                Producto.idProducto
            ]);
        }
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function reactivarProductoService(Productos)
{
    const query = `
        UPDATE Productos SET
        activo = TRUE
        WHERE id_tienda = $1
        AND id_producto = $2;
    `
    
    try
    {
        for (const Producto of Productos)
            {
                await pool.query(query, [
                    Producto.idTienda,
                    Producto.idProducto
                ]);
            }
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function buscarProductoPorId(idProducto) {
    try {
        const resTipo = await pool.query(
            `SELECT tipo_prod FROM Productos WHERE id_producto = $1;`,
            [idProducto]
        );
        
        let query;

        switch (resTipo.rows[0].tipo_prod) {
            case 'DIGITAL':
                query = `
                    SELECT 
                        Productos.id_producto,
                        Productos.id_tienda,
                        Productos.id_cat,
                        Productos.tipo_prod,
                        Productos.nombre_prod,
                        Productos.imagen_prod,
                        Productos.descrip_prod,
                        Productos.precio,
                        Productos.activo,
                        Productos_Digitales.archivo_prod,
                        Productos_Digitales.usa_licencia
                    FROM Productos
                    INNER JOIN Productos_Digitales 
                    ON Productos.id_producto = Productos_Digitales.id_producto
                    WHERE Productos.id_producto = $1;
                `;
                break;
            case 'FISICO':
                query = `
                    SELECT 
                        Productos.id_producto,
                        Productos.id_tienda,
                        Productos.id_cat,
                        Productos.tipo_prod,
                        Productos.nombre_prod,
                        Productos.imagen_prod,
                        Productos.descrip_prod,
                        Productos.precio,
                        Productos.activo,
                        Productos_Fisicos.stock
                    FROM Productos
                    INNER JOIN Productos_Fisicos 
                    ON Productos.id_producto = Productos_Fisicos.id_producto
                    WHERE Productos.id_producto = $1;
                `;
                break;

            default:
                return null;
        }

        const resultado = await pool.query(query, [idProducto]);
        return resultado.rows[0];

    } catch (err) {
        throw new Error(`Error al buscar producto por ID: ${err.message}`);
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


export async function editarArchivoDigitalS3(archivo)
{
    try
    {
        return await reemplazarArchivo(archivo)
    }
    finally
    {
        fs.unlink(archivo.path, (err) => {
            if (err) console.error('No se pudo borrar el archivo temporal:', archivo.path, err)
        })
    }
}

export async function obtenerURLService(venta)
{
    const res = await pool.query(
        `SELECT Detalle_Venta.id_lic_vta, Productos_Digitales.archivo_prod, Ventas.id_cliente, Ventas.estado
            FROM Detalle_Venta
            JOIN Ventas ON Ventas.id_venta = Detalle_Venta.id_venta
            JOIN Productos_Digitales ON Productos_Digitales.id_producto = Detalle_Venta.id_producto
            WHERE Detalle_Venta.id_venta = $1 AND Detalle_Venta.id_producto = $2 AND Ventas.id_cliente = $3`,
        [venta.idVenta, venta.idProducto, venta.idCliente]
    )

    const estadoVta = res.rows[0].estado

    if (res.rows.length === 0) return false;

    const estadoVenta = res.rows[0].estado;
    let urlGen = false;

    if (estadoVenta === "CERRADA")
    {
        urlGen = await generarUrlDescarga(row.archivo_prod);
    }

    return urlGen;
}

export async function crearEspecificacionesAtributosService(especificaciones, idCat, idProd)
{
    const query = `
        CALL spu_crear_especificaciones_producto(
        $1, $2, $3, $4)
    `
    const values = [
        idCat,
        especificaciones.nombreAtributo,
        especificaciones.valor,
        idProd
    ];
    
    try
    {
        const resultado = await pool.query(query, values);
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}