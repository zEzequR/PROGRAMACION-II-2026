import pool from '../config/conexion.js'

export async function crearProductoService(Producto, idCat, idTienda)
{
    const query = `
        CALL spu_crear_producto(
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11)
    `
    const values = [
        idTienda,
        idCat,
        Producto.tipoProd,
        Producto.nombreProd,
        Producto.imagenProd,
        Producto.descripProd,
        Producto.precio,
        Producto.activo,
        Producto.stock || null,
        Producto.archivoProd || null,
        Producto.usaLicencia !== undefined ? Producto.usaLicencia : null,
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

export async function modificarProductoService(Producto, idCat, idProd, idTienda)
{
    const query = `
        CALL spu_modificar_producto(
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11)
    `
    const values = [
        idTienda,
        idProd,
        idCat, 
        Producto.tipoProd,
        Producto.nombreProd || null,
        Producto.imagenProd || null,
        Producto.descripProd || null,
        Producto.precio !== undefined ? Producto.precio : null,
        Producto.stock !== undefined ? Producto.stock : null,
        Producto.archivoProd || null,
        Producto.usaLicencia !== undefined ? Producto.usaLicencia : null,
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

export async function eliminarProductoService(idProducto, idTienda)
{
    const query = `
        CALL spu_eliminar_producto(
        $1, $2)
    `
    const values = [
        idProducto,
        idTienda
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

export async function reactivarProductoService(idProducto, idTienda)
{
    const query = `
        CALL spu_reactivar_producto(
        $1, $2)
    `
    const values = [
        idProducto,
        idTienda
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

export async function verProductosService(filtrers, viewType)
{
    switch (viewType)
    {
        case 1:
            {
                const query = `
                    SELECT * FROM vw_obtener_productos
                `
                const values = [];
                
                try
                {
                    const resultado = await pool.query(query);
                    return resultado
                }
                catch(err)
                {
                    throw new Error(err.message)
                }
            }
        case 2:
            {
                const query = `
                    CALL fn_ver_productos_por_filtros(
                    $1, $2, $3, $4, $5, $6, $7, $8)
                `
                const values = [];
                
                try
                {
                    const resultado = await pool.query(query);
                    return resultado
                }
                catch(err)
                {
                    throw new Error(err.message)
                }
            }
    }
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