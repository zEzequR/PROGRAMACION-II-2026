import pool from '../config/conexion.js'
import { buscarProductoPorId } from './productosService.js';
import { Productos } from '../models/productos.js';

export async function crearCuponService(cupon)
{
    const query = `
        INSERT INTO cupones_descuento (id_tienda, codigo, tipo, valor, fecha_expiracion, usos_maximos, usos_actuales)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_cupon_desc
    ` 

    try
    {
        const cuponMismoCodigo = await buscarCuponPorCodigo(cupon);

        if (cuponMismoCodigo)
        {
            throw new Error("Ya tenés un cupón con ese código");
        }


        if (cupon.aplicaTienda === false)
        {
            for (const idProducto of cupon.idProductos)
            {
                const productoActual = await buscarProductoPorId(new Productos({ idProducto: idProducto }));

                if (!productoActual || productoActual.id_tienda !== cupon.idTienda)
                {
                    throw new Error("Hay productos que no existen o no son de tu tienda");
                }
            }

        }

        
        const resultado = await pool.query(query, [
            cupon.idTienda,
            cupon.codigo,
            cupon.tipoDescuento,
            cupon.valor,
            cupon.fechaExpiracion,
            cupon.usosMaximos,
            cupon.usosActuales
        ]);

        const idCuponDesc = resultado.rows[0].id_cupon_desc;

        if (cupon.aplicaTienda === false && Array.isArray(cupon.idProductos) && cupon.idProductos.length > 0)
        {
            for (const idProducto of cupon.idProductos)
            {
                await pool.query(
                    `INSERT INTO cupones_descuentos_productos (id_cupon_desc, id_producto)
                    VALUES ($1, $2);`,
                    [idCuponDesc, idProducto]
                );
            }
        }

        return idCuponDesc;

    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function eliminarCuponService(cupon)
{
    
    try
    {
        const cuponActual = await buscarCuponPorId(cupon);

        if (!cuponActual || cuponActual.id_tienda !== cupon.idTienda)
        {
            return false;
        }

        await pool.query(`DELETE FROM cupones_descuentos_productos WHERE id_cupon_desc = $1;`, [cupon.idCuponDesc]);
        await pool.query(`DELETE FROM cupones_descuento WHERE id_cupon_desc = $1;`, [cupon.idCuponDesc]);
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
        usos_maximos = COALESCE($7, usos_maximos)
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
        cupon.usosMaximos
    ];
    
    try
    {
        const cuponActual = await buscarCuponPorId(cupon);

        if (!cuponActual || cuponActual.id_tienda !== cupon.idTienda)
        {
            return false;
        }

        if (cupon.codigo !== undefined)
        {
            const cuponMismoCodigo = await buscarCuponPorCodigo(cupon);

            if (cuponMismoCodigo && cuponMismoCodigo.id_cupon_desc !== cupon.idCuponDesc)
            {
                throw new Error("Ya tenés un cupón con ese código");
            }
        }

        if (cupon.aplicaTienda === false)
        {
            for (const idProducto of cupon.idProductos)
            {
                const productoActual = await buscarProductoPorId(new Productos({ idProducto: idProducto }));

                if (!productoActual || productoActual.id_tienda !== cupon.idTienda)
                {
                    throw new Error("Hay productos que no existen o no son de tu tienda");
                }
            }
        }

        const resultado = await pool.query(query, values);

        if (resultado.rowCount === 0)
        {
            return false;
        }

        if (cupon.aplicaTienda === true)
        {
            await pool.query(
                `DELETE FROM cupones_descuentos_productos WHERE id_cupon_desc = $1;`,
                [cupon.idCuponDesc]
            );
        }

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

export async function obtenerCuponesTiendaService(cupon)
{
    const query = `
        SELECT id_cupon_desc, codigo, tipo, valor, fecha_expiracion, usos_maximos,
            COALESCE(usos_actuales, 0) AS usos_actuales
        FROM cupones_descuento
        WHERE id_tienda = $1
        ORDER BY fecha_expiracion NULLS LAST, codigo
    `;

    try
    {
        const resultado = await pool.query(query, [cupon.idTienda]);
        return resultado.rows;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function buscarCuponPorId(cupon)
{
    const query = `
        SELECT id_cupon_desc, id_tienda, codigo, tipo, valor, fecha_expiracion, usos_maximos,
            COALESCE(usos_actuales, 0) AS usos_actuales
        FROM cupones_descuento
        WHERE id_cupon_desc = $1
    `;

    try
    {
        const resultado = await pool.query(query, [cupon.idCuponDesc]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return resultado.rows[0];
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function buscarCuponPorCodigo(cupon)
{
    const query = `
        SELECT id_cupon_desc, id_tienda, codigo, tipo, valor, usos_maximos,
            COALESCE(usos_actuales, 0) AS usos_actuales,
            (fecha_expiracion IS NOT NULL AND fecha_expiracion < CURRENT_DATE) AS vencido
        FROM cupones_descuento
        WHERE id_tienda = $1 AND LOWER(codigo) = LOWER($2)
    `;

    try
    {
        const resultado = await pool.query(query, [cupon.idTienda, cupon.codigo]);

        if (resultado.rows.length === 0)
        {
            return null;
        }

        return resultado.rows[0];
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}
