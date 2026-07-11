import pool from '../config/conexion.js'

export async function crearCuponService(cupon, idTienda, aplica, listaProd)
{
    const query = `
        CALL spu_crear_cupon_descuento(
        $1, $2, $3, $4, $5, $6, $7, $8)
    `
    const values = [
        idTienda,
        cupon.codigo,
        cupon.tipoDescuento,
        cupon.valor,
        cupon.fechaExpiracion,
        cupon.usosMaximos,
        aplica,
        listaProd
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

export async function eliminarCuponService(idCupon, idTienda)
{
    const query = `
        CALL spu_eliminar_cupon_descuento(
        $1, $2)
    `
    const values = [
        idCupon,
        idTienda
    ];
    
    try
    {
        const resultado = await pool.query(query, values);
        return true;
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function modificarCuponService(idCupon, cupon, idTienda, aplicaProducto, listaProd)
{
    const query = `
        CALL spu_modificar_cupon_descuento(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `
    const values = [
        idCupon, idTienda,
        cupon.codigo,
        cupon.tipoDescuento,
        cupon.valor,
        cupon.fechaExpiracion,
        cupon.usosMaximos,
        cupon.usosActuales,
        aplicaProducto,
        listaProd
    ];
    
    try
    {
        const resultado = await pool.query(query, values);
        return true;
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}