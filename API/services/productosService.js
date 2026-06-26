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