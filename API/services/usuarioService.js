import pool from '../config/conexion.js'

export async function registrarseManualService(user)
{
    const query = `
        INSERT INTO Personas(
        id_persona,
        email,
        psw,
        tipo_auth,
        nombre,
        apellido,
        telefono)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `
    const values = [user.id_persona, user.email, user.psw, user.tipo_auth,
        user.nombre, user.apellido, user.telefono]

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