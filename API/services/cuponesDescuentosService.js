import pool from '../config/conexion.js'

export default function crearCuponDescuento(cuponDescuento)
{
    const query = `
    CALL spu_crear_descuento(
    $1, $2, $3, $4, $5, $6, $7, $8)
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