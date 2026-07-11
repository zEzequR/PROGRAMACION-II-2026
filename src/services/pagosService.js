import pool from '../config/conexion.js'

export async function crearPagoService(Pago)
{
    const query = `
    CALL spu_crear_pago($1, $2, $3, $4)
    `
    const values =
    [
        Pago.idTransaccion,
        Pago.estado,
        Pago.metodoPago,
        Pago.monto
    ]

    try
    {
        const resultado = await pool.query(query, values);
        return resultado
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function actualizarPagoService(Pago)
{
    const query = `
    CALL spu_actualizar_pago($1, $2, $3)
    `
    const values =
    [
        Pago.idDetPago,
        Pago.idTransaccion,
        Pago.estado
    ]

    try
    {
        const resultado = await pool.query(query, values);
        return resultado
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}