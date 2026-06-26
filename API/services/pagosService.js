import pool from '../config/conexion.js'

export default function crearPagoService(Pago)
{
    const query = `
    CALL spu_crear_pago(
    $1, $2, $3, $4, $5)
    RETURNING *
    `
    const values = []

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