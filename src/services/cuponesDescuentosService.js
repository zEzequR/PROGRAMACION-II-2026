import pool from '../config/conexion.js'

export async function crearCuponService(cupon)
{
    const query = `
        INSERT INTO cupones_descuento (id_tienda, codigo, tipo, valor, fecha_expiracion, usos_maximos, usos_actuales)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_cupon_desc
    `    
    try
    {
        const resultado = await pool.query(query, [
            cupon.idTienda,
            cupon.codigo,
            cupon.tipoDescuento,
            cupon.valor,
            cupon.fechaExpiracion,
            cupon.usosMaximos,
            cupon.usosActuales
        ]);

        if (cupon.aplicaTienda === false && Array.isArray(cupon.idProductos) && cupon.idProductos.length > 0)
        {
            const idCuponDesc = resultado.rows[0].id_cupon_desc;
            for (const idProducto of cupon.idProductos)
            {
                await pool.query(
                    `INSERT INTO cupones_descuentos_productos (id_cupon_desc, id_producto)
                    VALUES ($1, $2);`,
                    [idCuponDesc, idProducto]
                );
            }
        }
        return true
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function eliminarCuponService(cupon)
{
    const values = [
        cupon.idCuponDesc,
        cupon.idTienda
    ];
    
    try
    {
        await pool.query(`
            DELETE FROM cupones_descuentos_productos
            WHERE id_cupon_desc = $1;
        `, [values[0]]);

        await pool.query(`
            DELETE FROM cupones_descuento
            WHERE id_cupon_desc = $1 AND id_tienda = $2;
        `, values);
        return true;
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function modificarCuponService(cupon)
{
    const query = `
        UPDATE cupones_descuento
        SET
        codigo = COALESCE($3, codigo),
        tipo = COALESCE($4, tipo),
        valor = COALESCE($5, valor),
        fecha_expiracion = COALESCE($6, fecha_expiracion),
        usos_maximos = COALESCE($7, usos_maximos),
        usos_actuales = COALESCE($8, usos_actuales)
        WHERE id_cupon_desc = $1
        AND id_tienda = $2;
    `
    const values = [
        cupon.idCuponDesc,
        cupon.idTienda,
        cupon.codigo,
        cupon.tipoDescuento,
        cupon.valor,
        cupon.fechaExpiracion,
        cupon.usosMaximos,
        cupon.usosActuales,
    ];
    
    try
    {
        await pool.query(query, values);

        if (cupon.aplicaTienda === false && Array.isArray(cupon.idProductos))
        {
            await pool.query(
                `DELETE FROM cupones_descuentos_productos WHERE id_cupon_desc = $1;`,
                [cupon.idCuponDesc]
            );

            for (const idProducto of cupon.idProductos)
            {
                await pool.query(
                    `INSERT INTO cupones_descuentos_productos (id_cupon_desc, id_producto)
                    VALUES ($1, $2);`,
                    [cupon.idCuponDesc, idProducto]
                );
            }
        }
        
        return true;
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}