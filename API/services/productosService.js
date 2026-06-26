import pool from '../config/conexion.js'

export async function crearProductoService(Producto)
{
    const query = + `
        CALL spu_crear_producto(
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11)
        RETURNING *
    `
    const values = [];
    
    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function modificarProductoService(Producto)
{
    const query = + `
        CALL spu_modificar_producto(
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12)
        RETURNING *
    `
    const values = [];
    
    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function eliminarProductoService(idProducto, idTienda)
{
    const query = + `
        CALL spu_modificar_producto(
        $1, $2)
        RETURNING *
    `
    const values = [];
    
    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function reactivarProductoService(idProducto, idTienda)
{
    const query = + `
        CALL spu_reactivar_producto(
        $1, $2)
        RETURNING *
    `
    const values = [];
    
    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
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
        case '1':
            {
                const query = + `
                    SELECT * FROM vw_obtener_productos
                    RETURNING *
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
                const query = + `
                    CALL fn_ver_productos_por_filtros(
                    $1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
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

export async function crearCuponService(cupon)
{
    const query = + `
        CALL spu_crear_cupon_descuento(
        $1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `
    const values = [];
    
    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function eliminarCuponService(idCupon, idTienda, aplicaProd)
{
    const query = + `
        CALL spu_eliminar_cupon_descuento(
        $1, $2, $3)
        RETURNING *
    `
    const values = [];
    
    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function modificarCuponService(cupon)
{
    const query = + `
        CALL spu_modificar_cupon_descuento(
        $1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `
    const values = [];
    
    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

async function crearEspecificacionesAtributosService(categoria)
{
    const query = + `
        CALL spu_crear_especificaciones_producto(
        $1, $2, $3, $4)
        RETURNING *
    `
    const values = [];
    
    try
    {
        const resultado = await pool.query(query, values);
        return resultado.rows[0]
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}